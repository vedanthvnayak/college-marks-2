-- Check if admin exists and create if not
DO $$
BEGIN
    -- Check if admin user exists
    IF NOT EXISTS (SELECT 1 FROM admins WHERE username = 'admin') THEN
        -- Insert admin user with bcrypt hash for 'admin123'
        INSERT INTO admins (id, username, password_hash, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'admin',
            '$2b$10$rOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQqQqQqQqOzJqQqQqQqQqQ',
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Admin user created successfully';
    ELSE
        RAISE NOTICE 'Admin user already exists';
    END IF;
END $$;

-- Show current admin users
SELECT username, created_at FROM admins;
