#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { KyyInfinite } from '../src/index.js';
import { readConfig, writeConfig, clearConfig, configPath } from '../src/config.js';

const [, , command, subcommand, ...rest] = process.argv;

function flag(name, fallback) {
  const index = rest.indexOf(`--${name}`);
  if (index === -1) return fallback;
  return rest[index + 1];
}

function hasFlag(name) {
  return rest.includes(`--${name}`);
}

function ask(question, { mask = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    if (mask) {
      const originalWrite = rl._writeToOutput.bind(rl);
      rl._writeToOutput = (text) => {
        originalWrite(text.replace(/./g, '*').includes('\n') ? text : '*'.repeat(text.length) || text);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (mask) process.stdout.write('\n');
      resolve(answer.trim());
    });
  });
}

async function loadClient({ requireAuth = false } = {}) {
  const config = await readConfig();
  const client = new KyyInfinite({
    baseUrl: config?.baseUrl,
    apiKey: config?.apiKey,
    idToken: config?.idToken,
    refreshToken: config?.refreshToken,
    firebaseApiKey: config?.firebaseApiKey,
  });

  if (requireAuth) {
    if (!config?.refreshToken && !config?.apiKey) {
      console.error('Not logged in and no API key set. Run `kyyinfinite login` or `kyyinfinite use-key <key>`.');
      process.exit(1);
    }
    if (config?.refreshToken) {
      await client.auth.refresh();
      await writeConfig({ ...config, idToken: client.auth.idToken, refreshToken: client._refreshToken });
    }
  }

  return client;
}

async function cmdLogin() {
  const existing = await readConfig();
  const firebaseApiKey =
    flag('firebase-key') || existing?.firebaseApiKey || (await ask('Firebase Web API key (from your KyyInfinite deployment): '));
  const email = flag('email') || (await ask('Email: '));
  const password = flag('password') || (await ask('Password: ', { mask: true }));

  const client = new KyyInfinite({ firebaseApiKey });
  const session = await client.auth.loginWithEmail(email, password);

  await writeConfig({
    firebaseApiKey,
    baseUrl: existing?.baseUrl,
    idToken: session.idToken,
    refreshToken: session.refreshToken,
    uid: session.uid,
    email,
  });

  console.log(`Logged in as ${email}. Config saved to ${configPath()}`);
}

async function cmdLogout() {
  await clearConfig();
  console.log('Logged out.');
}

async function cmdUseKey(apiKey) {
  if (!apiKey) {
    console.error('Usage: kyyinfinite use-key <kyy_xxxxxxxx...>');
    process.exit(1);
  }
  const existing = await readConfig();
  await writeConfig({ ...existing, apiKey });
  console.log(`API key saved to ${configPath()}. No Firebase login needed — this is the bot/script path.`);
}

async function cmdWhoami() {
  const config = await readConfig();
  if (config?.refreshToken) {
    console.log(`${config.email || '(unknown email)'} — uid: ${config.uid}`);
    return;
  }
  if (config?.apiKey) {
    console.log(`Using API key ${config.apiKey.slice(0, 12)}… (no Firebase session)`);
    return;
  }
  console.log('Not logged in.');
}

async function cmdSnippetUpload(filePath) {
  if (!filePath) {
    console.error('Usage: kyyinfinite snippet upload <file> --title "..." --language javascript [--description "..."] [--tags a,b,c]');
    process.exit(1);
  }
  const client = await loadClient({ requireAuth: true });
  const code = await readFile(filePath, 'utf-8');
  const title = flag('title', filePath.split('/').pop());
  const language = flag('language', 'javascript');
  const description = flag('description', `Uploaded from ${filePath} via the CLI`);
  const tags = (flag('tags', '') || '').split(',').map((tag) => tag.trim()).filter(Boolean);

  const result = await client.snippets.submit({ title, description, language, code, tags });
  console.log(result.message || 'Submitted.');
  console.log(`Snippet id: ${result.snippet._id} (status: ${result.snippet.status})`);
}

async function cmdSnippetList() {
  const mine = hasFlag('mine');
  const search = flag('search');
  const client = await loadClient({ requireAuth: mine });
  const snippets = mine ? (await client.snippets.listMine()).snippets : await client.snippets.list({ search });

  if (snippets.length === 0) {
    console.log('No snippets found.');
    return;
  }
  for (const snippet of snippets) {
    const status = snippet.status ? ` [${snippet.status}]` : '';
    console.log(`${snippet._id}  ${snippet.title}  (${snippet.language})${status}`);
  }
}

async function cmdSnippetRaw(id) {
  if (!id) {
    console.error('Usage: kyyinfinite snippet raw <id>');
    process.exit(1);
  }
  const client = await loadClient();
  process.stdout.write(await client.snippets.getRaw(id));
}

async function cmdStatus() {
  const client = await loadClient();
  const [health, incidents] = await Promise.all([
    client.status.health().catch(() => null),
    client.status.incidents().catch(() => []),
  ]);
  console.log(health ? 'API: operational' : 'API: unreachable');
  const active = incidents.filter((incident) => incident.status !== 'resolved');
  if (active.length === 0) {
    console.log('No active incidents.');
  } else {
    for (const incident of active) {
      console.log(`[${incident.severity}] ${incident.title} — ${incident.status}`);
    }
  }
}

function printHelp() {
  console.log(`kyyinfinite <command>

  login                              Sign in with email/password
  logout                             Clear the local session
  use-key <apiKey>                   Use an API key instead of logging in (the bot/script path — needs a key with the snippets:write scope)
  whoami                             Show who's currently logged in
  snippet upload <file> [flags]      Submit a snippet for review
    --title, --language, --description, --tags a,b,c
  snippet list [--mine] [--search q] List public snippets, or your own
  snippet raw <id>                   Print a snippet's raw code to stdout
  status                             Show API health and active incidents
`);
}

async function main() {
  try {
    if (command === 'login') return await cmdLogin();
    if (command === 'logout') return await cmdLogout();
    if (command === 'use-key') return await cmdUseKey(subcommand);
    if (command === 'whoami') return await cmdWhoami();
    if (command === 'status') return await cmdStatus();
    if (command === 'snippet' && subcommand === 'upload') return await cmdSnippetUpload(rest[0]);
    if (command === 'snippet' && subcommand === 'list') return await cmdSnippetList();
    if (command === 'snippet' && subcommand === 'raw') return await cmdSnippetRaw(rest[0]);
    printHelp();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
