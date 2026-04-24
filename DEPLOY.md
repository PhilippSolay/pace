# Pace — Deploy Guide

## Target
- Host: 76.13.192.55 (solay.cloud VPS)
- Domain: https://pace.solay.cloud
- Stack: Docker + Traefik (Let's Encrypt) shared with crea.solay.cloud and ai-salon.solay.cloud

## First-time setup on the VPS

```bash
ssh root@76.13.192.55
mkdir -p /opt/pace
```

Copy `compose.yml` to `/opt/pace/compose.yml` on the VPS (scp or paste).

## Deploy from local

```bash
cd /Users/philippsolay/Library/CloudStorage/Dropbox/Projects/Pace

# Build locally
docker build -t pace:latest .

# Transfer to VPS
docker save pace:latest | ssh root@76.13.192.55 "docker load"

# Bring up (or restart) the service
ssh root@76.13.192.55 "cd /opt/pace && docker compose up -d"
```

## DNS

Add an A record in your DNS provider pointing `pace.solay.cloud` → `76.13.192.55`. Traefik handles the cert issuance on first request.

## Verify

```bash
curl -I https://pace.solay.cloud/
# HTTP/2 200 — you should see cache-control headers
```

## Rollback

```bash
ssh root@76.13.192.55 "cd /opt/pace && docker compose down"
# Build the previous tag locally, docker save | ssh | docker load, up -d
```

## Notes
- No env vars needed — v1 is fully local-first, no backend or secrets
- PWA service worker handles offline; add-to-home-screen gives the installed experience
- Web Share Target POSTs land on /share — SW intercepts and redirects into the paste/PDF flow
