-- +migrate Down

DROP INDEX IF EXISTS idx_dm_threads_participants;
ALTER TABLE dm_threads DROP COLUMN IF EXISTS participants;
