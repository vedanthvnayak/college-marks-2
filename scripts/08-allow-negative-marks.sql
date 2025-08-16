-- Remove any check constraints that might prevent negative marks
ALTER TABLE individual_marks DROP CONSTRAINT IF EXISTS individual_marks_marks_check;
ALTER TABLE team_marks DROP CONSTRAINT IF EXISTS team_marks_marks_check;

-- Ensure marks columns can accept negative values
ALTER TABLE individual_marks ALTER COLUMN marks TYPE numeric;
ALTER TABLE team_marks ALTER COLUMN marks TYPE numeric;

-- Add a comment to clarify that negative marks are allowed
COMMENT ON COLUMN individual_marks.marks IS 'Marks awarded to student (can be positive or negative)';
COMMENT ON COLUMN team_marks.marks IS 'Marks awarded to team (can be positive or negative)';

-- Test inserting a negative value to verify it works
INSERT INTO individual_marks (id, judge_id, student_id, marks, comments) 
VALUES (
  gen_random_uuid(),
  (SELECT id FROM judges LIMIT 1),
  (SELECT id FROM students LIMIT 1),
  -10.5,
  'Test negative marks entry'
) ON CONFLICT DO NOTHING;

-- Clean up the test entry
DELETE FROM individual_marks WHERE comments = 'Test negative marks entry';
