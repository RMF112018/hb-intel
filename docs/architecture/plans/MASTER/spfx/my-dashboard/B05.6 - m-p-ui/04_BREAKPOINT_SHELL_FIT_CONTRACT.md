# 04 — Breakpoint and Shell-Fit Contract  
## My Projects module responsiveness and visible-count rules

---

## 1. Governing principle

The module must be **container-aware and nested-width aware**. It cannot assume full viewport width simply because the browser is wide. It lives inside a SharePoint-hosted dashboard bento surface and must remain credible inside its assigned slot.

---

## 2. Resting-card visible project count

| Responsive mode | Visible projects before overflow |
|---|---:|
| `phone` | 3 |
| `tabletPortrait` | 4 |
| `tabletLandscape` | 4 |
| `smallLaptop` | 4 |
| `standardLaptop` | 6 |
| `largeLaptop` | 6 |
| `desktop` | 6 |
| `ultrawide` | 6 |

This visible-count rule is binding.

---

## 3. Resting-card tile grid

| Responsive mode | Tile grid |
|---|---|
| `phone` | 1 column |
| `tabletPortrait` | 1 column |
| `tabletLandscape` | 1 or 2 columns only if stable; implementation should resolve through nested layout truth |
| `smallLaptop` | 1 or 2 columns only if stable; implementation should resolve through nested layout truth |
| `standardLaptop` | 2 columns |
| `largeLaptop` | 2 columns |
| `desktop` | 2 columns |
| `ultrawide` | 2 columns |

### Decision on tablet landscape / small laptop

The target is:
- prefer 2 columns when the actual card width is stable enough;
- automatically fall back to 1 column when the nested card width is constrained.

This must be implemented through actual container/card mode reasoning, not brittle viewport-only CSS.

---

## 4. Portfolio browser overlay posture

### Desktop-class and tablet landscape

- right-side drawer/panel;
- modal backdrop;
- result area with governed scroll treatment;
- search and close controls fixed in the panel header.

### Tablet portrait, phone, short-height

- full-screen modal sheet;
- fixed title/search/close header area;
- scrollable results body;
- bottom-safe-area-conscious spacing.

---

## 5. Search behavior in portfolio browser

- Search filters by normalized project name and project number.
- Search input remains visible at the top of the browser.
- The result list reflows without jarring layout shifts.
- Empty search result state displays:
  - `No projects match your search.`

---

## 6. Short-height behavior

Short-height states must remain usable:

- browser body scrolls;
- close control remains reachable;
- search input remains reachable;
- launch menus should avoid clipping against viewport edges.

---

## 7. Zoom/reflow posture

At common higher zoom or constrained-width browser windows:

- no horizontal scroll required for primary card use;
- no two-dimensional scrolling for ordinary use;
- action menus remain reachable;
- no launch trigger is hidden behind host chrome or fixed overlays.

---

## 8. Home-surface span posture remains unchanged

Do not change:
- 7 + 5 desktop-class span split;
- 6 + 4 standard-laptop split.

The My Projects redesign solves density internally; it does not shift the top-level bento choreography in this package.

---

## 9. Acceptance evidence

Hosted evidence must show:

- standard laptop resting card;
- desktop resting card;
- tablet portrait resting card;
- phone portrait resting card;
- opened portfolio browser in both desktop-class and phone-class posture;
- open launch menu not clipped at common edge conditions.
