-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  grade TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ideas table
CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'researching', 'validated', 'archived')),
  category TEXT,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  is_team_project BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create research_history table for idea research
CREATE TABLE public.research_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  research_type TEXT NOT NULL DEFAULT 'general',
  query TEXT NOT NULL,
  result TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create receipt_categories table
CREATE TABLE public.receipt_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#4F9D9A',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create receipts table
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.receipt_categories(id) ON DELETE SET NULL,
  vendor TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  date DATE,
  description TEXT,
  items JSONB,
  image_url TEXT,
  raw_text TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create email_drafts table for AI email helper
CREATE TABLE public.email_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT,
  recipient TEXT,
  occasion TEXT,
  topic TEXT,
  content TEXT NOT NULL,
  original_email TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('compose', 'reply', 'rewrite')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON public.receipts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_drafts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all operations (no auth required for this app)
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on ideas" ON public.ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on research_history" ON public.research_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on tasks" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on receipt_categories" ON public.receipt_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on receipts" ON public.receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on email_drafts" ON public.email_drafts FOR ALL USING (true) WITH CHECK (true);

-- Insert default receipt categories
INSERT INTO public.receipt_categories (name, color) VALUES 
  ('Supplies', '#4F9D9A'),
  ('Equipment', '#F59E0B'),
  ('Travel', '#8B5CF6'),
  ('Food', '#EF4444'),
  ('Other', '#6B7280');