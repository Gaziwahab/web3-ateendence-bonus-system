-- ==============================================================================
-- ATTENDANCE-LINKED INCENTIVE PROGRAM - SUPABASE DATABASE SCHEMA
-- ==============================================================================
-- This script creates the relational structure, indexes, RLS policies, and triggers
-- for the college attendance-linked blockchain reward system.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM OR CHECK CONSTRAINTS
-- Role check constraint: 'admin', 'faculty', 'student'
-- Status check constraint: 'present', 'absent'

-- 3. PROFILES TABLE (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'faculty', 'student')),
    student_id TEXT UNIQUE,
    wallet_address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for fast lookup by role and student_id
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON public.profiles(wallet_address);

-- 4. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_name TEXT NOT NULL,
    subject_code TEXT NOT NULL UNIQUE,
    faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    semester INTEGER NOT NULL CHECK (semester >= 1 AND semester <= 8),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subjects_faculty_id ON public.subjects(faculty_id);
CREATE INDEX IF NOT EXISTS idx_subjects_semester ON public.subjects(semester);

-- 5. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    marked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Prevent duplicate attendance submissions for the same student, subject and date
    CONSTRAINT unique_student_subject_date UNIQUE (student_id, subject_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_subject_id ON public.attendance(subject_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);

-- 6. REWARD RULES TABLE
CREATE TABLE IF NOT EXISTS public.reward_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    minimum_percentage NUMERIC(5,2) NOT NULL,
    maximum_percentage NUMERIC(5,2) NOT NULL,
    reward_points INTEGER NOT NULL CHECK (reward_points >= 0),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. REWARDS TABLE (On-Chain Distribution Tracking)
CREATE TABLE IF NOT EXISTS public.rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    semester_id INTEGER NOT NULL CHECK (semester_id >= 1 AND semester_id <= 8),
    attendance_percentage NUMERIC(5,2) NOT NULL,
    reward_points INTEGER NOT NULL CHECK (reward_points >= 0),
    transaction_hash TEXT,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Prevent duplicate rewards for the same student in the same semester
    CONSTRAINT unique_student_semester_reward UNIQUE (student_id, semester_id)
);

CREATE INDEX IF NOT EXISTS idx_rewards_student_id ON public.rewards(student_id);
CREATE INDEX IF NOT EXISTS idx_rewards_tx_hash ON public.rewards(transaction_hash);

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_rules ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is faculty
CREATE OR REPLACE FUNCTION public.is_faculty()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'faculty'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Allow authenticated users to view profiles (e.g. faculty viewing students, admin viewing all)
CREATE POLICY "Allow authenticated read profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own profile (e.g. student linking wallet)
CREATE POLICY "Allow users to update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can insert/update any profile
CREATE POLICY "Allow admin full profile management"
    ON public.profiles FOR ALL
    TO authenticated
    USING (public.is_admin());

-- SUBJECTS POLICIES
-- Everyone authenticated can view subjects
CREATE POLICY "Allow authenticated view subjects"
    ON public.subjects FOR SELECT
    TO authenticated
    USING (true);

-- Admins can insert, update, delete subjects
CREATE POLICY "Allow admin full subject management"
    ON public.subjects FOR ALL
    TO authenticated
    USING (public.is_admin());

-- ATTENDANCE POLICIES
-- Students can only view their own attendance
CREATE POLICY "Students can view own attendance"
    ON public.attendance FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid() 
        OR public.is_faculty() 
        OR public.is_admin()
    );

-- Faculty can insert attendance for their assigned subjects
CREATE POLICY "Faculty can insert attendance"
    ON public.attendance FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = subject_id AND faculty_id = auth.uid()
        )
    );

-- Faculty/Admin can update attendance
CREATE POLICY "Faculty and admin can update attendance"
    ON public.attendance FOR UPDATE
    TO authenticated
    USING (
        public.is_admin() OR 
        EXISTS (
            SELECT 1 FROM public.subjects
            WHERE id = subject_id AND faculty_id = auth.uid()
        )
    );

-- REWARDS POLICIES
-- Students can view their own rewards; faculty/admin can view all
CREATE POLICY "Students view own rewards"
    ON public.rewards FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        OR public.is_faculty()
        OR public.is_admin()
    );

-- Only Admin can insert/update rewards (after on-chain transaction)
CREATE POLICY "Admin can manage rewards"
    ON public.rewards FOR ALL
    TO authenticated
    USING (public.is_admin());

-- REWARD RULES POLICIES
CREATE POLICY "Everyone can view reward rules"
    ON public.reward_rules FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin can modify reward rules"
    ON public.reward_rules FOR ALL
    TO authenticated
    USING (public.is_admin());

-- 9. AUTH TRIGGER FOR PROFILE CREATION
-- Automatically populates profiles table when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, student_id, wallet_address)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
        NEW.raw_user_meta_data->>'student_id',
        NEW.raw_user_meta_data->>'wallet_address'
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        student_id = EXCLUDED.student_id,
        wallet_address = EXCLUDED.wallet_address;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. DEFAULT REWARD RULES SEED
INSERT INTO public.reward_rules (minimum_percentage, maximum_percentage, reward_points)
VALUES 
    (0.00, 74.99, 0),
    (75.00, 89.99, 20),
    (90.00, 100.00, 50)
ON CONFLICT DO NOTHING;
