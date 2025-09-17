-- Add Fitbit integration columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitbit_access_token text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitbit_refresh_token text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitbit_user_id text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS fitbit_connected_at timestamp with time zone;