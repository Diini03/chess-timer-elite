# Books & PDFs Library (alongside Tempo)

Add a personal library to this project: sign in, add books, upload PDFs, search/filter, and read PDFs in the browser. The chess clock stays exactly as it is.

## Backend (Lovable Cloud)

Enable Lovable Cloud, which provides the database, auth, and file storage.

- **Auth**: email + password, plus Google sign-in.
- **profiles** table: id (links to the account), display name, avatar URL, created date. A row is created automatically on signup.
- **books** table: id, owner, title, author, description, cover image URL, tags (list), PDF path, page count/size, created date.
- **Storage buckets**: a private `book-files` bucket for PDFs and a `book-covers` bucket for cover images. Both scoped per user.
- **Security**: each user can only read, edit, and delete their own books and files. Nothing is public.

## Pages

- `/auth` — sign up / sign in (email + password and a Google button), with a "check your email to confirm" state.
- `/library` — the books grid: cover, title, author, tags. Includes:
  - search box (title + author)
  - author filter and tag filter
  - sort: newest, oldest, title A–Z
  - "Add book" button opening a form with cover upload and PDF upload (with progress)
- `/library/$bookId` — book detail with metadata, edit, delete, and "Read" action.
- `/library/$bookId/read` — in-app PDF viewer: page navigation, zoom, page counter, keyboard arrows. Files are loaded through a short-lived signed URL, never a public link.
- Landing page (`/`) gets a link to the Library, and a sign-in / account control in the header.

## Design

Reuse the existing Tempo design system (Midnight Indigo palette, Bebas Neue + Barlow) so the library feels like part of the same app. Grid of cover cards with graceful placeholder covers when none is uploaded.

## Technical notes

- Protected routes live under `src/routes/_authenticated/` using the integration-managed gate; `/auth` stays public.
- Data access via `createServerFn` with the auth middleware; uploads go directly from the browser to storage with the user's session, then the row is written server-side.
- PDF rendering uses `react-pdf` / `pdf.js` loaded client-only (no SSR) to keep the worker out of the server bundle.
- Signed URLs for PDF reads with a short expiry; the bucket stays private.
- Each new route defines its own `head()` metadata.
