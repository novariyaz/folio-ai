-- Phase 1 Schema: Core Foundation

-- 1. Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profile Policies
CREATE POLICY "Users can view their own profile."
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile."
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 2. Resumes Table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Resumes Policies
CREATE POLICY "Users can view their own resumes."
    ON resumes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes."
    ON resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes."
    ON resumes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes."
    ON resumes FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Messages Table (Chat History)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    chat_stage INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages Policies
CREATE POLICY "Users can view messages for their resumes."
    ON messages FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM resumes WHERE resumes.id = messages.resume_id AND resumes.user_id = auth.uid())
    );

CREATE POLICY "Users can insert messages for their resumes."
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM resumes WHERE resumes.id = messages.resume_id AND resumes.user_id = auth.uid())
    );

-- 4. Resume Metrics Table
CREATE TABLE resume_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
    grammar_score INTEGER CHECK (grammar_score >= 0 AND grammar_score <= 100),
    impact_score INTEGER CHECK (impact_score >= 0 AND impact_score <= 100),
    brevity_score INTEGER CHECK (brevity_score >= 0 AND brevity_score <= 100),
    overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resume_metrics ENABLE ROW LEVEL SECURITY;

-- Resume Metrics Policies
CREATE POLICY "Users can view metrics for their resumes."
    ON resume_metrics FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_metrics.resume_id AND resumes.user_id = auth.uid())
    );

CREATE POLICY "Users can insert metrics for their resumes."
    ON resume_metrics FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_metrics.resume_id AND resumes.user_id = auth.uid())
    );

CREATE POLICY "Users can update metrics for their resumes."
    ON resume_metrics FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM resumes WHERE resumes.id = resume_metrics.resume_id AND resumes.user_id = auth.uid())
    );
