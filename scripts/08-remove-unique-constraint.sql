-- Remove unique constraint to allow multiple marks per student per judge
-- This allows judges to add/subtract marks instead of overriding

-- Drop the unique constraint
ALTER TABLE individual_marks DROP CONSTRAINT IF EXISTS individual_marks_student_id_judge_id_key;

-- Add a comment explaining the change
COMMENT ON TABLE individual_marks IS 'Individual marks table - allows multiple marks per student per judge for accumulating scores'; 