# CampusHub

### Check out the live website here: [CampusHub](https://red-rinsil.github.io/CampusHub/)

## Centralized Class and Examination Schedules and Announcement Management System

CampusHub is a centralized website where students can check class schedules, examinations, deadlines, and official announcements from the school. Professors, class officers, and administrators can manage the information their roles are authorized to maintain.

CampusHub is intended to complement communication channels such as Facebook, Microsoft Teams, and Messenger—not replace them. It gives students one dependable place to check everything and be updated without missing anything.

## Problem being addressed

Class schedules, examination dates, deadlines, and professor announcements are often distributed across different platforms, including Facebook page, Microsoft Teams, email, and face-to-face announcements. Students may miss important updates, be confused by schedule changes, or receive information later than their classmates.

## Proposed solution

CampusHub brings class timetables, dated exam schedules, academic deadlines, and announcements together in one place. Authorized staff can publish announcements, maintain updates, manage sections, subjects, and users altogether.

## Website guide

### Redeemable Keys:

You could register an account and use any of this redeemable keys:

**To join a section (Permanent Key):**
- ***BSCPE4-101:*** 3234F49D-7B88ABFF-76A35F08
- ***BSCPE4-102:***  3CC92486-9DFCD0CB-24B3DF43

**To get elevated role (Admin/Professor/Class Officer):**
- ***Admin:*** 0BB79101-59C1B2E5-6EA80DA4, 0F77AE72-01B7FD42-6C430ECB, 715C52E4-A9456189-8A1F706F, 9DD27A38-D8CAE73F-F7DC74AF, 45BA09F7-E398BE9D-6A936E34
- ***Professor:*** 67A883CF-59070381-E3F472C2, 28CC6C36-2C30EF66-8F7EFD7C, 2F3C6E27-8AC90737-F3D55643, 417ED059-DBA21BCD-FB492D25, E239CBEB-842225F4-2FBAFE0C
- ***Class Officer:*** 47039A17-D3A8D000-140BD1BE, D1889024-57F46B9A-11EB4DD9, 0982ECD7-8D5E1546-2E0DC8C9, BCE7D2BE-2F4AB7A1-D3BDEDD4

*Note: once you have redeemed a key or have elevated role, you cannot redeem another key.*

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
| **Dashboard** | Shows your section name below the welcome message, and summarizes upcoming academic dates, active announcements, unread updates, and active student count. It displays one latest announcement card. Students see upcoming dates, announcements, and today's class schedule for every subject they are enrolled in, not only the currently selected subject. The latest announcement remains visible whether or not you acknowledged it. Authorized professors and administrators can open the bulk schedule tools here. |
| **My subjects** | Professor-only view of every assigned subject, grouped by section. Professors can open a section's timetable or calendar and create announcements for one, multiple, or all of their assigned sections. |
| **Announcements** | Browse and filter announcements across every section and subject available to your role, independent of the current subject selector. Multi-section copies of the same post are grouped into one feed item, with its target sections/subjects listed. When composing, choose one or more available sections (or all) from the target-sections dropdown. Choosing the **Subject** category reveals a subject subcategory selector; the selected subject must be available in every targeted section. Students can acknowledge all copies targeted to their enrolled subjects at once. Professors and class officers can create, edit, and archive their role's announcements; administrators can also restore archived announcements. Authorized staff can see acknowledgment totals per target. |
| **Class schedule** | View the weekly timetable, including subjects, assigned professors, rooms, and times, along with schedule change history. Professors, class officers, and administrators can add, edit, and remove class entries. |
| **Exam timetable** | View examinations with their full calendar date, time, subject, and location. Professors and administrators can add, edit, remove, import, and export exams. |
| **Academic calendar** | Browse examinations, quizzes, project deadlines, consultations, and special class sessions chronologically. Professors and administrators can filter by a single section or all sections; class officers can view and manage calendar entries only in their own section. |
| **User management** | Available only to administrators. Edit account names, roles, class placements, and subject assignments; deactivate/reactivate accounts; and generate one-time keys for Professor, Class Officer, or Administrator access. Active student totals include class officers, while the role-grouped account list continues to identify officers separately. |
| **Account settings** | Change your password by verifying your current password and entering a new one. Supabase Authentication manages the credentials. |

