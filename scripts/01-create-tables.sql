-- Create the database schema for college student evaluation system

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admins table for admin authentication
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Colleges table to store college information
CREATE TABLE IF NOT EXISTS colleges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table with roll number, name, group number
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    roll_no VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    group_no VARCHAR(50) NOT NULL,
    qr_code_data TEXT, -- Store QR code data/identifier
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(college_id, roll_no) -- Ensure unique roll numbers per college
);

-- Judges table with access codes and college assignments
CREATE TABLE IF NOT EXISTS judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    access_code VARCHAR(100) UNIQUE NOT NULL,
    access_code_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Individual marks table for student-specific scores
CREATE TABLE IF NOT EXISTS individual_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
    marks DECIMAL(5,2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, judge_id) -- One score per student per judge
);

-- Team marks table for group-specific scores
CREATE TABLE IF NOT EXISTS team_marks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    college_id UUID NOT NULL REFERENCES colleges(id) ON DELETE CASCADE,
    group_no VARCHAR(50) NOT NULL,
    judge_id UUID NOT NULL REFERENCES judges(id) ON DELETE CASCADE,
    marks DECIMAL(5,2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(college_id, group_no, judge_id) -- One score per team per judge
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_college_id ON students(college_id);
CREATE INDEX IF NOT EXISTS idx_students_group_no ON students(group_no);
CREATE INDEX IF NOT EXISTS idx_judges_college_id ON judges(college_id);
CREATE INDEX IF NOT EXISTS idx_judges_access_code ON judges(access_code);
CREATE INDEX IF NOT EXISTS idx_individual_marks_student_id ON individual_marks(student_id);
CREATE INDEX IF NOT EXISTS idx_individual_marks_judge_id ON individual_marks(judge_id);
CREATE INDEX IF NOT EXISTS idx_team_marks_college_group ON team_marks(college_id, group_no);
CREATE INDEX IF NOT EXISTS idx_team_marks_judge_id ON team_marks(judge_id);
