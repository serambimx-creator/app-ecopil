
-- Chat Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users" ON messages
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
