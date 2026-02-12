# Vercel NOT_FOUND (404) Error - Complete Guide

## 1. The Fix

### Option A: Root Directory = `client` (Recommended)

1. **Put `vercel.json` in the `client/` folder** (already done)
2. **In Vercel Dashboard** → Project Settings → General:
   - **Root Directory:** `client`
   - **Framework Preset:** Vite (or leave blank – `vercel.json` specifies it)
3. **Redeploy**

### Option B: Root Directory = `.` (repo root)

1. **Root `vercel.json`** already configures:
   - `framework: "vite"`
   - `buildCommand: "npm run build"`
   - `outputDirectory: "client/dist"`
   - Rewrites for SPA routing
2. **In Vercel Dashboard:**
   - **Root Directory:** `.` or blank
   - **Framework Preset:** Vite
3. **Redeploy**

---

## 2. Root Cause

### What was happening vs. what was needed

| What Vercel was doing | What it needed to do |
|-----------------------|----------------------|
| Request for `/` → no matching static file → no rewrite match → **404** | Request for `/` → rewrite to `/index.html` → serve the SPA |
| Framework "Other" → wrong build/output assumptions | Framework "Vite" → correct build command and output dir |
| Complex regex `/:path((?!assets/).*)` might not match `/` | Simple `/(.*)` matches all paths (static files served first) |

### Conditions that trigger 404

1. **Empty or wrong output directory** – Build succeeds but Vercel looks in the wrong place for files
2. **Missing framework** – Vercel doesn’t run the right build or use the right output
3. **SPA routing** – `/orders`, `/new` etc. have no physical files; they need rewrites to `/index.html`
4. **Root path** – `/` must serve `index.html`; if no rewrite, it can 404

### Common mistakes

- Using `framework: null` or "Other" when the app is a Vite SPA
- Wrong `outputDirectory` for a monorepo (e.g. `dist` instead of `client/dist` when building from root)
- Overly strict rewrite pattern that doesn’t match `/` or other routes
- Root Directory set to `client` but config still expects builds from repo root

---

## 3. Underlying Concepts

### Why the 404 exists

- Vercel serves **static files** from the output directory.
- A request for `/orders` has no file at `/orders` → 404.
- SPAs only have `index.html` and assets; routing is handled in the browser. The server must serve `index.html` for all non-asset routes.

### How Vercel serves requests

1. **Static files** – If a file exists (e.g. `/assets/index-xxx.js`), it’s served.
2. **Rewrites** – If no file matches, rewrites are applied.
3. **404** – If nothing matches, Vercel returns 404.

For a Vite SPA, rewrites must send all non-asset routes to `/index.html`.

### Framework detection

- Vercel uses the **framework preset** to choose build command and output directory.
- With `framework: "vite"`, it expects `vite build` and output in `dist/`.
- In a monorepo, that may be wrong, so you override with `buildCommand` and `outputDirectory`.

---

## 4. What to Watch For

### Signs of this issue

- Site works locally but 404 on Vercel
- Build succeeds but deploying shows 404
- Direct URL works (`/`) but client-side routes (`/orders`) return 404
- Framework preset is "Other" for a Vite/React app

### Related pitfalls

- **Similar regex issues** – Ensure patterns match `/` and other routes.
- **Trailing slashes** – `trailingSlash` can change behavior.
- **Root Directory** – Changing it changes where `vercel.json` and `package.json` are read from.

### Code smells

- `framework: null` with a known framework
- `outputDirectory` that doesn’t match where the build actually writes
- Custom rewrites that don’t cover the root path

---

## 5. Alternative Approaches

### A. Root Directory = `client`

- **Pros:** Simple, Vite at project root
- **Cons:** Need to set Root Directory in dashboard

### B. Root Directory = `.` with custom build

- **Pros:** Single config in root `vercel.json`
- **Cons:** More complex build commands

### C. Move Vite to repo root

- **Pros:** Matches Vercel’s default Vite layout
- **Cons:** Large refactor

### D. Use `vite-plugin-vercel`

- **Pros:** Deeper Vercel integration
- **Cons:** Extra dependency and config

---

**Recommendation:** Use **Option A** (Root Directory = `client`) for the simplest setup.
