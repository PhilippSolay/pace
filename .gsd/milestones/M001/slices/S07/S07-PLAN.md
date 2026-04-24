# S07: PWA Install + Share Target + Deploy

**Goal:** Installable PWA with share target; deployed to `pace.solay.cloud` via Docker+Traefik on the VPS.

## Must-Haves
- Placeholder PWA icons (192/512/maskable) generated from a simple SVG wordmark (Pace. in Fraunces on dark stage with accent period)
- `share_target` entry in the web manifest: POST /share with text/plain + application/pdf files
- `/share` route client-side handler — accepts POSTed payload via SW, stores in a temp localStorage slot, navigates to /new/paste (for text) or /new/pdf (for files)
- `Dockerfile` — multi-stage: node:20-alpine builds, nginx:1.27-alpine serves dist
- `nginx.conf` — SPA fallback, long-cache for /assets/*, no-cache for index.html + sw.js + manifest, gzip on
- `compose.yml` — Traefik-labeled service for pace.solay.cloud
- `DEPLOY.md` — local build → docker save | ssh | docker load → compose up

## Tasks
- [ ] T01 4 agents: icons + manifest share_target + Docker infra + Share route handler
