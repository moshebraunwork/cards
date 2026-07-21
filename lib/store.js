import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'cards.json');

fs.mkdirSync(DATA_DIR, { recursive: true });

let cards = {};
try {
  cards = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch {
  cards = {};
}

function persist() {
  const tmp = FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(cards, null, 1));
  fs.renameSync(tmp, FILE);
}

const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'; // no confusable chars

function newSlug() {
  let slug;
  do {
    slug = Array.from(crypto.randomBytes(7), (b) => ALPHABET[b % ALPHABET.length]).join('');
  } while (cards[slug]);
  return slug;
}

export function createCard(data) {
  const slug = newSlug();
  const editKey = crypto.randomBytes(12).toString('hex');
  const now = new Date().toISOString();
  cards[slug] = { slug, editKey, data, createdAt: now, updatedAt: now };
  persist();
  return cards[slug];
}

export function getCard(slug) {
  return cards[slug] || null;
}

export function updateCard(slug, editKey, data) {
  const card = cards[slug];
  if (!card) return { error: 404 };
  const a = crypto.createHash('sha256').update(String(editKey || '')).digest();
  const b = crypto.createHash('sha256').update(card.editKey).digest();
  if (!crypto.timingSafeEqual(a, b)) return { error: 403 };
  card.data = data;
  card.updatedAt = new Date().toISOString();
  persist();
  return { card };
}
