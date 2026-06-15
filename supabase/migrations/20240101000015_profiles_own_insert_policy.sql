-- Allow authenticated users to insert their own profile row.
-- This handles the case where the on_auth_user_created trigger didn't fire
-- (e.g. the user was created before this migration, or the trigger was missing).
CREATE POLICY "profiles_own_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
