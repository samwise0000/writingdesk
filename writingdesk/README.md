# Writing Desk — named saved states

This version adds server-side named snapshots backed by private Vercel Blob storage.

## Files
- `index.html` — Writing Desk UI with Save state / Load state controls
- `api/data.js` — current workspace sync plus private snapshot API
- `package.json` — uses @vercel/blob 2.6.1+

## Vercel setup
1. Keep Root Directory set to `writingdesk` if the repository contains this folder.
2. Connect a **Private** Vercel Blob store to the project.
3. Set `DESK_KEY` in Vercel Environment Variables.
4. Redeploy.

Saved states are named, immutable snapshots. Loading one replaces the current live workspace, but does not delete the snapshot.
