-- Create the songs table
CREATE TABLE public.songs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    cover_url TEXT,
    audio_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Create policies (For this simple demo, we'll allow public read and write access, 
-- but in a real app you'd want to restrict write access to authenticated admins only)
CREATE POLICY "Allow public read access" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON public.songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON public.songs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON public.songs FOR DELETE USING (true);