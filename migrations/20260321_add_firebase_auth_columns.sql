-- Add Firebase auth mapping columns to existing users table.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS firebase_uid TEXT,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'supabase';

-- Ensure one Firebase user cannot map to multiple records.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_firebase_uid
ON users(firebase_uid)
WHERE firebase_uid IS NOT NULL;

-- Keep provider values constrained.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_auth_provider_check'
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT users_auth_provider_check
      CHECK (auth_provider IN ('supabase', 'firebase'));
  END IF;
END
$$;
