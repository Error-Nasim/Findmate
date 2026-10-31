-- +migrate Up

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_official BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_tags (
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, tag_name)
);

CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
