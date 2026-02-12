# Vercel Deployment Checklist

Follow these steps when creating a **new** Vercel project:

## 1. Import Project

- Go to [vercel.com/new](https://vercel.com/new)
- Import your Git repository (GitHub, GitLab, or Bitbucket)

## 2. Project Settings (IMPORTANT)

**Two options – pick one:**

### Option A: Root Directory = `client` (Recommended)

| Setting | Value |
|---------|-------|
| **Framework Preset** | **Vite** |
| **Root Directory** | `client` |
| **Build Command** | (leave blank) |
| **Output Directory** | (leave blank) |
| **Install Command** | (leave blank) |

Uses `client/vercel.json` – Vite project at root, simpler setup.

### Option B: Root Directory = `.` (repo root)

| Setting | Value |
|---------|-------|
| **Framework Preset** | **Vite** |
| **Root Directory** | `.` or blank |
| **Build Command** | (leave blank – uses root `vercel.json`) |
| **Output Directory** | (leave blank) |
| **Install Command** | (leave blank) |

Uses root `vercel.json` – custom build from repo root.

**Critical:** Set Framework Preset to **Vite** explicitly. Do NOT use "Other".

## 3. Deploy

Click **Deploy**. The build will run and output should be served correctly.

## 4. Verify

- Build completes (check **Building** logs)
- Site loads at your Vercel URL
- Try `/orders`, `/new` – SPA routing should work

## 5. If You Still Get 404

1. **Check build logs** – Deployments → latest → Building
2. **Framework must be Vite** – Settings → General
3. **See** `docs/VERCEL_404_GUIDE.md` for full troubleshooting
