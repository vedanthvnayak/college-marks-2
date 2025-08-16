-- Add assigned_roll_no column to students table
ALTER TABLE students ADD COLUMN IF NOT EXISTS assigned_roll_no VARCHAR(50);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_students_assigned_roll_no ON students(assigned_roll_no);
