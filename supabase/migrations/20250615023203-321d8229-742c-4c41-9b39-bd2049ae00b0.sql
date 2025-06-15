
-- Create table for saved filter presets
CREATE TABLE public.filter_presets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.filter_presets ENABLE ROW LEVEL SECURITY;

-- RLS policies for filter_presets
CREATE POLICY "Users can view their own filter presets" ON public.filter_presets 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own filter presets" ON public.filter_presets 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filter presets" ON public.filter_presets 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filter presets" ON public.filter_presets 
  FOR DELETE USING (auth.uid() = user_id);

-- Add trigger for updating updated_at
CREATE TRIGGER update_filter_presets_updated_at
  BEFORE UPDATE ON public.filter_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
