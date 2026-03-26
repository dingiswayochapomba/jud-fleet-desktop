#!/usr/bin/env node
/**
 * Deploy firestore.rules using the same service account as seed scripts.
 * Requires serviceAccountKey.json in project root or GOOGLE_APPLICATION_CREDENTIALS.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleAuth } from 'google-auth-library';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const p = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    return JSON.parse(readFileSync(p, 'utf8'));
  }
  const local = resolve(root, 'serviceAccountKey.json');
  if (existsSync(local)) {
    return JSON.parse(readFileSync(local, 'utf8'));
  }
  console.error('Missing credentials. Add serviceAccountKey.json to project root or set GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

async function main() {
  const creds = loadCredentials();
  const projectId = creds.project_id;
  const rulesPath = resolve(root, 'firestore.rules');
  if (!existsSync(rulesPath)) {
    console.error('firestore.rules not found at', rulesPath);
    process.exit(1);
  }
  const rulesContent = readFileSync(rulesPath, 'utf8');

  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform', 'https://www.googleapis.com/auth/firebase'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    console.error('Could not get access token');
    process.exit(1);
  }

  const base = `https://firebaserules.googleapis.com/v1/projects/${projectId}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  console.log('Creating ruleset...');
  const createRes = await fetch(`${base}/rulesets`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      source: {
        files: [{ name: 'firestore.rules', content: rulesContent }],
      },
    }),
  });
  const createBody = await createRes.json();
  if (!createRes.ok) {
    console.error('Create ruleset failed:', createRes.status, JSON.stringify(createBody, null, 2));
    process.exit(1);
  }
  const rulesetName = createBody.name;
  console.log('Ruleset:', rulesetName);

  console.log('Publishing to Firestore...');
  const releaseName = `projects/${projectId}/releases/cloud.firestore`;
  // Only rulesetName may be updated; updateMask must be rulesetName (not "release")
  const releaseUrl = `${base}/releases/cloud.firestore?updateMask=rulesetName`;
  const patchRes = await fetch(releaseUrl, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({
      release: {
        name: releaseName,
        rulesetName,
      },
    }),
  });
  const patchBody = await patchRes.json();
  if (!patchRes.ok) {
    console.error('Release failed:', patchRes.status, JSON.stringify(patchBody, null, 2));
    process.exit(1);
  }

  console.log('✅ Firestore rules deployed for project', projectId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
