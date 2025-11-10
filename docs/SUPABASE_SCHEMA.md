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

Make sure both your local `.env` file and Cloud Run service include:

| Variable | Purpose | Required In |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase URL exposed to the browser | Vite build |
| `VITE_SUPABASE_ANON_KEY` | Public anon key used by the browser | Vite build |
| `SUPABASE_URL` | URL used by the Node server to verify tokens | Cloud Run env / local server env |
| `SUPABASE_ANON_KEY` | Anon key used by the server for incoming token verification | Cloud Run env / local server env |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role key used for server-side workspace persistence | Cloud Run env / local server env (store securely, e.g., Secret Manager) |
| `GEMINI_API_KEY` | Required for any Gemini-powered features on the server | Cloud Run env / local server env |

If you deploy with `./deploy-keju.sh`, the script reads the `.env` file and forwards the values to Cloud Run automatically (you can still override them in the console if needed).

For a step-by-step deployment flow, see the “Environment Variables” and “Connect Cloud Run to Supabase” sections in the [README](../README.md).

That's it—every new signup now receives a pre-seeded profile row, and the frontend can safely sync documents/chats per user.
