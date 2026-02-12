# Order Desk - Flower Delivery Order Management

A web app to manage flower delivery orders. Fast order entry, parsing, validation, message templates, and PDF/Excel exports.

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Storage:** Supabase (optional) or local Excel (`./data/orders.xlsx`)
- **Optional AI:** OpenAI for order parsing when `OPENAI_API_KEY` is set

## Folder Structure

```
orderformlb/
├── server/           # Express backend
├── client/           # React + Vite frontend
├── data/             # orders.xlsx, settings.json (local fallback)
├── exports/          # Generated PDFs and Excel reports
├── supabase/         # schema.sql for Supabase setup
└── package.json
```

## Setup

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
cd client && npm install && cd ..
```

### Run

```bash
# Start both server and client
npm run dev
```

Or separately:

```bash
npm run server   # Backend at http://localhost:3001
npm run client   # Frontend at http://localhost:5173
```

## Supabase (Optional)

When `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set, data is stored in Supabase instead of local Excel.

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase/schema.sql`
3. Get your project URL, **service_role** key, and **anon** key from **Settings → API**
4. Add to `.env`:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

5. Restart the server. New orders and settings will be stored in Supabase.
6. **Export** – Florist PDF, Driver Excel, and Finance Excel still work and read from Supabase.

## Data Files (Local)

When Supabase is not configured:

- **`./data/orders.xlsx`** – Created on first run. Contains the Orders sheet.
- **`./data/settings.json`** – Stores required fields, dropdown options (district, time window, size), AI parsing toggle.

## Enabling AI Parsing

1. Create a `.env` file in the project root:

   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

2. In the app, go to **Settings** and enable **Use AI parsing**. Use **Test OpenAI connection** to verify the API key works.

3. On the New Order page, paste raw order text and click **Parse**. If AI is enabled, it will use OpenAI to extract fields; otherwise local regex parsing is used.

To test from the command line: `npm run test:openai` (requires `OPENAI_API_KEY` in `.env`).

## Features

- **Orders List** - Table with search and filters (payment, delivery status, priority, date range)
- **New Order** - Raw text paste + Parse button, form with validation, save to Excel
- **Order Details** - Edit order, save, generate messages, generate florist PDF
- **Messages** - Confirmation, Payment Request, and Missing Info templates with copy-to-clipboard
- **Reports** - Florist PDF (single order), Driver Excel (daily), Finance Excel (date range)
- **Settings** - Required fields, district/time window/size dropdowns, AI parsing toggle

## Validation

- **Red:** Required field empty or invalid
- **Green:** Filled and valid
- **Gray:** Optional and empty

Validation rules: phone (digits, +66), maps link (maps.app.goo.gl or google.com/maps), money (>= 0), date (parseable).

## Railway Deployment (Full Stack)

For full deployment with backend, PDF generation, and data persistence:

1. **Supabase required** – Railway has ephemeral storage. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. **Deploy** – Push to GitHub and connect the repo in [Railway](https://railway.app). Railway uses the `Dockerfile` for Puppeteer support.
3. **Variables** – Add Supabase URL, service role key, and optionally `OPENAI_API_KEY`.
4. See **[RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md)** for step-by-step instructions.

## Vercel Deployment (Frontend Only)

1. **Push to git** – Vercel will build from the repo root using `vercel.json`.
2. **Root Directory** – Leave empty (do not set to `client`). The build runs from repo root.
3. **Note:** Only the frontend deploys. The backend (Express) and data (Excel) do not run on Vercel. API calls will fail. For full deployment with data persistence, use [Railway](https://railway.app).

If you still get 404:
- Check **Deployments** → click the latest → **Building** logs. Ensure the build succeeds.
- Clear **Root Directory** in Settings → General if it was set to `client`.
