-- Supabase SQL Editor에 전체를 붙여넣고 Run 하세요.
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

drop policy if exists "users can read own tasks" on public.tasks;
create policy "users can read own tasks" on public.tasks
for select using (auth.uid() = user_id);

drop policy if exists "users can insert own tasks" on public.tasks;
create policy "users can insert own tasks" on public.tasks
for insert with check (auth.uid() = user_id);

drop policy if exists "users can update own tasks" on public.tasks;
create policy "users can update own tasks" on public.tasks
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users can delete own tasks" on public.tasks;
create policy "users can delete own tasks" on public.tasks
for delete using (auth.uid() = user_id);
