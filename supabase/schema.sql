-- イベント
create table events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  memo text,
  created_at timestamptz default now()
);

-- 日程候補
create table slots (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  date_label text not null,
  position integer not null default 0
);

-- 参加者
create table participants (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now()
);

-- 回答
create table answers (
  id uuid default gen_random_uuid() primary key,
  participant_id uuid references participants(id) on delete cascade not null,
  slot_id uuid references slots(id) on delete cascade not null,
  answer text not null check (answer in ('o', 'd', 'x')),
  unique(participant_id, slot_id)
);

-- RLS (公開アプリのため全許可)
alter table events enable row level security;
alter table slots enable row level security;
alter table participants enable row level security;
alter table answers enable row level security;

create policy "public select events" on events for select using (true);
create policy "public insert events" on events for insert with check (true);

create policy "public select slots" on slots for select using (true);
create policy "public insert slots" on slots for insert with check (true);

create policy "public select participants" on participants for select using (true);
create policy "public insert participants" on participants for insert with check (true);

create policy "public select answers" on answers for select using (true);
create policy "public insert answers" on answers for insert with check (true);
