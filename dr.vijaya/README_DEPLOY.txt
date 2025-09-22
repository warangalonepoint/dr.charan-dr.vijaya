Vercel deployment notes (additive-only)
---------------------------------------
- This package adds `vercel.json` at the repository root.
- Your existing code and structure are unchanged.
- Clean URLs are enabled: `/dashboard` will serve `/dashboard.html` if present.
- `.html` links continue to work as usual.
- Static assets under `/assets` are cached aggressively; bump filenames on updates.
- `service-worker.js` is set to no-cache so updates reach users quickly.

Deploy steps:
1) Push this folder to a new GitHub repo.
2) On Vercel, "Add New Project" -> Import your repo -> Framework preset: "Other".
3) Build & Output settings:
   - Build Command: (leave blank)
   - Output Directory: (leave blank or '.')
4) Deploy.

Notes:
- If you already had a vercel.json, we've backed it up as vercel.backup.json.
- If you prefer strict file routes only (no clean URLs), remove the `cleanUrls` field and the second rewrite.
