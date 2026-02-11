-- RLS policies (authenticated-only, per-user)

-- Surveys: users can only read/write their own rows
DROP POLICY IF EXISTS "surveys_select_own" ON public.surveys;
CREATE POLICY "surveys_select_own"
  ON public.surveys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "surveys_insert_own" ON public.surveys;
CREATE POLICY "surveys_insert_own"
  ON public.surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "surveys_update_own" ON public.surveys;
CREATE POLICY "surveys_update_own"
  ON public.surveys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "surveys_delete_own" ON public.surveys;
CREATE POLICY "surveys_delete_own"
  ON public.surveys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Survey activities: users can only read/write their own rows
DROP POLICY IF EXISTS "survey_activities_select_own" ON public.survey_activities;
CREATE POLICY "survey_activities_select_own"
  ON public.survey_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "survey_activities_insert_own" ON public.survey_activities;
CREATE POLICY "survey_activities_insert_own"
  ON public.survey_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1
      FROM public.surveys s
      WHERE s.id = survey_id AND s.user_id = auth.uid()
    )
  );
