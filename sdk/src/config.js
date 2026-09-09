import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CONFIG_DIR = join(homedir(), '.kyyinfinite');
const CONFIG_PATH = join(CONFIG_DIR, 'config.json');

export async function readConfig() {
  if (!existsSync(CONFIG_PATH)) return null;
  const raw = await readFile(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function writeConfig(config) {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

export async function clearConfig() {
  if (existsSync(CONFIG_PATH)) await rm(CONFIG_PATH);
}

export function configPath() {
  return CONFIG_PATH;
}
