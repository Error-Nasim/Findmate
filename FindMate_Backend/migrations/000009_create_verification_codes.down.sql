-- +migrate Down

DROP INDEX IF EXISTS idx_verification_codes_lookup;
DROP TABLE IF EXISTS verification_codes CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS is_verified;
