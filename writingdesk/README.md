# Writing Desk — Vercel setup

Three files. `index.html` is the desk, `api/data.js` stores your work on the
server, `package.json` tells Vercel what to install.

## 1. Deploy

Drag this whole folder onto vercel.com → New Project → Deploy.
(Not just the HTML — it needs the folder, so the api route comes too.)

It will fail or run local-only until you finish step 2 and 3. That's expected.

## 2. Create the storage

Project dashboard → **Storage** → **Create Database** → **Blob** → Create,
and connect it to this project. Vercel adds the token automatically.

## 3. Set your password

Project dashboard → **Settings** → **Environment Variables** → Add:

    Name:   DESK_KEY
    Value:  (any long phrase you'll remember)

Apply to Production, Preview and Development. Save.

## 4. Redeploy

Deployments → the top one → **⋯** → **Redeploy**. This is required: environment
variables only apply to new builds.

## 5. Open it

Visit your URL. It asks for the password once per device and remembers it.
The banner turns green when sync is live.

Repeat on your other devices — same URL, same password — and they share one copy.

## Moving your existing work across

On the old artifact desk: Export → Backup JSON → Copy.
On the new site: Import → paste → Import.

## Notes

- The **Password** button clears the stored key if you mistype it.
- **Test save** does a round trip and reports what happened.
- The stored blob is at a public but unguessable URL; the password protects the
  API, not the blob itself. Fine for a manuscript, not for secrets.
- Free tier limits are far beyond what two novels need.
