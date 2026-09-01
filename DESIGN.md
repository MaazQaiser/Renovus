# Design system — gradient ground + frosted glass

A portable record of the UI language: the background, the glass material, and the
rules that make them work together. Values are copy-pasteable. Where a choice was
non-obvious the reasoning is recorded, because most of these were arrived at by
measuring rather than guessing — and several obvious-looking shortcuts are wrong.

Written for Tailwind v4 (`@theme inline` + CSS custom properties), but nothing
here depends on Tailwind. The tokens are plain CSS.

---

## 1. The background

One `linear-gradient` on `body`. The character is a **temperature shift, not a
hue shift**: cool blue-grey at the top, neutral in the middle, warm cream at the
bottom.

```css
body {
  min-height: 100%;
  background: linear-gradient(
    180deg,
    #f0f3f3 0%,    /* cool — blue-leaning */
    #f4f4ef 52%,   /* neutral */
    #f6f4e9 100%   /* warm — cream */
  );
  background-attachment: fixed;   /* stays put while content scrolls */
  background-repeat: no-repeat;
}
```

**Keep all three stops.** Dropping the warm end is what makes it collapse into
flat grey — the warmth at the bottom is doing most of the perceptual work. Yellow
comes from pulling **blue down** relative to red/green, applied progressively:
almost nothing at the top (`B = G`), most at the bottom (`B` is 11 below `G`).

| Stop | Hex | Blue vs green |
|---|---|---|
| Top | `#F0F3F3` | 0 below |
| Mid | `#F4F4EF` | 5 below |
| Bottom | `#F6F4E9` | 11 below |

**Two mistakes worth avoiding.** A first attempt used cool→cool and got *lighter*
downward; it read as flat grey and users reported "I can't see the background".
A second attempt piled on four radial washes with visible blue and violet tints,
which read as a dashboard skin rather than paper. A plain 3-stop vertical ramp
with a warm foot beat both.

**Nothing above it may be opaque.** Every full-height wrapper has to be
transparent or the gradient is painted over. Audit for `bg-background` (or its
equivalent) on app shells, auth guards, layout wrappers, and the root page — this
is the single most common reason "the gradient isn't showing".

---

## 2. The glass material

Translucency alone reads as **faded**. What makes a surface read as a physical
pane is the combination of three things:

1. a translucent fill,
2. a wide `backdrop-blur`,
3. **a lit top edge** — an inset white highlight.

Skip (3) and it looks like a washed-out box.

```css
:root {
  --glass:          rgb(255 255 255 / 0.55);  /* default chrome fill      */
  --glass-strong:   rgb(255 255 255 / 0.78);  /* hover / raised state     */
  --glass-quiet:    rgb(255 255 255 / 0.40);  /* nested chips, dashed CTA */
  --glass-border:   rgb(255 255 255 / 0.75);  /* translucent, not grey    */
  --glass-hairline: rgb(16 24 40 / 0.06);     /* faint structural rule    */

  --shadow-glass:
    inset 0 1px 0 0 rgb(255 255 255 / 0.75),  /* the lit top edge         */
    0 0 0 1px rgb(16 24 40 / 0.035),          /* hairline ring            */
    0 8px 20px -8px rgb(16 24 40 / 0.10);     /* soft lift                */

  --shadow-raised:
    inset 0 1px 0 0 rgb(255 255 255 / 0.9),
    0 0 0 1px rgb(16 24 40 / 0.05),
    0 14px 32px -10px rgb(16 24 40 / 0.16);
}
```

**Applying it:**

```html
<div class="rounded-xl border border-glass-border bg-glass
            shadow-[var(--shadow-glass)] backdrop-blur-3xl
            transition-[box-shadow,background-color] duration-[140ms]
            hover:bg-glass-strong hover:shadow-[var(--shadow-raised)]">
```

**Borders are translucent white, not grey.** A grey line outlines the shape; a
white one makes the edge *glow*, which is what glass does.

**0.55 is roughly the floor.** Below ~0.45 body text starts losing contrast
against the gradient. If you want more glass than that, increase the blur or the
background's contrast — do not thin the fill further.

