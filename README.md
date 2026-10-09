# Touch Grass Bingo

Offline nature bingo for walks, hikes and run clubs. The app deals you a seasonal bingo card (a red leaf, an acorn, moss, a feather…). You go outside and take a photo only when you find a square. An open-weight AI model running **on your phone** checks the photo. No signal is needed and no photo leaves the device.

- **Open-weight model:** [CLIP ViT-B/32](https://huggingface.co/Xenova/clip-vit-base-patch32) (ONNX, 8-bit quantized)
- **Open-source runtime:** [Transformers.js](https://github.com/huggingface/transformers.js) 3.7.6 on ONNX Runtime Web (WASM)
- **No backend:** static files only. Host on GitHub Pages, Netlify or any static host.

## How it works

1. **Field kit.** On Wi-Fi, tap *Download field kit*. The model (about 150 MB) goes into the browser cache. A service worker caches the app shell and runtime. From then on the app works in airplane mode.
2. **Deal a card.** A card code (for example `FERN-42`) seeds a deterministic shuffle of the season's item pool. Same code, same card on every phone. Friends and run clubs play the same card with no accounts and no server. Share a link as `?code=FERN-42`.
3. **Snap.** Tap a square (or *Snap anything*). CLIP scores the photo against the whole season's item pool plus distractors (screen, indoor room, selfie, document, street) using zero-shot classification. Scoring against the full pool stops a red leaf from counting as the "yellow leaf" square just because it is the closest thing on your card.
   - Tapped square ranks first, or second with ≥ 15% while no distractor wins: found.
   - Another unfound square on your card wins with ≥ 25%: marked as a bonus.
   - An item that is not on your card wins: "Nice find, but it is not on this card."
   - A screen wins: "You cannot touch grass through a monitor."
4. **Bingo.** Rows, columns and diagonals count. The center square is *Touch grass*: a photo of your hand on real grass. It is never free.
5. **Share.** Renders a PNG of your card with your photos and minutes spent outside.

## Run locally

```bash
python -m http.server 5180
```

Open http://localhost:5180. Camera capture on a phone needs HTTPS, so deploy to GitHub Pages for real use.

## Change the game

- Add or edit items in `items.js`. Each item has a `prompt`, which is the text CLIP matches against. No training needed: zero-shot means a new square is one line.
- Swap the model by changing `MODEL` in `app.js` to any Transformers.js zero-shot image model (for example a SigLIP checkpoint).
- Tune strictness with `MATCH_TARGET` and `MATCH_ANY` in `app.js`.

## License

MIT
