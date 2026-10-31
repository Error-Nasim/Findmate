-- +migrate Up

-- 1. Seed Official Categories
INSERT INTO categories (id, name, description) VALUES
    ('cat_gaming', 'Gaming', 'Competitive esports, co-op adventures, and casual matches'),
    ('cat_coding', 'Coding', 'Hackathon teams, LeetCode grind, and project collaborations'),
    ('cat_sports', 'Sports', 'Pickup basketball, football matches, and fitness runs'),
    ('cat_study', 'Study', 'Course review squads, exam prep, and homework study sessions'),
    ('cat_fitness', 'Fitness', 'Gym workout buddies, morning yoga flows, and running clubs')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Official Taxonomy Tags
INSERT INTO tags (id, name, is_official) VALUES
    ('tag_1', '#gaming', TRUE),
    ('tag_2', '#valorant', TRUE),
    ('tag_3', '#fps', TRUE),
    ('tag_4', '#ranked', TRUE),
    ('tag_5', '#chill', TRUE),
    ('tag_6', '#coding', TRUE),
    ('tag_7', '#leetcode', TRUE),
    ('tag_8', '#python', TRUE),
    ('tag_9', '#hackathon', TRUE),
    ('tag_10', '#sports', TRUE),
    ('tag_11', '#basketball', TRUE),
    ('tag_12', '#study', TRUE),
    ('tag_13', '#cse416', TRUE),
    ('tag_14', '#fitness', TRUE),
    ('tag_15', '#yoga', TRUE),
    ('tag_16', '#music', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Real Platform Users (Password for all 3: '1234')
-- Bcrypt Hash: $2a$10$vZUNCBxGnNs9U0HO9HQwcOo8sV4Lx9ux0rWl2ap52okvPaKg6EY62
INSERT INTO users (id, name, handle, email, password_hash, role, reliability, rooms_joined, rooms_completed, team_ups, bio, avatar, tags) VALUES
    ('u1', 'Abu Nasim', 'Error-nasim', 'nasim@findmate.local', '$2a$10$vZUNCBxGnNs9U0HO9HQwcOo8sV4Lx9ux0rWl2ap52okvPaKg6EY62', 'admin', 100, 0, 0, 0, 'Founder & Lead Developer of FindMate', 'AN', '["#gaming", "#coding", "#valorant"]'::jsonb),
    ('u2', 'Rimon Chandra Bhowmik', 'rimon21', 'rimon@findmate.local', '$2a$10$vZUNCBxGnNs9U0HO9HQwcOo8sV4Lx9ux0rWl2ap52okvPaKg6EY62', 'member', 100, 0, 0, 0, 'Software Engineer & FAANG Prep Coordinator', 'RB', '["#coding", "#leetcode", "#study"]'::jsonb),
    ('u3', 'Al Imtiaz', 'imtiaz11', 'imtiaz@findmate.local', '$2a$10$vZUNCBxGnNs9U0HO9HQwcOo8sV4Lx9ux0rWl2ap52okvPaKg6EY62', 'member', 100, 0, 0, 0, 'Community Member & Sports / Fitness Organizer', 'AI', '["#sports", "#basketball", "#fitness"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    handle = EXCLUDED.handle,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    reliability = EXCLUDED.reliability,
    bio = EXCLUDED.bio,
    avatar = EXCLUDED.avatar,
    tags = EXCLUDED.tags;

-- 4. Seed Platform Announcement
INSERT INTO announcements (id, title, message, type, icon, is_active, created_at) VALUES
    ('ann_1', '⚡ Welcome to FindMate!', 'Find teammates instantly across Gaming, Coding, Sports, and Study lobbies. Have fun and collaborate!', 'info', '⚡', TRUE, 'Today')
ON CONFLICT (id) DO NOTHING;
