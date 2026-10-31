-- +migrate Up

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    name VARCHAR(150) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    reporter VARCHAR(100) NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    action_taken VARCHAR(100) NOT NULL DEFAULT '',
    admin_note TEXT NOT NULL DEFAULT '',
    resolved_by VARCHAR(100) NOT NULL DEFAULT '',
    resolved_at VARCHAR(100) NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    admin_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    target VARCHAR(150) NOT NULL,
    details TEXT NOT NULL,
    timestamp VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS announcements (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'info',
    icon VARCHAR(10) NOT NULL DEFAULT '📢',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at VARCHAR(100) NOT NULL DEFAULT 'Today'
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
