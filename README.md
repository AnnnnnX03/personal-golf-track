# MIA XU — Golf Training App v2

## ⚠️ Database Migration (upgrading from v1)

```sql
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS distance text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS direction text;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS body_note text;
```

## Fresh Install SQL

```sql
create table sessions (
  id uuid default gen_random_uuid() primary key,
  date date not null, club text not null, type text not null, note text,
  distance text, direction text, body_note text,
  smoothness integer default 0, contact integer default 0, body integer default 0,
  created_at timestamptz default now()
);
create table videos (
  id uuid default gen_random_uuid() primary key,
  date date not null, club text not null, type text not null,
  url text not null, filename text not null, created_at timestamptz default now()
);
alter table sessions enable row level security;
alter table videos enable row level security;
create policy "Allow all for sessions" on sessions for all using (true) with check (true);
create policy "Allow all for videos" on videos for all using (true) with check (true);
```

## Storage bucket: `swing-videos` (Public)

## .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

## Run
```bash
npm install && npm run dev
```
