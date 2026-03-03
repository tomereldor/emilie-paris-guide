-- Run this in Supabase SQL Editor to create your tables

CREATE TABLE IF NOT EXISTS people (
  name TEXT PRIMARY KEY,
  note TEXT NOT NULL,
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS recs (
  id TEXT PRIMARY KEY,
  by TEXT NOT NULL,
  cat TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hood TEXT,
  loc TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  tags JSONB DEFAULT '[]',
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE recs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_people" ON people FOR SELECT USING (true);
CREATE POLICY "read_recs" ON recs FOR SELECT USING (true);
CREATE POLICY "insert_people" ON people FOR INSERT WITH CHECK (true);
CREATE POLICY "insert_recs" ON recs FOR INSERT WITH CHECK (true);
CREATE POLICY "update_people" ON people FOR UPDATE USING (true);
