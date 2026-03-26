# Firestore composite indexes

Some queries need **composite indexes**. Without them, Firestore returns a link to create the index.

## Notifications (`user_id` + `created_at`)

**Fastest:** open the link from your error message (Firebase Console pre-fills the index), then click **Create index**. Wait until status is **Enabled** (often 1–5 minutes).

**Or:** after [Firebase CLI login](https://firebase.google.com/docs/cli):

```bash
firebase deploy --only firestore:indexes --project judiciary-fleet-management
```

This uses `firestore.indexes.json` in the project root (includes `notifications` and `fuel_logs`).

## Fuel logs (`vehicle_id` + `refuel_date`)

Same deploy command creates both indexes defined in `firestore.indexes.json`.

## Optional: let the API script work (403 fix)

If `npm run deploy:firestore-indexes` returns **permission denied**, grant the service account **Cloud Datastore Index Admin** (`roles/datastore.indexAdmin`) in [Google Cloud IAM](https://console.cloud.google.com/iam-admin/iam) for the project, or use the Console link / `firebase deploy` above instead.
