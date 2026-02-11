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

## 4. Create the `surveys` table

1. In Supabase dashboard, go to **SQL Editor**.
2. New query, paste and run:

```sql
-- Create surveys table (matches app/lib/actions.ts: hobbies array, zip_code)
CREATE TABLE public.surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  hobbies TEXT[] NOT NULL,
  zip_code INTEGER NOT NULL
);

-- Enable RLS
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
```

3. Run the query.

---

## 5. Apply RLS policies

1. Still in **SQL Editor**, open your project’s `supabase-auth-policies.sql`.
2. Copy its contents and run that SQL in the editor.

It will drop any old policies and create:

- `authenticated users can read surveys`
- `authenticated users can insert surveys`

If you prefer unauthenticated access for now (e.g. while rebuilding auth), you can temporarily use:

```sql
CREATE POLICY "Allow read surveys" ON public.surveys FOR SELECT USING (true);
CREATE POLICY "Allow insert surveys" ON public.surveys FOR INSERT WITH CHECK (true);
```

You can switch back to the authenticated-only policies from `supabase-auth-policies.sql` once auth is set up.

---

## 6. (Optional) Configure Auth (e.g. Google OAuth)

If you use Supabase Auth (e.g. Google):

1. **Authentication** → **Providers** → enable **Google** and add your OAuth client ID/secret.
2. **URL Configuration** (under Auth settings):
   - **Site URL**: e.g. `http://localhost:3000` (dev) or your production URL.
   - **Redirect URLs**: add `http://localhost:3000/**` and `https://your-production-domain.com/**`.

Your app already uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `app/api/supabase/client.ts` and `server.ts`, so no code changes are needed for a new project—only env and dashboard config.

---

## 7. Verify the app

1. Restart the Next.js dev server (so it picks up new env vars).
2. In the app, run the flow that **saves a survey** (e.g. submit hobbies + zip).
3. In Supabase **Table Editor** → `surveys`, confirm a new row appears.
4. If you use auth, test sign-in and then survey insert again.

---

## Quick checklist

- [ ] New Supabase project created
- [ ] All credentials copied from **Project Settings** → API and Database
- [ ] `.env` and `.env.development.local` updated (no old project IDs/keys left)
- [ ] `surveys` table created and RLS enabled
- [ ] `supabase-auth-policies.sql` (or temporary policies) applied
- [ ] Auth providers and redirect URLs configured if you use Google OAuth
- [ ] Dev server restarted and survey save tested

Your old `.env` still contains references to project `mkbldgdnhjbkbaxesfkh`; replace every Supabase/Postgres variable with the new project’s values so nothing points at the deleted project.
