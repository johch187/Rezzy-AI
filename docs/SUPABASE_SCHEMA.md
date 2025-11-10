# Supabase Schema & Automation

Follow this guide to provision the tables, policies, and triggers that Keju expects in Supabase. Run each SQL block inside the Supabase SQL editor (or `psql`). Everything is idempotent—rerunning a block won’t break existing data.

---

## 1. Profiles Table

This table stores the active profile plus cached document/chat history per user.

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb,
  document_history jsonb default '[]'::jsonb,
  career_chat_history jsonb default '[]'::jsonb,
  tokens integer default 65,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_profiles_updated_at();
```

---

## 2. Row-Level Security

Only allow each user to read and modify their own row. (Make sure RLS is enabled for `public.profiles` before creating the policy.)

```sql
alter table public.profiles enable row level security;

drop policy if exists "Users manage their own profile" on public.profiles;
create policy "Users manage their own profile"
  on public.profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);
```

---

## 3. Auto-Provision Profiles on Sign-Up

This trigger inserts a stub row every time a new Supabase Auth user is created, so the frontend never has to “race” to create it.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_name text;
  default_profile jsonb;
begin
  default_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    split_part(new.email, '@', 1),
    'My First Profile'
  );

  default_profile := jsonb_build_object(
    'id', new.id::text,
    'name', default_name,
    'fullName', '',
    'jobTitle', '',
    'email', new.email,
    'phone', '',
    'website', '',
    'location', '',
    'linkedin', '',
    'github', '',
    'summary', '',
    'education', '[]'::jsonb,
    'experience', '[]'::jsonb,
    'projects', '[]'::jsonb,
    'technicalSkills', '[]'::jsonb,
    'softSkills', '[]'::jsonb,
    'tools', '[]'::jsonb,
    'languages', '[]'::jsonb,
    'certifications', '[]'::jsonb,
    'interests', '[]'::jsonb,
    'customSections', '[]'::jsonb,
    'additionalInformation', '',
    'industry', '',
    'experienceLevel', 'entry',
    'vibe', '',
    'selectedResumeTemplate', 'classic',
    'selectedCoverLetterTemplate', 'professional',
    'targetJobTitle', '',
    'companyName', '',
    'companyKeywords', '',
    'keySkillsToHighlight', '',
    'careerPath', null
  );

  insert into public.profiles (id, profile)
  values (new.id, default_profile)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists trg_handle_new_user on auth.users;
create trigger trg_handle_new_user
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

---

## 4. Configuring Environment Variables

Set the following environment variables in your deployment platform (e.g., Google Cloud Run):

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon/public API key

For Cloud Run deployment, see [CLOUD_RUN_DEPLOYMENT.md](../CLOUD_RUN_DEPLOYMENT.md) for detailed instructions.

That's it—every new signup now receives a pre-seeded profile row, and the frontend can safely sync documents/chats per user.
