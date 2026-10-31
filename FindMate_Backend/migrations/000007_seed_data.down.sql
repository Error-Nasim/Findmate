-- +migrate Down

DELETE FROM audit_logs;
DELETE FROM reports;
DELETE FROM announcements;
DELETE FROM dm_messages;
DELETE FROM dm_threads;
DELETE FROM join_requests;
DELETE FROM chat_messages;
DELETE FROM lobbies;
DELETE FROM user_ratings;
DELETE FROM users;
DELETE FROM tags;
DELETE FROM categories;
