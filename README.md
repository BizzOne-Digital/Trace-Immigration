# Trace Immigration — Website & Admin

Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · MongoDB/Mongoose · iron-session · pdf-lib · Nodemailer.

## 1. Local setup

```bash
npm install
cp .env.example .env.local        # fill in MONGODB_URI and SESSION_SECRET at minimum
npm run seed                      # idempotent: safe to re-run, never overwrites admin edits
ADMIN_EMAIL=you@firm.com ADMIN_PASSWORD='long passphrase' npm run create-admin
npm run dev                       # http://localhost:3000  ·  admin at /admin
```

Generate a session secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

`npm run create-admin -- --reset` resets an existing admin's password. There are no hardcoded credentials.

## 2. Deploy to Vercel

1. Create a MongoDB Atlas cluster (M0+). Allow Vercel access (Network Access → `0.0.0.0/0`, or Vercel's IP integration).
2. Import the repo in Vercel and set the environment variables from `.env.example`. `NEXT_PUBLIC_SITE_URL` must be the final https domain, because it drives canonical URLs, the sitemap, emails and agreement links.
3. Deploy, then run `npm run seed` and `npm run create-admin` once from your machine against the production `MONGODB_URI`.
4. `vercel.json` schedules a daily `/api/cron/cleanup` (removes unused uploads older than 24 h). Set `CRON_SECRET` to enable it.

## 3. Integrations that need real credentials

| Integration | Variables | Without it |
|---|---|---|
| MongoDB | `MONGODB_URI` | Public pages render built-in default content; forms, booking and admin are unavailable |
| Admin sessions | `SESSION_SECRET` (32+ chars) | Admin login is disabled |
| Email (SMTP) | `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `EMAIL_FROM`, `FIRM_INBOX_EMAIL` | Records are still saved and their email status shows **not configured**. Retry from admin once SMTP is set |
| Payments | none | Not implemented. No card details are collected, and the site never claims a payment succeeded |

## 4. Content the firm must supply (deliberately not invented)

- **Logo:** `public/brand/logo.png` is cropped from the design mockup and is low-resolution. Upload the original logo in **Admin → Site settings**, or replace the file.
- **Agreement wording:** signing stays disabled until a version is entered and activated in **Admin → Agreements**. Active versions are read-only, and each signed record stores its own snapshot plus PDF.
- **Prices:** blank prices display "Contact us for consultation details."
- **Team profiles:** a draft profile for the contact person is seeded unpublished. Add the role, credentials, bio and an approved portrait before publishing.
- **Testimonials:** none are seeded. Approval requires recorded client consent.
- **Booking hours:** starter hours (Mon–Fri 10:00–17:00 Toronto) are seeded with online booking **off**. Review them in **Admin → Availability** and switch booking on.
- **Privacy/Terms:** factual starter text describing what the site collects. Have it reviewed before launch.

## 5. Image uploads (serverless-safe)

- Images are stored in MongoDB (`StoredUpload`), never on disk, so they survive redeploys. They are served from `/api/uploads/{folder}/{filename}` with immutable caching.
- **Host limit:** Vercel Functions reject request bodies over **4.5 MB**. `AdminImageField` sends files up to 3.5 MB directly to `POST /api/upload`. Larger files (up to the 8 MB app limit) are sent in 2.5 MB chunks to `/api/upload/chunk` and then assembled by `POST /api/upload` with an `uploadId`. Chunks expire after 1 hour (TTL index).
- File type is validated by magic bytes, not the declared MIME type. Folders are whitelisted, and filenames are regex-validated to block traversal.
- A replaced or removed image is deleted only **after** the new content is saved, and only if no other record references it. Unsplash and legacy `/uploads/…` URLs are never deleted. Legacy URLs render a placeholder.

## 6. Security notes

- Admin pages are gated server-side in `app/admin/(panel)/layout.tsx`. Every server action and API mutation re-checks the session.
- Sessions are encrypted HTTP-only cookies (SameSite=Lax, Secure in production), valid for 8 hours, and re-validated against the database.
- Upload routes enforce same-origin checks, and Server Actions get Next.js's built-in origin check.
- Rate limits are stored in MongoDB so they hold across serverless instances: login (5 per email / 20 per IP per 15 min), inquiries, bookings and agreement signing.
- Agreement links contain only a random token, and only its SHA-256 hash is stored. Signed PDFs are downloadable only by admins.
- Double-booking is impossible: each booking claims unique 15-minute `BookingLock` blocks, and the unique index rejects overlaps atomically.

## 7. Verification

```bash
npm run typecheck
npm run build
# against a running server and a TEST database:
npx tsx --conditions react-server scripts/smoke-test.ts http://localhost:3000
```

The smoke test (48 checks) covers public pages, admin authorization, upload acceptance and rejection, traversal attempts, binary delivery, chunked uploads, concurrent booking conflicts, agreement gating, PDF generation, email status and retry, and snapshot integrity. It creates and then removes test data, so **do not point it at production**.
