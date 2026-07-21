import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, TAGLINE, THEMES, EVENTS, SAMPLE, sanitizeCard, englishDate, hebrewDate } from './lib/simcha.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3020;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

const common = { BRAND, TAGLINE, THEMES, EVENTS, englishDate, hebrewDate };

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
