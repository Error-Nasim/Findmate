-- +migrate Up

CREATE TABLE IF NOT EXISTS lobbies (
    id VARCHAR(64) PRIMARY KEY,
    host VARCHAR(100) NOT NULL,
    handle VARCHAR(60) NOT NULL,
    avatar VARCHAR(10) NOT NULL DEFAULT 'AN',
    title VARCHAR(150) NOT NULL,
    location VARCHAR(100) NOT NULL DEFAULT 'Discord',
    location_detail VARCHAR(255) NOT NULL DEFAULT '',
    tags JSONB NOT NULL DEFAULT '[]',
    match_score INT NOT NULL DEFAULT 95,
    joined INT NOT NULL DEFAULT 1,
    max_members INT NOT NULL DEFAULT 4,
    status VARCHAR(20) NOT NULL DEFAULT 'Open',
    pending_count INT NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL DEFAULT 'Gaming',
    color VARCHAR(20) NOT NULL DEFAULT '#6366F1',
    description TEXT NOT NULL DEFAULT '',
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lobbies_status ON lobbies(status);
CREATE INDEX IF NOT EXISTS idx_lobbies_category ON lobbies(category);
CREATE INDEX IF NOT EXISTS idx_lobbies_handle ON lobbies(handle);
CREATE INDEX IF NOT EXISTS idx_lobbies_is_pinned ON lobbies(is_pinned);
