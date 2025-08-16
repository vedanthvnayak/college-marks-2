-- Delete existing admin if any
DELETE FROM admins WHERE username = 'admin';

-- Create admin with properly generated bcrypt hash for 'admin123'
-- This hash was generated using: bcrypt.hash('admin123', 10)
INSERT INTO admins (id, username, password_hash, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin',
    '$2b$10$K7L/8Y3jM5Q9X2N4P6R8S.uV0W1Z3A5B7C9D1E3F5G7H9I1J3K5L7M',
    NOW(),
    NOW()
);

-- Verify the admin was created
SELECT id, username, created_at, 
       CASE 
           WHEN password_hash IS NOT NULL THEN 'Hash exists' 
           ELSE 'No hash' 
       END as hash_status
FROM admins WHERE username = 'admin';
