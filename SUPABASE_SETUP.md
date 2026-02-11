# Supabase setup (after project was deleted)

Follow these steps to recreate your Supabase project and wire the app back up.

---

## 1. Create a new Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose your **organization** and set:
   - **Name**: e.g. `friendly`
   - **Database password**: choose a strong password and **save it** (you’ll need it for `.env`).
   - **Region**: pick one close to you.
4. Click **Create new project** and wait until it’s ready.

---

## 2. Get your project credentials

1. In the Supabase dashboard, open your new project.
2. Go to **Project Settings** (gear icon in the left sidebar) → **API**.
3. Copy and keep these for the next step:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
4. Go to **Project Settings** → **API** and find **JWT Secret** (under “JWT Settings”), or go to **Project Settings** → **Database** and use the same secret. Copy it → `SUPABASE_JWT_SECRET`.
5. Go to **Project Settings** → **Database**.
   - Copy **Connection string** and choose **URI**.
   - You’ll see a URI like:  
     `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres`
   - Replace `[PASSWORD]` with your database password if needed.
   - Use:
     - **Port 6543** (Transaction mode) for: `POSTGRES_URL`, `POSTGRES_PRISMA_URL` (add `?pgbouncer=true` for Prisma).
     - **Port 5432** (Session mode) for: `POSTGRES_URL_NON_POOLING`.
   - Also note: **Host** → `POSTGRES_HOST`, **Database** → `POSTGRES_DATABASE`, **User** → `POSTGRES_USER`, **Password** → `POSTGRES_PASSWORD`.

---

## 3. Update your `.env` and `.env.development.local`

Replace the old Supabase/Postgres values with the new ones. Use this as a checklist (replace `YOUR_*` with the values from step 2):

```env
# Supabase (from Project Settings → API)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your_anon_key...
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key...
SUPABASE_JWT_SECRET=your_jwt_secret_from_api_or_database_settings

# Postgres (from Project Settings → Database, connection string)
POSTGRES_URL="postgres://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"
POSTGRES_PRISMA_URL="postgres://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
POSTGRES_URL_NON_POOLING="postgres://postgres.YOUR_PROJECT_REF:YOUR_DB_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require"
POSTGRES_HOST=db.YOUR_PROJECT_REF.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_DB_PASSWORD
POSTGRES_DATABASE=postgres
```

- Update **both** `.env` and `.env.development.local` with the same Supabase/Postgres values.
- Keep your existing `AUTH_SECRET`, `OPENAI_API_KEY`, `NEXT_PUBLIC_MAPBOX_API_KEY` etc. as-is.
- **Security:** Never commit real keys to git. Your `.env` and `.env.development.local` should be in `.gitignore`.

---

## 4. Recreate the database schema (tables + RLS)

1. In Supabase dashboard, go to **SQL Editor**.
2. Open this repo file: `supabase-rebuild.sql`
3. Copy/paste it into a new SQL query and run it.

This creates:

- `public.profiles` (optional, auto-created on signup)
- `public.surveys` (saved per user with `user_id`)
- `public.survey_activities` (cached OpenAI output per survey)

It also enables RLS and adds per-user policies.

---

## 5. Configure Auth (Google OAuth)

If you use Supabase Auth (e.g. Google):

1. **Authentication** → **Providers** → enable **Google** and add your OAuth client ID/secret.
2. **URL Configuration** (under Auth settings):
   - **Site URL**: e.g. `http://localhost:3000` (dev) or your production URL.
   - **Redirect URLs**: add `http://localhost:3000/**` and `https://your-production-domain.com/**`.

Important:

- Set Google’s **Authorized redirect URI** to `https://<your-project-ref>.supabase.co/auth/v1/callback`
- In Supabase **Auth → URL Configuration**, add redirect URLs for your app:
  - `http://localhost:3000/**`
  - `https://your-production-domain.com/**`

This repo includes `/login` (Google sign-in) and `/auth/callback` (exchanges the code for a session).

---

## 6. Verify the app

1. Restart the Next.js dev server (so it picks up new env vars).
2. In the app, **sign in with Google** at `/login`.
3. Submit the survey on `/`.
4. In Supabase **Table Editor**:
   - `surveys`: confirm a new row appears with your `user_id`
   - `survey_activities`: confirm OpenAI output was saved after visiting results

---

## Quick checklist

- [ ] New Supabase project created
- [ ] All credentials copied from **Project Settings** → API and Database
- [ ] `.env` and `.env.development.local` updated (no old project IDs/keys left)
- [ ] `supabase-rebuild.sql` applied successfully (tables + RLS)
- [ ] Auth provider (Google) enabled + redirect URLs configured
- [ ] Dev server restarted and survey save tested

Your old `.env` still contains references to project `mkbldgdnhjbkbaxesfkh`; replace every Supabase/Postgres variable with the new project’s values so nothing points at the deleted project.