Account settings remains available even before an administrator has created subjects or a student has joined a section.

### Announcements and acknowledgments

Open **Announcements** to read current posts. Use the category filter to narrow the list. An elevated user can select **Create announcement**, chooses one or more sections (or all available sections), and selects a subject in each selected section. Professors can target their assigned sections, administrators can target active sections, and class officers can target subjects only in their own section. Categories include General, Exam Notice, Class Cancellation, Deadline, Tertiary, Senior High, and Subject. When **Subject** is selected, the selected subject name becomes the announcement category; subject-category announcements can be filtered by that subject name. Professors can also compose from **My subjects** using the same section and subject targeting. Eligible users can manage announcements created under their role; administrators have additional archive management permissions.

Students can acknowledge an announcement once using **Mark as read**. The acknowledgment is stored in the shared database and reflected in the staff-facing count. The number of students shown is based on active student accounts.

### Class schedules and academic dates

Open **Class schedule** for the weekly view. The timetable displays each subject, assigned professor, and room; the history section lists recorded schedule changes. Students can see schedules for all subjects they are enrolled in within their section. Administrators can choose any active section to view; professors can choose a section where they are assigned to at least one subject. Class officers see all schedules and schedule history in their own section. Professor names come from the selected subject's active professor assignments, so they are not entered for each schedule row.

Open **Exam timetable** for examination schedule. Unlike the weekly class timetable, it displays the complete date for each exam. Students see exams for all subjects they are enrolled in within their section. Class officers see exams for their own section. Administrators and professors can filter exams by section; authorized staff can also import and export exams for the selected section. When adding an exam, choose a subject within the section currently being viewed; every entry here is categorized as an examination. Quizzes, project deadlines, consultations, and special class sessions remain in **Academic calendar**, where students see events for all subjects they are enrolled in, class officers are limited to their own section, and administrators/professors can view one section or all sections.

Class schedules and exams use the currently viewed section; choose a subject within that section when creating or editing a record. Academic calendar uses the viewed section for single-section additions, or offers a section and subject selector when viewing all sections. Class officers can publish announcements and create, edit, or delete academic-calendar entries only in their own section.

### Sections and subjects

CampusHub separates a **section** (the student cohort, such as `BSCPE4-101`) from its **subjects** (such as `Data Structures`). Students join one section and are initially enrolled in its subjects. An administrator can then adjust each student’s enrolled subjects—for example, for an irregular student. Professors are assigned per subject; exactly one class officer is assigned per section.

An administrator sets this up in **User management**:

1. Create a section. CampusHub displays its reusable join key once. Copy and share it securely with the intended students. **Duplicate section** creates a separate section with new subjects, copied professor assignments, class schedules, and all academic-calendar events; it creates a new join key and does not copy students, class officers, announcements, or acknowledgments. Section active-student totals include the assigned class officer. Administrators can rename or archive/restore a section; archiving preserves its data and existing enrollments. **Delete permanently** removes the section and its subjects, enrollments, memberships, academic records, acknowledgments, and schedule history; it does not delete student or staff accounts.
2. Add subjects to the section, with an optional course code.
3. Assign active Professor accounts to individual subjects and one active Class Officer to the section. Professors see their assigned subjects; administrators choose which of the officer's section subjects the officer can manage.
4. Students register or log in, select **Join section**, and enter the key. The key does not grant a staff role. Each student account can join only one section. Rotating the key invalidates the previous key but does not remove students who already joined.
5. In **Edit** on a student or class officer account, administrators can assign or change the account's section and choose the specific subjects they take. Class officers keep their separate officer-management subject assignments; enrolling an officer as a learner does not grant or remove management permissions. Moving an account replaces its old section and subject enrollments. In **Edit** on a professor account, administrators can select subjects to assign or unassign. Section and subject lists are alphabetically ordered and collapsed until opened. Subjects can be renamed (including the course code) or archived/restored; archive/restore preserves schedules, exams, announcements, enrollments, and acknowledgment history. **Delete permanently** removes the subject and its assignments, enrollments, academic records, acknowledgments, and schedule history. Staff create or edit records while the intended active subject is selected. This scopes the timetable, calendar, announcements, bulk import/export, and acknowledgment counts. Archiving a section prevents new joins and hides its subjects from members until restored.

