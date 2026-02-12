# Vercel Deployment - FIX 404

## Critical: You MUST set Root Directory to `client`

The app will 404 if Root Directory is wrong. Follow these steps exactly:

## 1. Create/Import Project

- Go to [vercel.com/new](https://vercel.com/new)
- Import your Git repository

## 2. Before Deploy - Configure Settings

Go to **Settings** (or **Configure Project** before first deploy):

| Setting | Value |
|---------|-------|
| **Root Directory** | `client` ← Click Edit, type `client`, SAVE |
| **Framework Preset** | Vite |
| **Build Command** | (leave blank) |
| **Output Directory** | (leave blank) |
| **Install Command** | (leave blank) |

## 3. Deploy

Click **Deploy**. The build will:
- Run from `client/` folder
- Use `client/vercel.json` (framework: vite, SPA rewrites)
- Output to `dist/` (Vite default)
- Serve correctly

## 4. Verify

- Build succeeds (check logs)
- Site loads at your URL
- Try `/orders`, `/new` – no 404

## If Still 404

1. **Confirm Root Directory** – Must be exactly `client` (not `.` or blank)
2. **Framework** – Must be Vite
3. **Redeploy** – After changing settings, trigger a new deployment