### Apply it to every surface, or none

Glass fails loudly when one element stays opaque: it reads as a solid patch
stuck on top. In practice the misses are always hand-rolled components that
don't use the shared `Card`, so **changing the card primitive is not enough**.
Sweep for hard-coded surface classes (`bg-surface`, `bg-white`, `bg-surface-tertiary`)
and cover:

- cards, list rows, and list containers
- inputs and textareas
- icon buttons, segmented controls, selects
- the topbar (or drop its background and border entirely so content scrolls under)
- nested chips — an avatar/initials square inside a glass card is the most
  commonly missed one

---

## 3. Shape

Pills for anything interactive, generously rounded panels for anything containing
content. A flat `2/4/6/8px` scale reads too hard for this material.

```css
--radius-sm:  6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-xl: 16px;   /* cards */
--radius-2xl: 26px;
```

- **Buttons / inputs / icon buttons / segmented controls** → `rounded-full`
- **Cards / panels / list containers** → `rounded-xl` (16px)
- Pills need more horizontal padding than rectangles: `px-3.5 / px-5 / px-6` at
  `h-8 / h-10 / h-12`.

Round the **fill** of a progress bar as well as its track, or short values poke
out of the rounded end as a square stub.

---

## 4. Borders on a warm ground

This is where a cool-grey palette betrays you. Contrast measured against the mid
gradient stop (`#F4F4EF`):

| Token | Hex | Contrast | Reads as |
|---|---|---|---|
| `slate-100` | `#F1F5F9` | **1.01 : 1** | invisible |
| `slate-200` | `#E2E8F0` | 1.12 : 1 | very faint |
| **`slate-300`** | **`#CBD5E1`** | **1.35 : 1** | clearly visible |

The slate ramp is built for cool-white backgrounds (`#F8FAFC`-ish). On warm
ground its light steps have nowhere to go — `slate-100` is *lighter* in the blue
channel than the surface it sits on and identical in luminance.

**Use `slate-300` for visible separators and `slate-200` for a quiet track.**
Do not reach for `slate-100`; it disappears.

Measure, don't eyeball:

```js
const lum = ([r,g,b]) => { const f = v => (v/=255) <= 0.03928 ? v/12.92
  : ((v+0.055)/1.055)**2.4; return 0.2126*f(r) + 0.7152*f(g) + 0.0722*f(b); };
const ratio = (a,b) => (Math.max(lum(a),lum(b)) + 0.05) / (Math.min(lum(a),lum(b)) + 0.05);
```

Tailwind v4 reports colours in `oklch`/`lab`, so `getComputedStyle` returns
`lab(96.28 -0.85 -2.47)` rather than `rgb(...)`. Convert through a canvas before
comparing:

```js
const cv = document.createElement('canvas'); cv.width = cv.height = 1;
const cx = cv.getContext('2d');
const toRgb = css => { cx.fillStyle = css; cx.fillRect(0,0,1,1);
  return [...cx.getImageData(0,0,1,1).data].slice(0,3); };
```

---

## 5. Buttons

```css
--primary:        #1f2836;   /* near-black, not pure black */
--primary-hover:  #151c27;
--primary-active: #0f141d;
```

Base for every variant: `rounded-full`, `font-semibold`, and a transition on
`color, background-color, border-color, box-shadow` at `140ms`.

| Variant | Treatment |
|---|---|
| `primary` | `bg-primary text-inverse` + `--shadow-glass`, lifting to `--shadow-raised` |
| `secondary` | frosted: `bg-glass` + `border-glass-border` + `backdrop-blur-xl`, hover `bg-glass-strong` |
| `glass` | lighter frosted: `bg-glass-quiet`, hover `bg-glass` |
| `ghost` | transparent, hover picks up `bg-glass` + blur |

Sizes: `h-8 px-3.5 text-[13px]` · `h-10 px-5 text-[13px]` · `h-12 px-6 text-[15px]`.

---

## 6. Accent

