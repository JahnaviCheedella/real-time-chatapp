-- Run these once in your PostgreSQL database after creating the messages table

-- 1. Composite index for fast conversation queries
-- Speeds up: WHERE (sender_id = X AND receiver_id = Y) OR (sender_id = Y AND receiver_id = X)
CREATE INDEX idx_messages_sender_receiver ON messages (sender_id, receiver_id);

-- 2. Index on created_at for fast ORDER BY sorting
CREATE INDEX idx_messages_created_at ON messages (created_at);

-- 3. Combined index for the full query pattern (sender + receiver + time together)
CREATE INDEX idx_messages_conversation ON messages (sender_id, receiver_id, created_at ASC);
