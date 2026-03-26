#!/usr/bin/env node
/**
 * Judiciary Fleet Management System - Firebase Seed (Drivers + Vehicles)
 * Seeds Firestore drivers and vehicles collections.
 * Usage: node migrations/seed-firebase.mjs
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const scripts = ['seed-firebase-drivers.mjs', 'seed-firebase-vehicles.mjs'];

async function run(script) {
  return new Promise((resolve, reject) => {
    const scriptPath = join(__dirname, script).replace(/\\/g, '/');
    const cmd = `node "${scriptPath}"`;
    const child = spawn(cmd, {
      stdio: 'inherit',
      shell: true,
      cwd: root,
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Exit ${code}`))));
  });
}

async function main() {
  console.log('🌱 Firebase seed - drivers & vehicles\n');
  for (const script of scripts) {
    await run(script);
  }
  console.log('✅ All seeds completed.\n');
}

main().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
