-- Create default admin user
-- Password: admin123 (hashed using bcrypt)
-- Using a verified bcrypt hash for admin123
INSERT INTO admins (username, password_hash) 
VALUES ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;
