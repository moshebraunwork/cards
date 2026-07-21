# BeSimcha — Digital Simcha Invitation Studio

An iyh.cards-style invitation studio: pick a design, personalize it with live preview
(automatic Hebrew date incl. after-shkiah adjustment), then share a public card link and
keep a private edit link. Cards can also be downloaded as PNG images.

## Stack

- Node.js (>= 18, ESM) + Express + EJS
- `@hebcal/core` for Hebrew dates (server-side)
- JSON file storage (`data/cards.json`, atomic writes) — no native modules, no DB setup
- html2canvas (vendored) for client-side PNG export
- 6 card themes, 12 event types

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing + design gallery |
| `/design/:themeId` | Editor (gilded, royal, garden, ivory, estate, sky) |
| `/edit/:slug/:key` | Editor prefilled for an existing card (private link) |
| `/card/:slug` | Public shareable card w/ OG tags (WhatsApp preview) |
| `GET /api/hebdate?d=YYYY-MM-DD&sunset=0|1` | Hebrew + English date strings |
| `POST /api/cards` | Create card → `{slug, editKey}` |
| `PUT /api/cards/:slug` | Update (requires `editKey` in body) |

## Env

- `PORT` (default 3020)
- `BASE_URL` (used in OG tags, e.g. `https://cards.mobrauntech.com`)
- `DATA_DIR` (default `./data`)

## Run locally

```
npm install
npm start
```

## Deploy on the Oracle VM (cards.mobrauntech.com)

1. **DNS** — Namecheap: add A record `cards` → `150.136.172.77`.

2. **Upload + install** (from your Windows machine, cmd.exe):
```
scp simcha-cards.zip ubuntu@150.136.172.77:~
ssh ubuntu@150.136.172.77
```
Then on the VM:
```
sudo apt install -y unzip
unzip simcha-cards.zip -d ~/simcha-cards && cd ~/simcha-cards
npm install --omit=dev
```

3. **PM2**:
```
BASE_URL=https://cards.mobrauntech.com pm2 start server.js --name simcha-cards --update-env
pm2 save
```

4. **Nginx**:
```
sudo cp deploy/nginx-cards.mobrauntech.com.conf /etc/nginx/sites-available/cards.mobrauntech.com
sudo ln -s /etc/nginx/sites-available/cards.mobrauntech.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

5. **TLS**:
```
sudo certbot --nginx -d cards.mobrauntech.com
```

6. **Verify**: open https://cards.mobrauntech.com, create a card, open the share
   link in WhatsApp to confirm the preview renders.

Backups: everything lives in `data/cards.json` — include it in whatever backup you
run for the VM.

## Rebranding

Brand name/tagline live in one place: `lib/simcha.js` (`BRAND`, `TAGLINE`).
Themes and event types are defined in the same file; card styling is in
`public/css/cards.css` under `[data-theme="..."]` blocks.
