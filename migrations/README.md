# Firebase Migration Seeds

Seeds Firestore `drivers` and `vehicles` collections with sample data for the Judiciary Fleet Management System.

## Prerequisites

1. **Firebase Admin service account**
   - Go to [Firebase Console](https://console.firebase.google.com) → Project Settings → Service Accounts
   - Click "Generate new private key" and save the JSON file
   - Place it as `serviceAccountKey.json` in the project root **or** set `GOOGLE_APPLICATION_CREDENTIALS` to its path

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running the seeds

```bash
# Seed both drivers and vehicles
npm run seed:firebase

# Seed only drivers (14 records)
npm run seed:firebase:drivers

# Seed only vehicles (14 records)
npm run seed:firebase:vehicles
```

## Behavior

- **Idempotent**: Skips insertion if DL-* drivers or JJ-* vehicles already exist
- **To re-seed**: Delete existing DL-* drivers and JJ-* vehicles in Firebase Console → Firestore
- **Data shape**: Matches the app schema (`firebaseQueries.ts`)
