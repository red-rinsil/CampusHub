# CampusHub

**Centralized Class and Examination Schedules and Announcement Management System**

CampusHub is a centralized website where students can check class schedules, examinations, deadlines, and official announcements. Professors, class officers, and administrators can manage the information their roles are authorized to maintain. Records are shared through Supabase, so updates are not confined to the browser that created them.

CampusHub is intended to complement communication channels such as Facebook and Microsoft Teams—not replace them. It gives students one dependable place to check everything and be updated.

## Problem being addressed

Class schedules, examination dates, deadlines, and professor announcements are often distributed across different platforms, including Facebook page, Microsoft Teams, email, and face-to-face announcements. Students may miss important updates, be confused by schedule changes, or receive information later than their classmates.

## Proposed solution

CampusHub brings class timetables, dated exam schedules, academic deadlines, and announcements together in one place. Authorized staff can publish and maintain updates, while students can acknowledge announcements so staff can see whether they have been read.

## Technology stack

- **HTML5** for the landing page, application structure, forms, and dialogs.
- **Tailwind CSS via CDN** for responsive interface styling, with `styles.css` for custom layout and component styling.
- **Vanilla JavaScript** for navigation, role-aware rendering, CSV parsing, validation, and user interactions.
- **Supabase Auth** for account registration, email confirmation, login, logout, and password management.
- **Supabase PostgreSQL** for shared user profiles, announcements, schedules, academic events, and read acknowledgments.
- **Supabase Row Level Security (RLS) and database functions** for enforcing role permissions and single-use key redemption.
- **Supabase Realtime** for updating connected pages when shared records change.
- **Supabase Edge Function** for administrator-issued email invitations without exposing a service-role key to the browser.
- **GitHub Pages** for static frontend hosting.

## Website guide

### Landing page and account access

The landing page introduces the problem CampusHub addresses and the features it provides. Select **Login/Register** in the top-right, or **Get started**, to open the account dialog.

1. Choose **Register** and enter your full name, email address, and password. New registrations have the Student role.
2. If email confirmation is enabled in Supabase, follow the confirmation link before logging in.
3. Return to CampusHub, choose **Log in**, and enter the registered email and password.
4. To leave your account, select **Log out** in the application header.

Do not enter an elevated role during registration. An administrator can invite users, assign roles, or issue one-time access keys. An eligible student can select **Redeem key** in the application header and enter a key provided by an administrator.

### Main navigation

After signing in, use the navigation in the left sidebar. On smaller screens, the navigation is displayed horizontally. The **Current term** label is at the bottom of the desktop sidebar. Available pages and actions depend on your account role.

| Page | What it does |
| --- | --- |
| **Dashboard** | Summarizes upcoming academic dates, active announcements, unread updates, and active student count. It also highlights urgent notices and shows today's classes. Authorized professors and administrators can open the bulk schedule tools here. |
| **Announcements** | Browse and filter announcements by category. Students select **Mark as read** to record an acknowledgment. Professors and class officers can create, edit, and archive their role's announcements; administrators can also restore archived announcements. Authorized staff can see acknowledgment totals. |
| **Class schedule** | View the weekly timetable, including subjects, instructors, rooms, and times, along with schedule change history. Professors, class officers, and administrators can add, edit, and remove class entries. |
| **Exam timetable** | View exams and quizzes with their full calendar date, time, subject, and location. Professors and administrators can add, edit, and remove entries. |
| **Academic calendar** | Browse examinations, quizzes, project deadlines, consultations, and special class sessions chronologically. Professors and administrators can manage calendar entries. |
| **User management** | Available only to administrators. Invite accounts, change names or roles, deactivate/reactivate accounts, and generate one-time keys for Professor, Class Officer, or Administrator access. |
| **Account settings** | Change your password by verifying your current password and entering a new one. Supabase Authentication manages the credentials. |

### Announcements and acknowledgments

Open **Announcements** to read current posts. Use the category filter to narrow the list. An eligible poster selects **Create announcement**, supplies its title, subject, content, and category, and submits it for other signed-in users. Posters can manage announcements created under their role; administrators have additional archive management permissions.

Students can acknowledge an announcement once using **Mark as read**. The acknowledgment is stored in the shared database and reflected in the staff-facing count. The number of students shown is based on active student accounts.

### Class schedules and academic dates

Open **Class schedule** for the weekly view. The timetable displays the day and time, subject, instructor, and room; the history section lists recorded schedule changes.

Open **Exam timetable** when you need an examination or quiz date. Unlike the weekly class timetable, it displays the complete date for each assessment. Use **Academic calendar** for other dated items, including project deadlines, consultations, and special class sessions.

### Bulk schedule and exam import/export

Professors and administrators can select **Import CSV / TXT** from the Dashboard, Class schedule, or Exam timetable. Choose a `.csv` or `.txt` file, review the row-by-row validation preview, then import the valid rows. Invalid rows are reported and skipped; successful records are saved to Supabase and appear in the relevant views for all users.

Select **Download CSV template** in the import dialog for an example. The header format is:

