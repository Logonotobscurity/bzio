-- Admin Management SQL Script
-- Run this to remove unauthorized admin and set up proper admin management

-- 1. Check current admins
SELECT id, email, role FROM users WHERE role = 'admin';

-- 2. Remove admin role from bola@bzion.shop
UPDATE users SET role = 'customer' WHERE email = 'bola@bzion.shop';

-- 3. Ensure admin@bzion.shop is admin (create if not exists)
INSERT INTO users (email, role, "first_name", "last_name", "hashed_password", "created_at", "updated_at")
VALUES ('admin@bzion.shop', 'admin', 'Admin', 'User', '$2b$10$placeholder', NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 4. Verify final admin list
SELECT id, email, role, "created_at" FROM users WHERE role = 'admin';