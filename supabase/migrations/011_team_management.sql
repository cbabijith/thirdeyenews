-- Apply before deploying the Team module. Auth and profiles are synchronized in
-- the same transaction, so a failed profile write rolls back account creation.
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'superadmin' BEFORE 'admin';

-- Roles may only be changed through the server's service role. The original
-- policies allowed any signed-in user to promote their own profile.
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;
GRANT UPDATE (full_name) ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Old bootstrap helpers were publicly executable SECURITY DEFINER functions.
DO $$
BEGIN
  IF to_regprocedure('public.promote_to_admin(text)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.promote_to_admin(text) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.promote_to_admin(text) TO service_role;
  END IF;
  IF to_regprocedure('public.promote_to_staff(text)') IS NOT NULL THEN
    REVOKE ALL ON FUNCTION public.promote_to_staff(text) FROM PUBLIC, anon, authenticated;
    GRANT EXECUTE ON FUNCTION public.promote_to_staff(text) TO service_role;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    CASE WHEN NEW.raw_app_meta_data->>'team_role' IN ('admin', 'staff', 'user')
      THEN (NEW.raw_app_meta_data->>'team_role')::public.user_role
      ELSE 'user'::public.user_role END
  );
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.sync_team_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  UPDATE public.profiles SET
    email = NEW.email,
    full_name = CASE WHEN NEW.raw_user_meta_data->'full_name' IS DISTINCT FROM OLD.raw_user_meta_data->'full_name'
      THEN NEW.raw_user_meta_data->>'full_name' ELSE full_name END,
    role = CASE WHEN NEW.raw_app_meta_data->'team_role' IS DISTINCT FROM OLD.raw_app_meta_data->'team_role'
        AND NEW.raw_app_meta_data->>'team_role' IN ('admin', 'staff', 'user')
      THEN (NEW.raw_app_meta_data->>'team_role')::public.user_role ELSE role END,
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
DROP TRIGGER IF EXISTS on_auth_user_team_updated ON auth.users;
CREATE TRIGGER on_auth_user_team_updated AFTER UPDATE OF email, raw_user_meta_data, raw_app_meta_data ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.sync_team_profile();

-- Also supports databases initially created with Drizzle (which omitted the
-- auth.users foreign key). Content author references already use SET NULL.
CREATE OR REPLACE FUNCTION public.delete_team_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  DELETE FROM public.profiles WHERE id = OLD.id;
  RETURN OLD;
END $$;
DROP TRIGGER IF EXISTS on_auth_user_team_deleted ON auth.users;
CREATE TRIGGER on_auth_user_team_deleted AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.delete_team_profile();

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_team_profile() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.delete_team_profile() FROM PUBLIC, anon, authenticated;

-- Restrict the readiness check to the server; routes fail closed without it.
CREATE OR REPLACE FUNCTION public.team_management_version()
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = '' AS $$ SELECT 1 $$;
REVOKE ALL ON FUNCTION public.team_management_version() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.team_management_version() TO service_role;
