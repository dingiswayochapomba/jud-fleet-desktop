# Firestore rules — fix “Missing or insufficient permissions”

The app uses the **Firebase client SDK** with **Firebase Auth**. Firestore must allow reads/writes for **signed-in** users, or every query will fail with `FirebaseError: Missing or insufficient permissions`.

## Option A — Firebase Console (fastest)

1. Open [Firebase Console](https://console.firebase.google.com) → your project **judiciary-fleet-management**
2. Go to **Build** → **Firestore Database** → **Rules**
3. Replace the rules with the contents of **`firestore.rules`** in this repo (root folder)
4. Click **Publish**

## Option B — One command (service account)

If `serviceAccountKey.json` is in the project root (same as seed scripts):

```bash
npm run deploy:firestore-rules
```

## Option C — Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase use judiciary-fleet-management
firebase deploy --only firestore:rules
```

## What the rules do

- **`request.auth != null`** — only users who have signed in with Firebase Auth can read/write.
- Collections covered: `users`, `vehicles`, `drivers`, `insurance`, `fuel_logs`, `notifications`, `vehicle_disposal`.

## Production hardening

- Restrict writes by **role** (e.g. custom claims or a `users/{uid}` role field).
- Limit `notifications` so users only read their own documents (e.g. `resource.data.user_id == request.auth.uid`).

## Composite indexes

If you see errors about **indexes** (not permissions), open the link in the error to create the suggested index in the console.
