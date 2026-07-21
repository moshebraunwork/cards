# Photographic backgrounds

Drop real photos here to turn any design into a full photographic mockup
(like professionally styled invitation cards).

## How it works

Each design in `lib/simcha.js` (the `THEMES` object) has a `bg` field:

```js
gilded: { no: '01', name: 'Gilded Heirloom', ..., frame: 'ornate', motif: 'none', bg: '' },
```

- `bg: ''`  → the card uses its built-in CSS texture (the current look).
- `bg: 'gilded.jpg'` → the card renders `/img/themes/gilded.jpg` as a full-bleed
  background photo, with the frame, floral motifs, scrim, and text layered on top.

So to give a design a real photographic background:

1. Add an image to this folder, e.g. `public/img/themes/gilded.jpg`.
2. Set that design's `bg` to the filename in `lib/simcha.js`, e.g. `bg: 'gilded.jpg'`.
3. Deploy. The content-hash cache-buster handles refreshes automatically.

## Image guidance

- **Aspect ratio:** 5:7 portrait (e.g. 1000×1400 or 1500×2100). The card is
  cropped to fill, centered.
- **Format:** `.jpg` for photos (smaller), `.png` if you need transparency.
- **Keep the center calm.** Text sits in the middle, so busy detail there hurts
  legibility. Ornate frames and florals belong near the edges.
- **Licensing:** only use photos you own or that are licensed for commercial use.
- The `--c-scrim` layer already adds a legibility wash; if text is still hard to
  read over a specific photo, deepen that theme's `--c-scrim` in `public/css/cards.css`.

Same-origin is required (files served from this app) so the free PNG download
(`html2canvas`) can render the photo without tainting the canvas.
