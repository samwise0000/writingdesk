Writing Desk — parts manager update

Files:
- index.html — UI and book-parts management
- api/data.js — Vercel Blob sync API
- package.json — @vercel/blob dependency

The Parts button is now visible in the Spine toolbar. It opens Book parts, where you can add, rename, and delete parts. Parts are stored separately from sections so an empty part can exist. Renaming a part updates all sections assigned to it. Deleting a part with sections requires choosing another part to receive those sections.
