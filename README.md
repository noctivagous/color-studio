# Color Studio - NOCTIVAGOUS

Standalone color direction tool: harmony schemes, a hue wheel, saturation and lightness sliders, and tint / shade / tone swatches. Copied from gMixer’s color picker and detached so it can be used for art and design work in general.

gMixer is not wired to this folder.

## Run

```bash
cd color-studio
npm install
npm start
```

Open the URL Vite prints (usually `http://localhost:5173`).

`npm run build` writes a static site to `dist/`.

## User Workflow (and Pipeline)

1. **Scheme** — Choose from Analogous, Complementary, Split-Complementary, Triadic, or Tetradic. Accent hues sit as dots on the wheel.
2. **Hue** — Pick on the ring. Saturation and lightness stay where they are. The handle shows a full-chroma sample of that hue (`s=100`, `l=50`).
3. **Saturation & Lightness** — Refine the working color. Tracks show a band per scheme hue.

## Swatches

- **Base colors** — scheme hues at the current saturation and lightness.
- **Tint** — mix toward white (raise lightness).
- **Shade** — mix toward black (lower lightness).
- **Tone** — desaturate toward gray.

Click a swatch or the current hex to copy. Export the whole board as CSS custom properties (`--tint-0-2`, …) or a hex list.
