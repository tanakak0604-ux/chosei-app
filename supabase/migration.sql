-- when2meetスタイルへの移行
-- Supabase SQL Editor で実行してください

-- eventsテーブルに時間帯カラムを追加
ALTER TABLE events ADD COLUMN IF NOT EXISTS day_start text NOT NULL DEFAULT '09:00';
ALTER TABLE events ADD COLUMN IF NOT EXISTS day_end text NOT NULL DEFAULT '18:00';

-- 空き時間テーブル（新規）
CREATE TABLE IF NOT EXISTS availability (
  participant_id uuid REFERENCES participants(id) ON DELETE CASCADE NOT NULL,
  date_label text NOT NULL,
  time_start text NOT NULL,
  PRIMARY KEY (participant_id, date_label, time_start)
);

ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public select availability" ON availability FOR SELECT USING (true);
CREATE POLICY "public insert availability" ON availability FOR INSERT WITH CHECK (true);
