# Emilie's Paris Guide - Deployment Guide

A personal Paris recommendation guide where multiple friends can contribute spots, tips, and love notes.

## Quick Start (Local Dev)

```bash
cd paris-guide
npm install
npm run dev
```

Open http://localhost:5173 - the app works immediately with localStorage (single-user mode).

## Deploy for Multiple Users (15 min setup)

### Step 1: Set up Supabase (free database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (pick any region, set a DB password)
3. Wait ~2 min for it to provision
4. Go to **SQL Editor** in the left sidebar
5. Paste the contents of `supabase-setup.sql` and click **Run**
6. Go to **Settings > API** and copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

### Step 2: Configure environment variables

Edit your `.env` file:

```
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
VITE_SUPABASE_URL=....
VITE_SUPABASE_ANON_KEY=....
```

### Step 3: Deploy to Vercel (free, gets you a URL)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   gh repo create emilie-paris-guide --public --push
   ```

2. Go to [vercel.com](https://vercel.com), sign in with GitHub

3. Click **Add New Project**, import your repo

4. In **Environment Variables**, add all three:
   - `VITE_MAPBOX_ACCESS_TOKEN` = your mapbox token
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

5. Click **Deploy**

6. Done! You get a URL like `emilie-paris-guide.vercel.app`

### Step 4 (Optional): Custom domain

In Vercel dashboard > Settings > Domains, add your custom domain.

## Architecture

```
src/
  App.jsx        - Main React app (all views: landing, contribute, explore)
  supabase.js    - Data layer (Supabase for multi-user, localStorage fallback)
  main.jsx       - Entry point
  index.css      - Tailwind + custom styles
public/
  landing-bg.jpg - Landing page background photo
  inner-bg.jpg   - Inner pages background
```

**Map**: Uses Mapbox GL JS directly (not Leaflet, not iframe). Dark style with emoji markers.

**Search**: Mapbox Search Box API (`/suggest` + `/retrieve`) for POI search (restaurants, cafes, parks by name).

**Data**: When Supabase is configured, all data is stored in the cloud and visible to everyone. Without Supabase, falls back to localStorage (single device only).

## Mapbox Token Notes

Your token has the Search Box API enabled. For production, you should:
- Go to [mapbox.com/account/access-tokens](https://account.mapbox.com/access-tokens/)
- Restrict your token to only your deployment URL(s)
- This prevents others from using your token