One gold, used sparingly — progress fills, active markers, highlight marks.

```css
--gold:         #fcb900;
--gold-hover:   #e5a700;
--gold-active:  #cc9400;
--gold-subtle:  #fff8e2;   /* callout background */
--gold-border:  #f2dfa0;
--gold-ink:     #6b4e00;   /* text/icons on --gold-subtle */
```

`--gold-ink` exists because `--gold` is far too light to read as text. Never set
type in `--gold` on a light background.

A progress bar: `slate-200` track, `--gold` fill, both `rounded-full`.

---

## 7. Keep document surfaces out of it

If the product contains anything that should read as **paper** — a report, an
invoice, an exportable document — give it its own opaque palette and keep it
away from the glass tokens.

The mistake to avoid is making `--surface` translucent. Every card and table in
every document then frosts, and a printed-looking artefact turns into app chrome.
Add **separate** `--glass-*` tokens and apply them only to chrome.

A document palette needs warm neutrals of its own, distinct from the app's:

```css
--doc-ink:   #1d252d;   --doc-body:  #333b44;
--doc-muted: #5d6772;   --doc-faint: #8a94a0;
--doc-sep:   #e6e2d6;   --doc-hair:  #f0ede3;   /* warm, not cool grey */
--doc-warm:  #fbf9f2;   --doc-null:  #f5f3ec;
```

---

## 8. Transparent PNGs on glass

Line art exported onto an opaque white square shows as a solid block on a glass
card. Two things to get right:

**Un-composite, don't colour-key.** Keying white to transparent leaves jagged,
fringed edges. Compute alpha from distance-from-white and recover the colour —
anti-aliased edges stay smooth:

```
d      = 255 - max(r, g, b)          # distance from white
alpha  = d
colour = 255 + (channel - 255) * (255 / d)
```

**Watch for a near-white ground.** If the source is `#FEFEFE` rather than pure
white, every pixel picks up alpha 2–8 and the whole frame carries a faint haze.
Drop alpha below a floor (~12) and rescale the remainder so real ink keeps its
density.

**Next.js flattens alpha.** `next/image`'s optimizer composites the alpha back
onto white. Verify by canvas-sampling a corner pixel of both the raw and the
optimized URL; if the optimized one comes back `[254,254,254,255]`, set
`unoptimized` on the `<Image>`. Little is lost on line art. This is **not** a
cache issue — it survives clearing `.next/cache/images` and restarting.

---

## 9. Verify by measurement

Every value in this document was checked in the browser rather than judged by
eye, and that repeatedly caught things eyes missed. Useful probes:

```js
// Is this actually glass, or just a pale box?
const s = getComputedStyle(el);
({ bg: s.backgroundColor,            // expect rgba(...) — not rgb(...)
   blur: s.backdropFilter,           // expect blur(...)
   lit: /inset/.test(s.boxShadow) });

// Did the gradient stops land where intended?
[...getComputedStyle(document.body).backgroundImage
  .matchAll(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/g)].map(m => m.slice(1).map(Number));
```

Two traps that produce false confidence:

- **Selector collisions.** If a nav rail and a content rail are both `<aside>`,
  `querySelector('aside')` returns the wrong one and reports a near-black border
  on a light panel. Select by a distinguishing class.
- **Stale dev bundles.** Running a production build while the dev server is live
  can corrupt its in-memory state and throw `ReferenceError` on symbols that are
  defined and that typecheck fine. Restart the dev server before believing it.

---

## Quick start in a new project

1. Paste the `body` gradient (§1). Strip opaque backgrounds off every full-height
   wrapper.
2. Paste the `--glass-*` tokens and `--shadow-glass` / `--shadow-raised` (§2).
3. Bump the radius scale; make interactive elements `rounded-full` (§3).
4. Set borders to `slate-300`, quiet tracks to `slate-200` (§4).
5. Apply glass to **every** chrome surface, including hand-rolled ones and nested
   chips (§2).
6. Pick one accent and add its `-ink` variant for text (§6).
7. If you have document surfaces, give them a separate opaque palette (§7).
