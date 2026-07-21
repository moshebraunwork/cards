import { HDate } from '@hebcal/core';

export const BRAND = 'BeSimcha';
export const TAGLINE = 'Elegant digital invitations for every simcha';

// Each theme carries its palette (in cards.css) plus a design recipe:
//   frame  — border overlay style: 'ornate' | 'deco' | 'plain'
//   motif  — floral corner accent:  'rose'  | 'orchid' | 'none'
//   bg     — optional photographic background filename in /public/img/themes/.
//            When present the card renders the photo; otherwise it falls back
//            to the rich CSS texture for that theme. Drop a real photo in and
//            set this to switch a design to the full photographic look.
export const THEMES = {
  gilded: { no: '01', name: 'Gilded Heirloom',   desc: 'Warm parchment, ornate gold frame, classic serif.', frame: 'ornate', motif: 'none',   bg: '' },
  royal:  { no: '02', name: 'Royal Sapphire',    desc: 'Deep navy velvet with art-deco gold foil.',         frame: 'deco',   motif: 'none',   bg: '' },
  garden: { no: '03', name: 'Rose Garden',       desc: 'Soft blush and sage with hand-drawn roses.',        frame: 'plain',  motif: 'rose',   bg: '' },
  ivory:  { no: '04', name: 'Ivory Letterpress', desc: 'Minimal ivory, letterpress restraint.',             frame: 'plain',  motif: 'none',   bg: '' },
  estate: { no: '05', name: 'Vintage Estate',    desc: 'Rich burgundy and cream with an ornate gold frame.', frame: 'ornate', motif: 'none',   bg: '' },
  sky:    { no: '06', name: 'Morning Sky',       desc: 'Pale blue and slate with orchid sprigs.',           frame: 'plain',  motif: 'orchid', bg: '' },
};

// `heb` is the large foil Hebrew simcha word rendered as the card's focal point.
export const EVENTS = {
  'bris':          { label: 'Bris',          heb: 'ברית מילה',  invite: 'With gratitude to Hashem, we joyfully invite you to the Bris of our son' },
  'sholom-zochor': { label: 'Sholom Zochor', heb: 'שלום זכר',   invite: 'You are warmly invited to a Sholom Zochor in honor of the birth of our son' },
  'kiddush':       { label: 'Kiddush',       heb: 'קידוש',      invite: 'You are warmly invited to a Kiddush in honor of the birth of our daughter' },
  'pidyon-haben':  { label: 'Pidyon HaBen',  heb: 'פדיון הבן',  invite: 'We joyfully invite you to the Pidyon HaBen of our son' },
  'upsherin':      { label: 'Upsherin',      heb: 'אפשערן',     invite: 'We joyfully invite you to the Upsherin of our son' },
  'bar-mitzvah':   { label: 'Bar Mitzvah',   heb: 'בר מצוה',    invite: 'We are honored to invite you to celebrate the Bar Mitzvah of our son' },
  'bas-mitzvah':   { label: 'Bas Mitzvah',   heb: 'בת מצוה',    invite: 'We are honored to invite you to celebrate the Bas Mitzvah of our daughter' },
  'vort':          { label: 'Vort',          heb: 'וארט',       invite: 'With hearts full of joy, we invite you to the Vort of our children' },
  'lchaim':        { label: "L'chaim",       heb: 'לחיים',      invite: "You are warmly invited to a L'chaim in honor of the engagement of" },
  'chasunah':      { label: 'Chasunah',      heb: 'חתונה',      invite: 'We request the honor of your presence at the Chasunah of our children' },
  'sheva-brachos': { label: 'Sheva Brachos', heb: 'שבע ברכות',  invite: 'You are cordially invited to Sheva Brachos in honor of' },
  'siyum':         { label: 'Siyum',         heb: 'סיום',       invite: 'You are cordially invited to a Siyum in honor of' },
};

// Sample content used on the landing gallery previews.
export const SAMPLE = {
  eventType: 'bar-mitzvah',
  bsd: true,
  inviteLine: EVENTS['bar-mitzvah'].invite,
  honoree: 'Yosef Chaim',
  hostsLine: 'Dovid & Miriam Goldberg',
  date: '2026-08-23',
  afterSunset: false,
  time: '7:00 PM',
  venue: 'Ateres Chana Hall',
  address: '221 Maple Ave, Monsey, NY',
  note: 'Kabbolas Ponim 6:30 · Seuda to follow',
  signoff: '',
};

const clamp = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function sanitizeCard(input = {}) {
  const eventType = EVENTS[input.eventType] ? input.eventType : 'bar-mitzvah';
  const themeId = THEMES[input.themeId] ? input.themeId : 'gilded';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(input.date || '') ? input.date : '';
  return {
    themeId,
    eventType,
    bsd: !!input.bsd,
    inviteLine: clamp(input.inviteLine, 200),
    honoree: clamp(input.honoree, 120),
    hostsLine: clamp(input.hostsLine, 160),
    date,
    afterSunset: !!input.afterSunset,
    time: clamp(input.time, 60),
    venue: clamp(input.venue, 120),
    address: clamp(input.address, 200),
    note: clamp(input.note, 400),
    signoff: clamp(input.signoff, 120),
  };
}

export function parseYMD(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], 12, 0, 0); // noon avoids DST edges
}

export function englishDate(s) {
  const d = parseYMD(s);
  if (!d) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function hebrewDate(s, afterSunset = false) {
  const d = parseYMD(s);
  if (!d) return '';
  if (afterSunset) d.setDate(d.getDate() + 1);
  try {
    return new HDate(d).renderGematriya();
  } catch {
    return '';
  }
}
