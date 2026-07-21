# Photographic backgrounds

Drop a **clean background photo** here to turn a design into a full
photographic card — the frame, floral motifs, and your editable text (Hebrew
simcha word, honoree, dates, venue) are layered on top automatically.

> These must be **plain background photos with no text baked in** — e.g. a
> textured paper, a dramatic table-top photo. The app adds the text. Do **not**
> drop finished invitation images here; their text would collide with the
> app's text.

## The easy way — name the file after the theme

Just name the image after the design's theme id and upload it. No code change:

| Theme id | Design name        | Drop a file named…            |
|----------|--------------------|-------------------------------|
| `gilded` | Gilded Heirloom    | `gilded.jpg` / `gilded.png`   |
| `royal`  | Royal Sapphire     | `royal.jpg`                   |
| `garden` | Rose Garden        | `garden.jpg`                  |
| `ivory`  | Ivory Letterpress  | `ivory.jpg`                   |
| `estate` | Vintage Estate     | `estate.jpg`                  |
| `sky`    | Morning Sky        | `sky.jpg`                     |

Supported extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`. After
uploading, deploy (`deploy.sh`) — the app restarts, detects the file, and the
content-hash cache-buster makes browsers refresh automatically.

To remove a photographic background, delete its file; the design falls back to
its built-in CSS texture.

## Advanced — explicit filename

You can instead set a design's `bg` field in `lib/simcha.js` to any filename
in this folder (this overrides the auto-detected one):

```js
gilded: { ..., bg: 'my-parchment.jpg' },
```

## Image guidance

- **Aspect ratio:** 5:7 portrait (e.g. 1000×1400 or 1500×2100). Cropped to
  fill, centered.
- **Keep the center calm.** Text sits in the middle, so busy detail there hurts
  legibility. Frames and florals belong near the edges.
- **Format:** `.jpg` for photos (smaller); `.png`/`.webp` if you need
  transparency.
- **Licensing:** only use photos you own or that are licensed for commercial
  use.
- The `--c-scrim` layer adds a legibility wash; if text is still hard to read
  over a specific photo, deepen that theme's `--c-scrim` in
  `public/css/cards.css`.

Same-origin hosting (files served from this app) keeps the free PNG download
(`html2canvas`) working without tainting the canvas.
