-- +migrate Up

ALTER TABLE dm_threads ADD COLUMN IF NOT EXISTS participants TEXT[] DEFAULT '{}';

UPDATE dm_threads 
SET participants = string_to_array(substring(id from 4), '_') 
WHERE id LIKE 'dm_%_%' AND (participants IS NULL OR cardinality(participants) = 0);

CREATE INDEX IF NOT EXISTS idx_dm_threads_participants ON dm_threads USING GIN (participants);
