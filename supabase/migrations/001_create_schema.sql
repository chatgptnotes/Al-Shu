-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE user_role AS ENUM ('student', 'parent', 'teacher', 'admin');
CREATE TYPE board AS ENUM ('igcse', 'ib', 'a_level', 'cbse');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE assessment_type AS ENUM ('mcq', 'short_answer', 'long_answer', 'essay', 'practical');
CREATE TYPE coursework_type AS ENUM ('ia', 'ee', 'assignment', 'project');
CREATE TYPE coursework_status AS ENUM ('planning', 'research', 'drafting', 'review', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role DEFAULT 'student',
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    board board NOT NULL,
    grade_level INTEGER NOT NULL CHECK (grade_level BETWEEN 6 AND 13),
    school_name TEXT,
    subjects TEXT[] DEFAULT '{}',
    exam_dates JSONB,
    parent_id UUID REFERENCES parents(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parents table
CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teachers table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    school TEXT,
    subjects TEXT[] DEFAULT '{}',
    boards board[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    board board NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Topics table (hierarchical structure)
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES topics(id),
    objectives TEXT[] DEFAULT '{}',
    difficulty difficulty_level DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment items table
CREATE TABLE assessment_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stem TEXT NOT NULL,
    type assessment_type NOT NULL,
    difficulty difficulty_level DEFAULT 'medium',
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    board board NOT NULL,
    options JSONB,
    answer JSONB NOT NULL,
    explanation JSONB NOT NULL,
    hints TEXT[] DEFAULT '{}',
    source TEXT,
    mark_scheme JSONB,
    time_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Student attempts table
CREATE TABLE attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    assessment_item_id UUID NOT NULL REFERENCES assessment_items(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    response JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score NUMERIC(5,2),
    time_spent INTEGER NOT NULL,
    hints_used INTEGER DEFAULT 0,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study plans table
CREATE TABLE study_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    goals JSONB NOT NULL,
    schedule JSONB NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    adherence NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions table
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    study_plan_id UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coursework table
CREATE TABLE coursework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type coursework_type NOT NULL,
    status coursework_status DEFAULT 'planning',
    research_question TEXT,
    outline JSONB,
    sources JSONB,
    drafts JSONB,
    rubric JSONB,
    feedback JSONB,
    word_count INTEGER DEFAULT 0,
    target_word_count INTEGER,
    due_date DATE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcard decks table
CREATE TABLE flashcard_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Flashcards table
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    interval INTEGER DEFAULT 1,
    repetition INTEGER DEFAULT 0,
    ease_factor NUMERIC(3,2) DEFAULT 2.5,
    next_review_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress reports table
CREATE TABLE progress_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    period TEXT NOT NULL,
    summary JSONB NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    weaknesses TEXT[] DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    metrics JSONB NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File uploads table
CREATE TABLE file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    upload_purpose TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject_id UUID REFERENCES subjects(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_board ON students(board);
CREATE INDEX idx_topics_subject_id ON topics(subject_id);
CREATE INDEX idx_topics_parent_id ON topics(parent_id);
CREATE INDEX idx_assessment_items_subject_id ON assessment_items(subject_id);
CREATE INDEX idx_assessment_items_topic_id ON assessment_items(topic_id);
CREATE INDEX idx_attempts_student_id ON attempts(student_id);
CREATE INDEX idx_attempts_attempted_at ON attempts(attempted_at);
CREATE INDEX idx_flashcards_next_review_at ON flashcards(next_review_at);
CREATE INDEX idx_chat_sessions_student_id ON chat_sessions(student_id);
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);

-- RLS (Row Level Security) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coursework ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can access their own data)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Students can view own data" ON students
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Students can view own attempts" ON attempts
    FOR ALL USING (auth.uid() = (SELECT user_id FROM students WHERE id = attempts.student_id));

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();