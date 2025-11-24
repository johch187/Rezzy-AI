# Supabase Schema & RLS (baseline)

Recommended tables:
- `profiles` (id UUID PK, email text, created_at timestamptz).
- `workspaces` (user_id UUID PK FK profiles.id, profile jsonb, document_history jsonb, career_chat_history jsonb, tokens int, updated_at timestamptz).
- `customers` (user_id UUID PK, polar_customer_id text).
- `subscriptions` (id UUID PK, user_id UUID FK, status text, plan text, current_period_end timestamptz).

RLS examples (enable RLS on relevant tables):
```sql
alter table workspaces enable row level security;
create policy "workspace owner read/write"
  on workspaces for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

Backend admin operations use `SUPABASE_SECRET_KEY` (format: `sb_secret_...`); client uses `VITE_SUPABASE_PUBLISHABLE_KEY` (format: `sb_publishable_...`). Legacy keys (anon/service_role) are no longer supported.

Auth redirect: set Supabase site URL to your Cloud Run base (or custom domain) and add `/#/builder` as redirect for magic links/OAuth. Update Cloud Run ALLOWED_ORIGINS accordingly.
