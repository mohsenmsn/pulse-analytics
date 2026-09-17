-- Pulse security hardening for Supabase
-- Prisma connects as the database owner and bypasses RLS.
-- Anon / authenticated PostgREST roles must not see tenant data.

-- 1) Enable RLS on every application table
-- Enable RLS (owner/Prisma bypasses RLS; anon/authenticated do not)
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Organisation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Membership" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataSource" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DataRow" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Dashboard" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Widget" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Alert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;

-- 2) No policies for anon/authenticated = deny by default via Data API
-- Drop any accidental permissive policies if they exist
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'User','Organisation','Membership','DataSource','DataRow',
        'Dashboard','Widget','Alert','Subscription','ApiKey'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 3) Revoke Data API privileges from Supabase roles
REVOKE ALL ON TABLE
  "User", "Organisation", "Membership", "DataSource", "DataRow",
  "Dashboard", "Widget", "Alert", "Subscription", "ApiKey"
FROM anon, authenticated;

REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Keep default privileges locked down for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;
