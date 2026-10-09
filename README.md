# CampusHub

A static academic schedule, examination, announcement, and acknowledgment site. GitHub Pages serves the frontend; Supabase provides shared authentication, PostgreSQL storage, role enforcement, one-time role keys, and realtime updates.

## Supabase setup

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql) once. It creates the schema, signup profile trigger, one-time key and admin RPCs, row-level security policies, and realtime publication entries.
3. In Supabase **Project Settings → API**, copy the project URL and **anon/public** key into [`supabase-config.js`](./supabase-config.js). Do not put a service-role key in this repository or frontend.
4. In **Authentication → URL Configuration**, set the Site URL to your published GitHub Pages URL (for example, `https://YOUR-NAME.github.io/YOUR-REPOSITORY/`) and add that URL to the allowed redirect URLs. The app requests an email-confirmation link back to its current page.
5. In **Authentication → Providers → Email**, enable email/password sign-in and configure email confirmation as desired. For a class demo, use a mailbox you can access.
6. Deploy the account invitation function from the repository root using the Supabase CLI:

   ```powershell
   supabase login
   supabase link --project-ref YOUR_PROJECT_ID
   supabase functions deploy admin-create-user
   ```

   The function uses Supabase's server-side `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` secrets. If your project does not provide them by default, set them with `supabase secrets set`; never place the service-role key in a frontend file.
7. Publish the repository using **Settings → Pages**. Open the GitHub Pages HTTPS URL to register and use the application; do not use `file://`.

Supabase's anon key is intended for browser use. Database access is protected by row-level security. Never publish the project service-role key or disable RLS on these tables.

## Bootstrap the first administrator

New signups always receive the Student role. After registering and confirming the first account, open **Authentication → Users** in the Supabase dashboard, copy that user's UUID, and run this one-time command in the SQL Editor, replacing the UUID:

```sql
update public.campus_profiles
set role = 'admin'
where id = 'REPLACE-WITH-YOUR-AUTH-USER-UUID';
```

Sign out and back in. The first administrator can invite accounts, issue single-use professor, class-officer, or administrator keys, assign account roles, edit names, and deactivate accounts in User Management. Invitations are sent by the deployed Edge Function; the service-role key stays server-side. Role keys are stored only as hashes and redemption is atomic. Email/password changes are managed by Supabase Authentication.

## Shared data and permissions

- Announcements, class schedules, exam/calendar events, schedule history, and read acknowledgments are stored in Supabase and shared between signed-in users.
- Schedule and exam CSV imports are parsed and validated in the browser, then inserted in batches into the shared database. Row-level security independently checks the user's database role.
- Supabase Realtime refreshes connected clients when shared records change.
- Students can acknowledge an announcement once. Staff can see acknowledgment counts.
- Admin role/name/status changes, role-key issuance/redemption, and last-admin safeguards run in database functions, not trusted browser role labels.
- Admin invites are checked against the caller's live database role in the Edge Function before Supabase Auth creates the invited account.

The app never stores account passwords or shared application records in browser storage. Supabase Auth's browser SDK persists the signed-in session token in `localStorage` by default; the app keeps only view preferences such as the last tab in `sessionStorage`. Data created by the earlier local-only prototype is not automatically migrated into Supabase.

## Local preview

You can open `index.html` through a local HTTP server or the VS Code Live Server extension after configuring Supabase. Auth redirect URLs must include the local origin when testing locally. The Tailwind and Supabase browser libraries are loaded from CDNs, so an internet connection is required.

This is an instructor/demo application, not a substitute for institutional identity management, data retention policy, or a production security review.