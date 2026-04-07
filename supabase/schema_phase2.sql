-- Phase 2 Schema: Variants and Cover Letters

CREATE TABLE resume_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    original_resume_id UUID REFERENCES resumes(id) ON DELETE CASCADE,
    job_title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    job_description TEXT,
    tailored_content JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Applied', 'Interviewing', 'Rejected', 'Offer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE resume_variants ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their variants" ON resume_variants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their variants" ON resume_variants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their variants" ON resume_variants FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their variants" ON resume_variants FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE cover_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    resume_variant_id UUID REFERENCES resume_variants(id) ON DELETE CASCADE,
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their cover letters" ON cover_letters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their cover letters" ON cover_letters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their cover letters" ON cover_letters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their cover letters" ON cover_letters FOR DELETE USING (auth.uid() = user_id);
