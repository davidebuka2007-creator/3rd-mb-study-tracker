-- 1. Profiles Table linked to Supabase Auth
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  is_premium boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Official Topics Table (490 Curriculum Topics)
create table if not exists public.topics (
  id serial primary key,
  block text not null, -- 'Block One' or 'Block Two'
  department text not null, -- 'Morbid Anatomy', 'Chemical Pathology', etc.
  code text not null,
  title text not null,
  is_custom boolean default false not null
);

-- 3. User Topic Progress (Tracking status, history, notes)
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  topic_id integer references public.topics(id) on delete cascade not null,
  status text check (status in ('Not Started', 'In Progress', 'Completed')) default 'Not Started' not null,
  is_favorite boolean default false not null,
  is_tracked boolean default false not null,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, topic_id)
);

-- 4. Custom Topics Table (For Premium Users)
create table if not exists public.custom_topics (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  block text not null,
  department text not null,
  title text not null,
  status text check (status in ('Not Started', 'In Progress', 'Completed')) default 'Not Started' not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Payment Audit Logs Table
create table if not exists public.payment_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reference text unique not null,
  amount numeric not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS Security
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.custom_topics enable row level security;
alter table public.payment_logs enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

create policy "Users can view own progress." on public.user_progress for select using (auth.uid() = user_id);
create policy "Users can insert own progress." on public.user_progress for insert with check (auth.uid() = user_id);
create policy "Users can update own progress." on public.user_progress for update using (auth.uid() = user_id);

create policy "Users can manage own custom topics." on public.custom_topics for all using (auth.uid() = user_id);
create policy "Users can view own payment logs." on public.payment_logs for select using (auth.uid() = user_id);
