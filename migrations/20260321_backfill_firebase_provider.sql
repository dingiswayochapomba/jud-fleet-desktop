-- Backfill auth provider for existing users.
UPDATE users
SET auth_provider = 'firebase'
WHERE firebase_uid IS NOT NULL
  AND auth_provider IS DISTINCT FROM 'firebase';

-- Set a deterministic default for records not linked yet.
UPDATE users
SET auth_provider = 'supabase'
WHERE auth_provider IS NULL;