```text
Type,Subject,Instructor,Classroom,DayOfWeek,Time,EndTime,Date,Title,Details
```

- Class rows require `Subject`, `Instructor`, `Classroom`, `DayOfWeek`, `Time`, and `EndTime`.
- Exam and quiz rows require `Type`, `Subject`, `Classroom`, `Time`, and a real date in `YYYY-MM-DD` format. `Title`, `Instructor`, and `Details` are optional.
- Time values use 24-hour `HH:MM` format. Supported types are `Class`, `Exam`, `Examination`, and `Quiz`.
- Quoted CSV values can contain commas. Files are limited to 2 MB and 10,000 valid records.

Choose **Export schedules & exams** to download the current class schedules and exam/quiz records as CSV.

### Administrator setup and role management

The first administrator must be promoted once from the Supabase SQL Editor. After registering and confirming your account, find its UUID under **Authentication → Users** and run:

```sql
update public.campus_profiles
set role = 'admin'
where id = 'REPLACE-WITH-YOUR-AUTH-USER-UUID';
```

Then sign out and back in. In **User management**, administrators can:

- **Invite user:** send an invitation email using the deployed `admin-create-user` Edge Function. The recipient completes account setup through Supabase.
- **Change role:** assign Student, Professor, Class Officer, or Administrator.
- **Edit:** update the user's display name.
- **Deactivate/reactivate:** control whether an account can use the application.
- **Generate role key:** create a one-time key for an elevated role. Copy and share it securely; it is displayed only once. Key hashes and redemption status are stored in Supabase. The final active administrator cannot be demoted or deactivated.

## Deploying and connecting Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). This creates the tables, profile trigger, database functions, RLS policies, and Realtime publication entries.
3. In **Project Settings → API**, copy the project URL and **anon/public** key into [`supabase-config.js`](./supabase-config.js).
4. Under **Authentication → URL Configuration**, set the Site URL to your GitHub Pages URL and add that URL to the allowed redirect URLs. Add your local development URL there too if needed.
5. Under **Authentication → Providers → Email**, enable email/password authentication and choose the email-confirmation behavior appropriate for your demonstration.
6. Install and configure the [Supabase CLI](https://supabase.com/docs/guides/cli), then deploy the administrator invitation function from the repository root:

   ```powershell
   supabase login
   supabase link --project-ref YOUR_PROJECT_ID
   supabase functions deploy admin-create-user
   ```

   The function uses Supabase server-side environment variables. Do not copy a service-role key into `supabase-config.js`, other frontend code, or this GitHub repository.
7. Enable GitHub Pages for the repository under **Settings → Pages**. Visit the resulting HTTPS URL to use the connected application. Opening `index.html` using a `file://` URL is not supported for authentication.

The Supabase anon/public key is expected to be visible in the static frontend. RLS and database functions are responsible for protecting records and privileged operations. Never publish the service-role key or disable RLS.

### Repair a missing profile

Every Auth user needs a matching row in `public.campus_profiles`. The signup trigger creates one for new users. If you created an Auth user before running the schema, or see an error saying the CampusHub profile is missing, run this in the Supabase SQL Editor:

```sql
insert into public.campus_profiles (id, full_name, email)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'full_name'), ''), split_part(email, '@', 1)),
  lower(email)
from auth.users
where id = 'REPLACE-WITH-YOUR-AUTH-USER-UUID'
on conflict (id) do nothing;
```

Use the UUID shown for your account under **Authentication → Users**, then sign out and sign back in. The app reports this setup issue directly instead of showing an ambiguous database response.

## AI use disclosure

Generative AI was used as a coding assistant during the design and implementation of this project. AI assistance contributed to drafting and revising the interface, JavaScript functionality, Supabase integration, database schema/policies, and this documentation. The project owner remains responsible for reviewing, configuring, testing, and presenting the work. AI output should not be treated as proof of production readiness or a substitute for a security review.

## Project files

- [`index.html`](./index.html) — landing page, application shell, account dialogs, and import interface.
- [`styles.css`](./styles.css) — custom visual styles and responsive layout details.
- [`app.js`](./app.js) — navigation, role-aware UI, forms, and application interactions.
- [`import-parser.js`](./import-parser.js) — CSV/TXT parsing, validation, and template content.
- [`supabase-config.js`](./supabase-config.js) — public Supabase project URL and anon key configuration.
- [`supabase-store.js`](./supabase-store.js) — browser-side Supabase Auth, data access, and Realtime integration.
- [`supabase/schema.sql`](./supabase/schema.sql) — database schema, functions, RLS policies, and Realtime setup.
- [`supabase/functions/admin-create-user/index.ts`](./supabase/functions/admin-create-user/index.ts) — server-side account invitation function.

## Limitations

CampusHub is an academic demonstration project, not a replacement for institutional identity management, official communication channels, or campus data-retention policies. Records created by the earlier local-only prototype are not automatically migrated into Supabase. The frontend loads Tailwind CSS and the Supabase browser library from CDNs, so an internet connection is required.
