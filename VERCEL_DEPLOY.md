# Vercel Deployment Checklist

Follow these steps when creating a **new** Vercel project:

## 1. Import Project

- Go to [vercel.com/new](https://vercel.com/new)
- Import your Git repository (GitHub, GitLab, or Bitbucket)

## 2. Project Settings (IMPORTANT)

Before clicking **Deploy**, configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | **Vite** (must be explicit, not "Other") |
| **Root Directory** | `.` or leave **blank** |
| **Build Command** | (leave blank – uses `vercel.json`) |
| **Output Directory** | (leave blank – uses `vercel.json`) |
| **Install Command** | (leave blank – uses `vercel.json`) |

**Critical:** Set Framework Preset to **Vite** explicitly. Vercel needs this to detect and serve the app correctly. Do NOT use "Other".

## 3. Deploy

Click **Deploy**. The build will:
1. Run `npm install`
2. Run `npm run build` (builds `client/` and outputs to `client/dist`)
3. Serve from `client/dist`

## 4. Verify

- Build should complete successfully (check **Building** logs)
- Site should load at your Vercel URL
- Try navigating to `/orders`, `/new` – SPA routing should work

## 5. If You Still Get 404

1. **Check build logs** – Deployments → latest → Building. Ensure no errors.
2. **Clear overrides** – Settings → General. Reset Build Command, Output Directory, Install Command to default (empty).
3. **Root Directory** – Must be `.` or blank. If set to `client`, clear it.
