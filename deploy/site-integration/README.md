# Mounting the game at ibokki.com/play (two-repo deploy)

The game ships as a prebuilt image (`ghcr.io/moviedatascience/ibokki-game`),
published automatically by this repo's GitHub Action on every push to main.
The site repo only *references* the image — the repos stay fully separate.

**Deploy flow after this is set up:**
- Site change → same single command as today.
- Game change → push to main (CI builds the image), then on the box:
  `docker compose pull game && docker compose up -d game` — or add that line
  to the site's `deploy.sh` so one command still deploys everything.

## 1. Register the game as an OAuth app on the site

Django admin → *Django OAuth Toolkit* → *Applications* → Add:

- Client type: **Confidential**
- Grant type: **Authorization code**
- Redirect URIs: `https://ibokki.com/play/api/auth/oidc/callback`
- Algorithm: **RS256** (the site already signs OIDC tokens)
- Skip authorization: ✔ (first-party app — no consent screen)

Note the generated client id/secret (copy the secret before saving — DOT
hashes it after).

## 2. Add the game service to the site's docker-compose.prod.yml

Merge `compose.game.yml` from this directory (or paste the service in):
the game container, its SQLite volume, and env. Fill `IBOKKI_OIDC_CLIENT_ID`
/ `IBOKKI_OIDC_CLIENT_SECRET` in the site's `.env`.

## 3. Route /play in the site's nginx.conf

Paste the `location /play/` block from `nginx.game.conf` into the existing
`server {}` (above the catch-all `location /`). It proxies to the game
container and strips the `/play` prefix; websocket upgrade included.

## 4. Reload

```bash
docker compose -f deploy/docker-compose.prod.yml up -d game
docker compose -f deploy/docker-compose.prod.yml restart nginx   # or reload
```

`https://ibokki.com/play/` now serves the game; "Sign in with ibokki.com"
round-trips through `/o/authorize` and lands back signed in. Add a `/play`
link to the site nav and you're done.

## Notes

- The game keeps its own SQLite for decks/sessions (volume `ibokki_game_data`);
  identity comes from the site via OIDC, so there is no second password store —
  local registration hides itself when `IBOKKI_OIDC_*` is set.
- Back up the game volume alongside Postgres (it's one file; `deploy/backup.sh`
  in this repo shows the sqlite3 `.backup` invocation).
- Standalone mode (no site) still works exactly as before — see `deploy/README.md`.