A Professor or Class Officer role must be granted by an administrator (or by redeeming a one-time role key) before the account can be assigned to classes. Professors are assigned to subjects; the Class Officer is assigned once at the section level. A role alone does not provide access to another section's information.

### Bulk schedule and exam import/export

Professors and administrators can import class schedules from the Dashboard or Class schedule, and import exams from Exam timetable. Each import dialog requires a destination section; rows are matched by subject name to an accessible offering in that section, independent of the currently selected subject. Rows with missing or ambiguous subject matches are rejected; other invalid rows are reported and skipped. Class Schedule accepts class rows only. Exam timetable accepts exam rows only and imports them as examinations; quiz and other academic-calendar entries are not accepted. Successful records are saved to Supabase and appear in the relevant views for all members.

Select **Download CSV template** in the import dialog for an example.

Choose **Export class schedules** to download all class schedule entries in the selected timetable section as CSV (not just the active subject). Choose **Export exams** from Exam timetable to download only examination entries in its selected section; quizzes and other academic calendar items are not included.

### Administrator setup and role management

Administrators can:

- **Change role:** assign Student, Professor, Class Officer, or Administrator.
- **Edit:** open the account editor modal to update the user's display name; assign students to a section and select their subjects; or assign/unassign professors from subjects. Accounts are grouped by role and alphabetized.
- **Deactivate/reactivate:** control whether an account can use the application.
- **Generate role key:** create a one-time key for an elevated role. Copy and share it securely; it is displayed only once. Key hashes and redemption status are stored in Supabase. The final active administrator cannot be demoted or deactivated.

Professors can:

- **Make announcement:** create general updates and section-only announcement to their respective subject.
- **Create schedules**: update class schedules and exam timetable should there be any changes made.
- **Update calendar**: add calendar item of their respective subject to the section they handle.
- **Edit**: make changes to any announcement/calendar entries.
- **Archive/Delete:** control whether an entry is seen by students by archiving or deleting it completely.

Officers can:

- **Make announcement:** make updates only to their respective section.
- **Edit entries**: make changes their own announement/calendar entries.
- **Archive/Delete:** hide/delete their own entries.

## AI use disclosure

Copilot AI was used as a coding assistant during the ninety percent (95%) of design and implementation of this project. AI assistance contributed to drafting and revising the interface, JavaScript functionality, Supabase integration, database schema/policies, and this documentation. I, the project owner, only debugged issues and made minor changes to improve features and the overall usability of the website. AI output should not be treated as proof of production readiness or a substitute for a security review.

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

## Project files

- [`index.html`](./index.html) — landing page, application shell, account dialogs, and import interface.
- [`styles.css`](./styles.css) — custom visual styles and responsive layout details.
- [`app.js`](./app.js) — navigation, role-aware UI, forms, and application interactions.
- [`import-parser.js`](./import-parser.js) — CSV/TXT parsing, validation, and template content.
- [`supabase-config.js`](./supabase-config.js) — public Supabase project URL and anon key configuration.
- [`supabase-store.js`](./supabase-store.js) — browser-side Supabase Auth, data access, and Realtime integration.
- [`supabase/schema.sql`](./supabase/schema.sql) — database schema, functions, RLS policies, and Realtime setup.

## Limitations

CampusHub is an academic demonstration project, not a replacement for institutional identity management, official communication channels, or campus data-retention policies. Records created by the earlier local-only prototype are not automatically migrated into Supabase. The frontend loads Tailwind CSS and the Supabase browser library from CDNs, so an internet connection is required.
