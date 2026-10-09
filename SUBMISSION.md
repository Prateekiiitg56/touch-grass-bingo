---
title: Touch Grass Bingo — offline nature bingo checked by an AI that lives on your phone
published: false
tags: devchallenge, hf26challenge, opensource, ai
---

*This is a submission for the [Hacktoberfest Open-Source AI Challenge Week 1: Touch Grass](https://dev.to/challenges/hacktoberfest-week1-2026-10-05)*

## What I Built

**Touch Grass Bingo** is a nature bingo card that you play outside. You open it, get a seasonal card (a red leaf, an acorn, moss, a feather, a mushroom…), and put your phone away. When you find something, you take one photo. An open-weight vision model running on your phone checks it and marks the square.

The center square is never free. It is **"Touch grass"**: a photo of your hand on real grass.

Who it is for:

- **Families** who want a reason to make a walk last longer.
- **Run clubs and hiking groups.** Everyone types the same card code (like `FERN-42`) and gets the same card. First to bingo wins. There are no accounts and no server.
- **Anyone doomscrolling** who needs a nudge. If you photograph your monitor, the model detects a screen and tells you that you cannot touch grass through a monitor.

The screen is the shortest part of the game: one glance at the card, then the phone goes in the pocket until you find something.

## Demo

**Play it:** https://prateekiiitg56.github.io/touch-grass-bingo/

Open it on your phone. Tap **Download photo checker** once on Wi-Fi (about 150 MB). After that, it works in airplane mode.

**Play the same card as a friend:** https://prateekiiitg56.github.io/touch-grass-bingo/?code=FERN-42

<!-- Add a short video of a real walk here: upload to YouTube and paste the link on its own line, e.g. {% embed https://youtu.be/YOUR_VIDEO %} -->

## Code

{% github Prateekiiitg56/touch-grass-bingo %}

## How I Built It

- **Model:** [CLIP ViT-B/32](https://huggingface.co/Xenova/clip-vit-base-patch32), open weights, ONNX export, 8-bit quantized (about 150 MB).
- **Runtime:** [Transformers.js](https://github.com/huggingface/transformers.js) on ONNX Runtime Web (WASM). Inference runs in the browser tab.
- **App:** plain HTML, CSS and JavaScript modules. No framework, no build step, no backend. Hosted free on GitHub Pages.
- **Design:** styled like a topographic map. Grid references (A1, B2…) run along the edge of the card, so a group can shout "got B2". A finished line is drawn as an orange trail-blaze route.
- **Offline:** a service worker caches the app shell and runtime. Transformers.js caches the model weights in the browser. After a one-time download on Wi-Fi, the app works in airplane mode.

The core trick is **zero-shot classification**. Each bingo square is only a text prompt, for example `"a photo of an acorn"`. When you take a photo, CLIP scores it against every item in the season's pool plus a set of distractors (a screen, an indoor room, a selfie, a document, a city street). On a laptop, one photo takes about 100 ms:

- If the square you tapped wins, you found it.
- If a different unfound square on your card wins clearly, the app marks that one as a bonus ("Not running water, but it is a mushroom").
- If a seasonal item that is not on your card wins, you get "Good find, but it is not on this card."
- If a distractor wins, the find does not count, and you get a hint.

My first version scored photos only against the squares on the card. In testing, a red maple leaf was marked as the "yellow leaf" square with 95% confidence, because it was the closest option. Scoring against the full season pool fixed this: the same photo now comes back as "red leaf, not on this card."

Group play uses a seeded shuffle: the card code, season and size feed a hash, which seeds a small PRNG that shuffles the season's item pool. Every phone with the same code deals the same card, with no network.

## Why Does Open Innovation Matter?

- **It works where the grass is.** Trails, parks and forests often have no signal. A closed vision API needs a network round trip for every photo. Open weights let the model live on the phone, so the game works in airplane mode.
- **Photos stay private.** Families take photos of kids' hands, backyards and favorite spots. With an on-device model, no photo is uploaded to a server that the player does not control.
- **It costs nothing to run.** No API key, no per-image bill, no rate limit. I can host it on GitHub Pages for free, and a whole run club can play without anyone paying.
- **It is easy to change.** Because CLIP is zero-shot and open, a new square is one line of text. A teacher can make a "schoolyard" card, a birding club can make a "local birds" card, and anyone can swap in a different open model (for example SigLIP) by changing one constant.

## My Agent Session

<!-- Optional: embed your DevRelay session here. -->

## Prize Categories

<!-- List the partner categories you are entering. -->
