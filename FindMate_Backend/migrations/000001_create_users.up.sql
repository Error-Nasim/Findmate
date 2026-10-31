-- +migrate Up

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    handle VARCHAR(60) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL DEFAULT '',
    role VARCHAR(20) NOT NULL DEFAULT 'member',
    is_banned BOOLEAN NOT NULL DEFAULT FALSE,
    reliability INT NOT NULL DEFAULT 96,
    rooms_joined INT NOT NULL DEFAULT 0,
    rooms_completed INT NOT NULL DEFAULT 0,
    team_ups INT NOT NULL DEFAULT 0,
    bio TEXT NOT NULL DEFAULT '',
    avatar VARCHAR(10) NOT NULL DEFAULT 'AN',
    tags JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_ratings (
    id VARCHAR(64) PRIMARY KEY,
    rater_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rater_name VARCHAR(100) NOT NULL,
    rater_handle VARCHAR(60) NOT NULL,
    rater_avatar VARCHAR(10) NOT NULL DEFAULT 'AN',
    ratee_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 1 AND score <= 5),
    comment TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_ratings_ratee ON user_ratings(ratee_id);
