-- Supabase subscription model (minimal)
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'free',
  plan text,
  current_period_end timestamptz,
  polar_customer_id text,
  polar_subscription_id text,
  updated_at timestamptz default timezone('utc', now())
);

alter table public.subscriptions enable row level security;

create policy "subscription owner read" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "service role upsert" on public.subscriptions
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
