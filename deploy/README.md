# Deploying Ibokki to ibokki.com (Vultr)

One Node process serves everything — the built web client, the HTTP API
(accounts/decks) and the game WebSocket — behind Caddy for TLS. State is a
single SQLite file.

## One-time setup

```bash
# as root on the Vultr box (Ubuntu/Debian assumed)
apt install -y sqlite3 caddy               # caddy: see caddyserver.com/docs/install for the repo
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs

useradd -r -m -d /opt/ibokki ibokki
sudo -u ibokki git clone <this-repo> /opt/ibokki
cd /opt/ibokki
sudo -u ibokki npm ci
sudo -u ibokki npm run build:client        # emits apps/client/dist, served by the server

cp deploy/env.example .env                 # then fill in EMAIL_HOST_PASSWORD etc.
chown ibokki:ibokki .env && chmod 600 .env

cp deploy/ibokki.service /etc/systemd/system/
systemctl daemon-reload && systemctl enable --now ibokki

cp deploy/Caddyfile /etc/caddy/Caddyfile   # point ibokki.com DNS A record at this box first
systemctl reload caddy

# nightly backups (one file = whole database)
crontab -u ibokki -l 2>/dev/null | { cat; echo "0 4 * * * /opt/ibokki/deploy/backup.sh"; } | crontab -u ibokki -
```

## Updating

```bash
cd /opt/ibokki && sudo -u ibokki git pull && sudo -u ibokki npm ci \
  && sudo -u ibokki npm run build:client && systemctl restart ibokki
```

## Notes

- **Email**: uses the same ProtonMail SMTP account as the Django site
  (`EMAIL_HOST_USER`/`EMAIL_HOST_PASSWORD`); deliverability DNS for ibokki.com
  is already in place from that setup. Without a password set, mails print to
  the journal (`journalctl -u ibokki`) — fine for smoke-testing.
- **Health check**: `curl https://ibokki.com/health` → `ok`.
- **"Play vs bot" is dev-only** for now — the home screen hides it in
  production (it talks to the local playvsclaude server). Online matches via
  room codes are the product. Per-user bot matches on the online server is a
  straightforward follow-up if wanted.
- **Sizing**: this fits comfortably on the smallest Vultr plan (1 vCPU / 1 GB,
  ~$6/mo). The $100/mo instance is vast overkill for this workload.
