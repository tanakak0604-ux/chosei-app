-- slotsテーブルに時間帯カラムを追加
-- Supabase SQL Editor で実行してください

ALTER TABLE slots ADD COLUMN IF NOT EXISTS time_start text NOT NULL DEFAULT '09:00';
ALTER TABLE slots ADD COLUMN IF NOT EXISTS time_end text NOT NULL DEFAULT '18:00';
