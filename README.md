# Order Desk - Flower Delivery Order Management

A local-first web app to manage flower delivery orders. Fast order entry, parsing, validation, message templates, and PDF/Excel reports.

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **Storage:** Local Excel only (`./data/orders.xlsx`)
- **Optional AI:** OpenAI for order parsing when `OPENAI_API_KEY` is set

## Folder Structure

```
orderformlb/
├── server/           # Express backend
├── client/           # React + Vite frontend
├── data/             # orders.xlsx, settings.json
├── exports/          # Generated PDFs and Excel reports
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

## Data Files

- **`./data/orders.xlsx`** - Created automatically on first run. Contains the Orders sheet with all order columns.
- **`./data/settings.json`** - Created automatically. Stores required fields, dropdown options, and AI parsing toggle.

## Enabling AI Parsing

1. Create a `.env` file in the project root:

   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

2. In the app, go to **Settings** and enable **Use AI parsing**.

3. On the New Order page, paste raw order text and click **Parse**. If AI is enabled, it will use OpenAI to extract fields; otherwise local regex parsing is used.

## Features

- **Orders List** - Table with search and filters (payment, delivery status, priority, date range)
- **New Order** - Raw text paste + Parse button, form with validation, save to Excel
- **Order Details** - Edit order, save, generate messages, generate florist PDF
- **Messages** - Confirmation, Payment Request, and Missing Info templates with copy-to-clipboard
- **Reports** - Florist PDF (single order), Driver Excel (daily), Finance Excel (date range)
- **Settings** - Required fields, district/time window dropdowns, AI parsing toggle

## Validation

- **Red:** Required field empty or invalid
- **Green:** Filled and valid
- **Gray:** Optional and empty

Validation rules: phone (digits, +66), maps link (maps.app.goo.gl or google.com/maps), money (>= 0), date (parseable).

## Vercel Deployment (Frontend Only)

1. **Push to git** – Vercel will build from the repo root using `vercel.json`.
2. **Root Directory** – Leave empty (do not set to `client`). The build runs from repo root.
3. **Note:** Only the frontend deploys. The backend (Express) and data (Excel) do not run on Vercel. API calls will fail. For full deployment with data persistence, use [Railway](https://railway.app) or [Render](https://render.com).

If you still get 404:
- Check **Deployments** → click the latest → **Building** logs. Ensure the build succeeds.
- Clear **Root Directory** in Settings → General if it was set to `client`.
