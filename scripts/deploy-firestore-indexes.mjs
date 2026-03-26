#!/usr/bin/env node
/**
 * Create required Firestore composite indexes (Firestore Admin API).
 * Same credentials as deploy-firestore-rules / seed scripts.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { GoogleAuth } from 'google-auth-library';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function loadCredentials() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return JSON.parse(readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8'));
  }
  const local = resolve(root, 'serviceAccountKey.json');
  if (existsSync(local)) {
    return JSON.parse(readFileSync(local, 'utf8'));
  }
  console.error('Missing serviceAccountKey.json or GOOGLE_APPLICATION_CREDENTIALS.');
  process.exit(1);
}

const INDEXES = [
  {
    collectionGroup: 'notifications',
    body: {
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'user_id', order: 'ASCENDING' },
        { fieldPath: 'created_at', order: 'DESCENDING' },
      ],
    },
  },
  {
    collectionGroup: 'fuel_logs',
    body: {
      queryScope: 'COLLECTION',
      fields: [
        { fieldPath: 'vehicle_id', order: 'ASCENDING' },
        { fieldPath: 'refuel_date', order: 'DESCENDING' },
      ],
    },
  },
];

async function main() {
  const creds = loadCredentials();
  const projectId = creds.project_id;
  const dbId = encodeURIComponent('(default)');

  const auth = new GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  if (!token) {
    console.error('Could not get access token');
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const apiBase = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}`;

  for (const { collectionGroup, body } of INDEXES) {
    const url = `${apiBase}/collectionGroups/${collectionGroup}/indexes`;
    console.log(`POST index: ${collectionGroup} ...`);
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log(`  Started (operation may take a few minutes): ${data.name || 'ok'}`);
      continue;
    }
    const msg = data.error?.message || JSON.stringify(data);
    if (msg.includes('already exists') || msg.includes('ALREADY_EXISTS') || res.status === 409) {
      console.log(`  Already exists: ${collectionGroup}`);
      continue;
    }
    console.error(`  Error (${res.status}):`, msg);
  }

  console.log('\n✅ Done. New indexes show as "Building" in Firebase Console → Firestore → Indexes until ready.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
