# Punchline Control Room

A separate Next.js admin app for the existing Punchline Supabase database.

## Features
- Live dashboard: 14-day voting activity, audience approval, style performance, crowd favorite, unrated creations, and divided reactions.
- Searchable read-only profiles and vote history, with pagination.
- Create, read, edit, and delete AI-generated caption/photo records. Deleting media cascades its votes; the UI requires a typed confirmation.
- Google OAuth, a verified server session, and `profiles.is_superadmin = true` required for every admin route and server action.
- Database RLS independently enforces admin access. A trigger prevents ordinary profile edits from granting superadmin status. No service-role key is used by the app.

## Setup
Use Node 22 or later. `npm ci`, then configure `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-key
```
Apply `supabase/migrations/20261026000000_admin_access.sql` to the existing Punchline database, after the media application's migrations. Enable Google OAuth in Supabase. Add the admin deployment's `/auth/callback` to the redirect allowlist. Run `npm run dev`.

## Bootstrap access without a public backdoor
Sign in once through Google to create the user's auth/profile records. From the trusted Supabase SQL editor, verify the user's email/UUID and set only that profile's `is_superadmin` to true. Never provide a browser-accessible promotion endpoint or allow self-service role updates. Revoke access by setting the flag to false; every admin request checks the live flag.

## Deploy
Import this repository into a separate Vercel project and add the two public environment values. Disable Vercel Deployment Protection only after app-level authentication is verified. Submit the immutable deployment URL for this app and the existing media app.

## Data behavior
The admin adds existing AI-generated content and edits its metadata; AI generation remains in the main application. Profiles and ratings are read-only. Stored vote counts cannot be edited through the admin. Dashboard queries paginate through the full dataset instead of silently stopping at Supabase's default row limit. This suits the current small community; larger datasets should move aggregation into indexed SQL functions.

## Validation
`npm run build` validates TypeScript and production routes. `npm audit` checks dependencies. Verify signed-out direct URLs redirect to login, non-admin Google sessions are denied, and approved admins can manage media. Run the transaction-based database security tests to verify RLS and self-promotion prevention without retaining test records.
