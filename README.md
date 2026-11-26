# Scholaris ICSE

ICSE Class X question paper generator, marking-scheme PDF exporter and concept-clearance studio, powered by Gemini.

This is a full-stack app: a React frontend plus a small Express server (`server.ts`) that calls the Gemini API. It needs a host that runs Node. **GitHub Pages can't run it** (it only serves static files).

## Deploy (free, on Render)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/eternalethereal43/ICSE-QP)

1. Get a Gemini API key at <https://aistudio.google.com/apikey>.
2. Click the button above, sign in to Render with GitHub, and allow it to read this repo.
3. When asked for `GEMINI_API_KEY`, paste your key, then click **Apply / Deploy**.
4. When the build finishes, open the `https://….onrender.com` link Render shows.

The settings live in `render.yaml`. Every push to `main` redeploys automatically. On the free plan the app sleeps after 15 minutes without visitors, so the first visit after that takes about a minute to load.

## Run locally

Prerequisite: Node.js 22.12 or newer.

```bash
npm install
cp .env.example .env         # then put your real key in GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

Production build: `npm run build`, then `NODE_ENV=production npm start`.
