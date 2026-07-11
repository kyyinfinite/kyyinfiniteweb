const GITHUB_API_BASE = 'https://api.github.com';

function getGithubConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !owner || !repo) {
    throw new Error('GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO must be set');
  }

  return { token, owner, repo, branch };
}

function githubHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

module.exports = { GITHUB_API_BASE, getGithubConfig, githubHeaders };
