const PTERO_URL = process.env.PTERODACTYL_PANEL_URL;
const PTERO_API_KEY = process.env.PTERODACTYL_APPLICATION_API_KEY;

function pteroHeaders() {
  return {
    Authorization: `Bearer ${PTERO_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function pteroRequest(path, options = {}) {
  const response = await fetch(`${PTERO_URL}${path}`, {
    ...options,
    headers: { ...pteroHeaders(), ...(options.headers || {}) },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data && data.errors ? JSON.stringify(data.errors) : `Pterodactyl request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

function generateRandomPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 20; i += 1) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  return password;
}

async function findOrCreatePterodactylUser(guestEmail) {
  const search = await pteroRequest(`/api/application/users?filter[email]=${encodeURIComponent(guestEmail)}`);

  if (search.data && search.data.length > 0) {
    return search.data[0].attributes;
  }

  const usernameBase = guestEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const username = `${usernameBase}${Date.now().toString().slice(-5)}`;

  const created = await pteroRequest('/api/application/users', {
    method: 'POST',
    body: JSON.stringify({
      email: guestEmail,
      username,
      first_name: usernameBase || 'guest',
      last_name: 'kyyinfinite',
      password: generateRandomPassword(),
    }),
  });

  return created.attributes;
}

async function provisionServer({ guestEmail, product, orderId }) {
  const pteroUser = await findOrCreatePterodactylUser(guestEmail);

  const eggResponse = await pteroRequest(
    `/api/application/nests/${product.nestId}/eggs/${product.eggId}?include=startup`
  );

  const startupCommand = eggResponse.attributes.startup;
  const dockerImage = Object.values(eggResponse.attributes.docker_images || {})[0];

  const serverPayload = {
    name: `kyyinfinite-${orderId}`,
    user: pteroUser.id,
    egg: product.eggId,
    docker_image: dockerImage,
    startup: startupCommand,
    environment: eggResponse.attributes.relationships && eggResponse.attributes.relationships.variables
      ? Object.fromEntries(
          eggResponse.attributes.relationships.variables.data.map((v) => [
            v.attributes.env_variable,
            v.attributes.default_value,
          ])
        )
      : {},
    limits: {
      memory: product.ramLimit,
      swap: 0,
      disk: product.diskLimit,
      io: 500,
      cpu: product.cpuLimit,
    },
    feature_limits: { databases: 1, backups: 1, allocations: 1 },
    deploy: {
      locations: [product.locationId],
      dedicated_ip: false,
      port_range: [],
    },
  };

  const server = await pteroRequest('/api/application/servers', {
    method: 'POST',
    body: JSON.stringify(serverPayload),
  });

  return {
    pterodactylUserId: pteroUser.id,
    pterodactylServerId: server.attributes.id,
    serverIdentifier: server.attributes.identifier,
  };
}

module.exports = { provisionServer, findOrCreatePterodactylUser };
