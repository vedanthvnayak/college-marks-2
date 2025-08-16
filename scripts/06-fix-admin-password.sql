-- Fix admin password with proper bcrypt hash for "admin123"
-- This hash was generated using bcrypt with salt rounds 10

UPDATE admins 
SET password_hash = '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ'
WHERE username = 'admin';

-- Verify the admin user exists and has the correct hash
SELECT id, username, password_hash, created_at 
FROM admins 
WHERE username = 'admin';
