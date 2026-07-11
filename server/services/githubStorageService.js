const { GITHUB_API_BASE, getGithubConfig, githubHeaders } = require('../config/github');

function buildRawUrl({ owner, repo, branch }, path) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

async function uploadFileToGithub(path, buffer, commitMessage) {
  const config = getGithubConfig();
  const url = `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: githubHeaders(config.token),
    body: JSON.stringify({
      message: commitMessage || `Upload ${path}`,
      content: buffer.toString('base64'),
      branch: config.branch,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `GitHub upload failed with status ${response.status}`);
  }

  return {
    downloadUrl: buildRawUrl(config, path),
    storagePath: path,
    sha: data.content.sha,
  };
}

async function deleteFileFromGithub(path) {
  const config = getGithubConfig();
  const url = `${GITHUB_API_BASE}/repos/${config.owner}/${config.repo}/contents/${path}`;

  const getResponse = await fetch(`${url}?ref=${config.branch}`, {
    headers: githubHeaders(config.token),
  });

  if (getResponse.status === 404) {
    return;
  }

  const fileData = await getResponse.json();

  const deleteResponse = await fetch(url, {
    method: 'DELETE',
    headers: githubHeaders(config.token),
    body: JSON.stringify({
      message: `Delete ${path}`,
      sha: fileData.sha,
      branch: config.branch,
    }),
  });

  if (!deleteResponse.ok) {
    const data = await deleteResponse.json().catch(() => ({}));
    throw new Error(data.message || `GitHub delete failed with status ${deleteResponse.status}`);
  }
}

module.exports = { uploadFileToGithub, deleteFileFromGithub };
