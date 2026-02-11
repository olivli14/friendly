-- Update RLS policies for surveys table to work with authenticated users

-- Drop existing policies
DROP POLICY IF EXISTS "public can read surveys" ON public.surveys;
DROP POLICY IF EXISTS "public can insert surveys" ON public.surveys;

-- Create new policies for authenticated users
CREATE POLICY "authenticated users can read surveys"
  ON public.surveys
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "authenticated users can insert surveys"
  ON public.surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Optional: Allow users to read only their own surveys
-- CREATE POLICY "users can read own surveys"
--   ON public.surveys
--   FOR SELECT
--   TO authenticated
--   USING (auth.uid() = user_id);

-- Optional: Allow users to insert only their own surveys
-- CREATE POLICY "users can insert own surveys"
--   ON public.surveys
--   FOR INSERT
--   TO authenticated
--   WITH CHECK (auth.uid() = user_id);
