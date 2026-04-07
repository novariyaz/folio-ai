-- Phase 3: JD Analysis Table

CREATE TABLE public.jd_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
    job_description TEXT NOT NULL,
    match_score INTEGER,
    keywords_found JSONB DEFAULT '[]'::jsonb,
    keywords_missing JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies
ALTER TABLE public.jd_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own JD analysis"
    ON public.jd_analysis FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own JD analysis"
    ON public.jd_analysis FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own JD analysis"
    ON public.jd_analysis FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own JD analysis"
    ON public.jd_analysis FOR DELETE
    USING (auth.uid() = user_id);
