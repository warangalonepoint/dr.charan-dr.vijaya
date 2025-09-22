# Clinic Apps Hub (Vercel-ready)

This repo hosts two PWAs under one domain and a simple entry page.

```
/
├─ index.html            # Entry page with two cards
├─ vercel.json           # Clean routes for folder roots
├─ dr.charan/            # Dr. Charan Child Clinic PWA
└─ dr.vijaya/            # Dr. Vijaya Fetal Medicine PWA
```

## Deploy (Vercel)
1. Push these files to a GitHub repo.
2. In Vercel, **Add New Project** → Import the repo → Framework: *Other* → Build Command: *None* → Output Directory: `/` (root).
3. Deploy.

> If either app uses service workers, they will be scoped within their own subfolder automatically.

## GitHub Pages (optional)
This structure also works on GitHub Pages if you serve from the repo root branch.