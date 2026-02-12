# Vercel Deployment

## 1. Root Directory: Leave BLANK or set to `.`

Do **NOT** set Root Directory to `client`. Use the repo root.

## 2. Configure Settings

Go to **Settings** → **General**:

| Setting | Value |
|---------|-------|
| **Root Directory** | Leave **blank** or `.` |
| **Framework Preset** | Vite |
| **Build Command** | (leave blank – uses root `vercel.json`) |
| **Output Directory** | (leave blank) |
| **Install Command** | (leave blank) |

## 3. Deploy

The root `vercel.json` configures:
- Build from repo root: `cd client && npm install && npm run build`
- Output: `client/dist`
- SPA rewrites for routing

## 4. Verify

- Build succeeds (check logs)
- Site loads at your URL
- Try `/orders`, `/new` – no 404
