-- +migrate Up

CREATE TABLE IF NOT EXISTS join_requests (
    id VARCHAR(64) PRIMARY KEY,
    lobby_id VARCHAR(64) NOT NULL REFERENCES lobbies(id) ON DELETE CASCADE,
    user_id VARCHAR(64),
    name VARCHAR(100) NOT NULL,
    handle VARCHAR(60) NOT NULL,
    avatar VARCHAR(10) NOT NULL DEFAULT 'AN',
    tags JSONB NOT NULL DEFAULT '[]',
    reliability INT NOT NULL DEFAULT 95,
    team_ups INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_join_requests_lobby ON join_requests(lobby_id);
CREATE INDEX IF NOT EXISTS idx_join_requests_status ON join_requests(status);
CREATE INDEX IF NOT EXISTS idx_join_requests_handle ON join_requests(handle);
