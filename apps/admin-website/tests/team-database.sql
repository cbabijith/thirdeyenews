\set ON_ERROR_STOP on
-- Run only against a disposable PostgreSQL database, never a real Supabase project.
CREATE ROLE anon;
CREATE ROLE authenticated;
CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users (
  id uuid PRIMARY KEY, email text UNIQUE,
  raw_user_meta_data jsonb DEFAULT '{}', raw_app_meta_data jsonb DEFAULT '{}'
);
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
GRANT USAGE ON SCHEMA auth, public TO anon, authenticated, service_role;
\ir ../../../supabase/migrations/001_initial_schema.sql
\ir ../../../supabase/migrations/002_create_admin_user.sql
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
\ir ../../../supabase/migrations/011_team_management.sql
-- Re-running the migration must be safe.
\ir ../../../supabase/migrations/011_team_management.sql

INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data) VALUES
 ('00000000-0000-4000-8000-000000000001', 'admin@example.com', '{"full_name":"Admin"}', '{"team_role":"admin"}'),
 ('00000000-0000-4000-8000-000000000002', 'staff@example.com', '{"full_name":"Staff"}', '{"team_role":"staff"}'),
 ('00000000-0000-4000-8000-000000000003', 'reader@example.com', '{"full_name":"Reader", "role":"superadmin", "team_role":"superadmin"}', '{}');
DO $$ BEGIN
  ASSERT (SELECT role = 'admin' FROM public.profiles WHERE email = 'admin@example.com'), 'Admin creation failed';
  ASSERT (SELECT role = 'staff' FROM public.profiles WHERE email = 'staff@example.com'), 'Staff creation failed';
  ASSERT (SELECT role = 'user' FROM public.profiles WHERE email = 'reader@example.com'), 'User metadata escalated role';
END $$;

SET ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', false);
DO $$ BEGIN
  BEGIN
    UPDATE public.profiles SET role = 'admin' WHERE id = auth.uid();
    RAISE EXCEPTION 'SECURITY FAILURE: self promotion allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.promote_to_admin('reader@example.com');
    RAISE EXCEPTION 'SECURITY FAILURE: public promotion helper allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    PERFORM public.team_management_version();
    RAISE EXCEPTION 'SECURITY FAILURE: public readiness function allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
END $$;
UPDATE public.profiles SET full_name = 'Updated Reader' WHERE id = auth.uid();
RESET ROLE;

UPDATE auth.users SET email = 'editor@example.com', raw_user_meta_data = '{"full_name":"Editor"}', raw_app_meta_data = '{"team_role":"admin"}' WHERE email = 'staff@example.com';
DO $$ BEGIN
  ASSERT (SELECT email = 'editor@example.com' AND full_name = 'Editor' AND role = 'admin' FROM public.profiles WHERE id = '00000000-0000-4000-8000-000000000002'), 'Atomic profile sync failed';
  ASSERT (SELECT full_name = 'Updated Reader' AND role = 'user' FROM public.profiles WHERE email = 'reader@example.com'), 'Safe profile update failed';
END $$;
-- A user changing their own metadata must not undo an existing server-assigned role.
UPDATE auth.users SET raw_user_meta_data = '{"full_name":"Editor renamed", "role":"superadmin"}' WHERE email = 'editor@example.com';
DO $$ BEGIN
  ASSERT (SELECT role = 'admin' FROM public.profiles WHERE email = 'editor@example.com'), 'Metadata role escalation';
END $$;

INSERT INTO public.news (id, title, content, created_by) VALUES ('10000000-0000-4000-8000-000000000001', 'Keep this article', 'Article content', '00000000-0000-4000-8000-000000000002');
DELETE FROM auth.users WHERE email = 'editor@example.com';
DO $$ BEGIN
  ASSERT NOT EXISTS (SELECT 1 FROM public.profiles WHERE email = 'editor@example.com'), 'Deleted profile remains';
  ASSERT (SELECT created_by IS NULL FROM public.news WHERE id = '10000000-0000-4000-8000-000000000001'), 'News was lost or still references deleted member';
END $$;
SELECT 'Team migration, permissions, atomic sync and content preservation passed' AS result;
