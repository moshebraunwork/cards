import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { BRAND, TAGLINE, THEMES, EVENTS, SAMPLE, sanitizeCard, englishDate, hebrewDate } from './lib/simcha.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');
const app = express();
const PORT = process.env.PORT || 3020;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(express.static(publicDir, { maxAge: '7d' }));

// Cache-busting: append a short content hash to static asset URLs so a new
// deploy forces browsers to refetch, while the long max-age above still lets
// unchanged files stay cached. Hashes are computed once per file and memoized;
// the app restarts on every deploy, so the map is rebuilt with fresh content.
const assetVersions = new Map();
function asset(urlPath) {
  if (!assetVersions.has(urlPath)) {
    let v = '';
    try {
      const buf = fs.readFileSync(path.join(publicDir, urlPath.replace(/^\/+/, '')));
      v = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
    } catch {
      v = '';
    }
    assetVersions.set(urlPath, v);
  }
  const v = assetVersions.get(urlPath);
  return v ? `${urlPath}?v=${v}` : urlPath;
}

const common = { BRAND, TAGLINE, THEMES, EVENTS, englishDate, hebrewDate, asset };

app.get('/', (req, res) => {
  res.render('home', { ...common, SAMPLE });
});

app.get('/design/:themeId', (req, res) => {
  const themeId = THEMES[req.params.themeId] ? req.params.themeId : null;
  if (!themeId) return res.status(404).render('notfound', { ...common });
  const data = sanitizeCard({ ...SAMPLE, themeId });
  res.render('editor', { ...common, themeId, data });
});

app.get('/api/hebdate', (req, res) => {
  const { d, sunset } = req.query;
  res.json({ he: hebrewDate(d, sunset === '1'), en: englishDate(d) });
});

app.use((req, res) => res.status(404).render('notfound', { ...common }));

app.listen(PORT, () => console.log(`${BRAND} listening on :${PORT}`));
