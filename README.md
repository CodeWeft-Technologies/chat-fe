# Frontend Dashboard

Simple Next.js dashboard to manage bots, add knowledge, view activity, and copy embed snippets.

## Prerequisites
- Node.js 18+ and npm
- Running backend API (default `http://localhost:8000`)

## Quick Start
1. Install dependencies:
   
   ```bash
   npm install
   ```

2. Set environment variables (create `.env.local`):
   
   ```bash
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   NEXT_PUBLIC_DEFAULT_ORG_ID=your-org-id
   ```

3. Run dev server:
   
   ```bash
   npm run dev
   ```

4. Open `http://localhost:3000`.

## Features
- Bots: create and configure bots, rotate public API keys.
- Add Knowledge: add text, website URLs, and PDFs to power retrieval.
- Activity: view daily conversations, helpful answers, and confidence.
- Embed: copy website embed snippets (bubble, inline, iframe, CDN).

## Notes
- Org is read-only to prevent cross-tenant access.
- For public embeds, set a bot’s public API key in Config and include it in the site snippet.

