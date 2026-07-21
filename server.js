import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BRAND, TAGLINE, THEMES, EVENTS, SAMPLE, sanitizeCard, englishDate, hebrewDate } from './lib/simcha.js';
import { createCard, getCard, updateCard } from './lib/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3020;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

const common = { BRAND, TAGLINE, THEMES, EVENTS, englishDate, hebrewDate };

// ---------- pages ----------

app.get('/', (req, res) => {
  res.render('home', { ...common, SAMPLE });
});

app.get('/design/:themeId', (req, res) => {
  const themeId = THEMES[req.params.themeId] ? req.params.themeId : null;
  if (!themeId) return res.status(404).render('notfound', { ...common });
  const data = sanitizeCard({ ...SAMPLE, themeId });
  res.render('editor', {
    ...common,
    mode: 'create',
    themeId,
    data,
    slug: '',
    editKey: '',
  });
});

app.get('/edit/:slug/:key', (req, res) => {
  const card = getCard(req.params.slug);
  if (!card || card.editKey !== req.params.key) {
    return res.status(404).render('notfound', { ...common });
  }
  res.render('editor', {
    ...common,
    mode: 'edit',
    themeId: card.data.themeId,
    data: card.data,
    slug: card.slug,
    editKey: card.editKey,
  });
});

app.get('/card/:slug', (req, res) => {
  const card = getCard(req.params.slug);
  if (!card) return res.status(404).render('notfound', { ...common });
  const d = card.data;
  const eventLabel = EVENTS[d.eventType]?.label || 'Simcha';
  const bits = [englishDate(d.date), d.time, d.venue].filter(Boolean).join(' · ');
  res.render('card', {
    ...common,
    data: d,
    slug: card.slug,
    ogTitle: `${d.honoree ? d.honoree + ' — ' : ''}${eventLabel} · You're Invited`,
    ogDesc: bits || `A ${eventLabel} invitation, created with ${BRAND}.`,
    ogUrl: `${BASE_URL}/card/${card.slug}`,
  });
});

// ---------- api ----------

app.get('/api/hebdate', (req, res) => {
  const { d, sunset } = req.query;
  res.json({ he: hebrewDate(d, sunset === '1'), en: englishDate(d) });
});

app.post('/api/cards', (req, res) => {
  const data = sanitizeCard(req.body?.data || {});
  const card = createCard(data);
  res.json({ slug: card.slug, editKey: card.editKey });
});

app.put('/api/cards/:slug', (req, res) => {
  const data = sanitizeCard(req.body?.data || {});
  const result = updateCard(req.params.slug, req.body?.editKey, data);
  if (result.error) return res.status(result.error).json({ error: result.error === 403 ? 'Invalid edit key' : 'Not found' });
  res.json({ slug: result.card.slug, editKey: result.card.editKey });
});

app.use((req, res) => res.status(404).render('notfound', { ...common }));

app.listen(PORT, () => console.log(`${BRAND} listening on :${PORT}`));
