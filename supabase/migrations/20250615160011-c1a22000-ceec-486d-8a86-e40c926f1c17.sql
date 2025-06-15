
-- Create task_bids table for artists to bid on specific tasks
CREATE TABLE public.task_bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  bidder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'V3C',
  timeline_days INTEGER,
  proposal TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'negotiating')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, bidder_id)
);

-- Create task_assignments table for approved task work
CREATE TABLE public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bid_id UUID REFERENCES public.task_bids(id) ON DELETE SET NULL,
  agreed_amount NUMERIC NOT NULL,
  agreed_currency TEXT NOT NULL DEFAULT 'V3C',
  agreed_timeline_days INTEGER,
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  start_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(task_id)
);

-- Create project_shares table for producer-to-studio sharing
CREATE TABLE public.project_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  producer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  studio_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  access_level TEXT NOT NULL DEFAULT 'view' CHECK (access_level IN ('view', 'bid', 'full')),
  UNIQUE(project_id, studio_id)
);

-- Create bid_negotiations table for back-and-forth negotiations
CREATE TABLE public.bid_negotiations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bid_id UUID NOT NULL REFERENCES public.task_bids(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  proposed_amount NUMERIC,
  proposed_timeline_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.task_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_negotiations ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_bids
CREATE POLICY "Users can view bids for their tasks or their own bids"
  ON public.task_bids FOR SELECT
  USING (
    bidder_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.tasks t 
      JOIN public.shots s ON t.shot_id = s.id 
      JOIN public.sequences seq ON s.sequence_id = seq.id 
      JOIN public.projects p ON seq.project_id = p.id 
      WHERE t.id = task_bids.task_id AND p.client_id = auth.uid()
    )
  );

CREATE POLICY "Artists can create bids on tasks"
  ON public.task_bids FOR INSERT
  WITH CHECK (bidder_id = auth.uid());

CREATE POLICY "Bidders can update their own bids"
  ON public.task_bids FOR UPDATE
  USING (bidder_id = auth.uid());

-- RLS policies for task_assignments
CREATE POLICY "Users can view assignments they're involved in"
  ON public.task_assignments FOR SELECT
  USING (artist_id = auth.uid() OR studio_id = auth.uid());

CREATE POLICY "Studios can create assignments"
  ON public.task_assignments FOR INSERT
  WITH CHECK (studio_id = auth.uid());

CREATE POLICY "Studios and artists can update assignments"
  ON public.task_assignments FOR UPDATE
  USING (artist_id = auth.uid() OR studio_id = auth.uid());

-- RLS policies for project_shares
CREATE POLICY "Users can view shares they're involved in"
  ON public.project_shares FOR SELECT
  USING (producer_id = auth.uid() OR studio_id = auth.uid());

CREATE POLICY "Producers can create project shares"
  ON public.project_shares FOR INSERT
  WITH CHECK (producer_id = auth.uid());

CREATE POLICY "Involved parties can update project shares"
  ON public.project_shares FOR UPDATE
  USING (producer_id = auth.uid() OR studio_id = auth.uid());

-- RLS policies for bid_negotiations
CREATE POLICY "Users can view negotiations for their bids"
  ON public.bid_negotiations FOR SELECT
  USING (
    sender_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.task_bids tb 
      WHERE tb.id = bid_negotiations.bid_id AND tb.bidder_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.task_bids tb 
      JOIN public.tasks t ON tb.task_id = t.id 
      JOIN public.shots s ON t.shot_id = s.id 
      JOIN public.sequences seq ON s.sequence_id = seq.id 
      JOIN public.projects p ON seq.project_id = p.id 
      WHERE tb.id = bid_negotiations.bid_id AND p.client_id = auth.uid()
    )
  );

CREATE POLICY "Users can create negotiations for relevant bids"
  ON public.bid_negotiations FOR INSERT
  WITH CHECK (sender_id = auth.uid());

-- Add triggers for updated_at
CREATE TRIGGER update_task_bids_updated_at
  BEFORE UPDATE ON public.task_bids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
