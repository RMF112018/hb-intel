# Edge-to-Window Shell Integration Plan

## Executive Position

The user’s assumption is correct: to allow selected elements in `hb-intel-homepage.sppkg` to reach the edge of the browser/window without padding, changes above the individual reader components are required.

There are two related but distinct scopes:

1. **Post-hero Foleon reader lanes**  
   Governed by `HbHomepageShell.tsx`, shell bands, slots, shell padding, band gaps, and reader module chrome.

2. **Hero / Signature Hero / top entry experience**  
   Likely governed by the SPFx root wrapper, homepage entry stack, hero component, and SharePoint page section selection. `HbHomepageShell.tsx` is the post-hero operating layer and should not be assumed to own hero layout until the agent verifies the hero mount path.

## Current Shell Capabilities

Current shell attributes are useful but incomplete for edge bleed:

- `data-shell-band`
- `data-shell-semantic-role`
- `data-shell-band-recipe`
- `data-shell-band-orientation`
- `data-shell-columns`
- `data-shell-slot`
- `data-shell-occupant`
- `data-shell-slot-role`
- `data-shell-column-span`
- `data-shell-render-mode`

Missing:

- `data-shell-band-layout="paired|stacked"`
- `data-shell-slot-visual-side="left|right|full"`
- `data-shell-slot-edge-bleed="left|right|both|none"`

## Required Shell Contract Additions

Add explicit attributes to `ShellBandRenderer` / `ShellSlotRenderer`:

```tsx
data-shell-band-layout={layout.columns === 2 ? 'paired' : 'stacked'}
data-shell-slot-visual-side={visualSide}
data-shell-slot-edge-bleed={edgeBleed}
```

Suggested values:

```ts
type ShellSlotVisualSide = 'left' | 'right' | 'full';
type ShellSlotEdgeBleed = 'left' | 'right' | 'both' | 'none';
```

## Visual-Side Resolution

Visual side must be derived from actual shell layout:

- If `layout.columns === 1`, visual side is `full`.
- If `layout.columns === 2` and orientation is left-dominant:
  - major = left
  - minor = right
- If `layout.columns === 2` and orientation is right-dominant:
  - minor = left
  - major = right

This handles Company Pulse correctly because it is a major slot in a right-dominant row and is therefore visually right even though DOM order alone might not be sufficient in future presets.

## Edge-Bleed Resolution

Recommended default:

```ts
function resolveEdgeBleed(visualSide: ShellSlotVisualSide): ShellSlotEdgeBleed {
  if (visualSide === 'left') return 'left';
  if (visualSide === 'right') return 'right';
  return 'both';
}
```

Apply only to bleed-eligible occupants:

- `project-portfolio-spotlight`
- `company-pulse`
- `leadership-message`
- optionally hero/entry surface after separate audit

Do not apply to:

- HB Kudos
- Safety Field Excellence
- People & Culture

unless separately approved.

## CSS Strategy for Foleon Lanes

Use shell-provided attributes as the source of truth:

```css
[data-shell-occupant='project-portfolio-spotlight'][data-shell-slot-edge-bleed='left'] .foleonReaderSurface,
[data-shell-occupant='leadership-message'][data-shell-slot-edge-bleed='left'] .foleonReaderSurface {
  margin-inline-start: calc(-1 * var(--hb-homepage-shell-body-inset-inline));
  padding-inline-start: var(--hb-homepage-shell-body-inset-inline);
}

[data-shell-occupant='company-pulse'][data-shell-slot-edge-bleed='right'] .foleonReaderSurface {
  margin-inline-end: calc(-1 * var(--hb-homepage-shell-body-inset-inline));
  padding-inline-end: var(--hb-homepage-shell-body-inset-inline);
}

[data-shell-slot-edge-bleed='both'] .foleonReaderSurface {
  margin-inline: calc(-1 * var(--hb-homepage-shell-body-inset-inline));
  padding-inline: var(--hb-homepage-shell-body-inset-inline);
}
```

The class name should be implemented inside the new reader layouts. Do not rely on the old `.readerPreviewFallback` as the target.

## No-Overflow Requirements

The implementation must prove:

- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`
- shell rect does not exceed viewport/page canvas unexpectedly;
- no horizontal scrollbar appears at:
  - phone portrait;
  - tablet portrait;
  - tablet landscape;
  - standard laptop;
  - ultrawide desktop;
- focus outlines remain visible inside the safe area;
- rounded corners are not clipped incorrectly.

## SharePoint Canvas Constraints

There may be padding or max-width applied outside the SPFx component by SharePoint page sections. The code agent must inspect hosted DOM before deciding whether full browser-edge is possible from within the webpart alone.

Required hosted proof:

```js
[...document.querySelectorAll('[data-hb-homepage-root], [data-shell-post-hero], [data-shell-band], [data-shell-slot], [data-hb-signature-hero]')]
  .map(el => ({
    tag: el.tagName,
    attrs: Object.fromEntries([...el.attributes].map(a => [a.name, a.value]).filter(([k]) => k.startsWith('data-'))),
    rect: el.getBoundingClientRect(),
    className: el.className
  }))
```

## Hero Edge-to-Window Consideration

The hero is not one of the shell slots. Based on existing shell comments, `HbHomepageShell` is the post-hero operating layer. Therefore, the hero needs a separate audit of:

- the homepage SPFx root component;
- the entry stack component;
- Signature Hero wrapper;
- hero CSS module;
- SharePoint full-width section behavior;
- SPFx `supportsFullBleed` / manifest/page-host settings where applicable;
- any outer application padding or max-width wrapper.

Recommended hero strategy:

- If the SharePoint page uses a full-width section and the webpart supports full-bleed, remove or neutralize app-level padding for the hero.
- If SharePoint canvas still applies padding, avoid unsupported DOM hacks unless explicitly approved.
- Use a root-level data attribute, such as `data-hb-homepage-edge-mode="edge-to-window"`, to govern whether hero and eligible post-hero lanes may break out to the page edge.

## Risk Register

| Risk | Cause | Mitigation |
|---|---|---|
| Horizontal overflow | negative margins not matched by padding | Use shell inset variables and browser geometry tests |
| Company Pulse bleeds wrong side | DOM-order assumption | Use resolved visual side |
| Hero still has padding | SharePoint section or SPFx wrapper | Audit page host and manifest support |
| Focus outline clipped | outer overflow hidden | Keep focusable content inside safe area |
| Reader iframe clipped | bleed applied directly to iframe frame | Bleed background only; keep iframe in safe stage |

## Recommendation

Implement edge bleed in two passes:

1. Shell slot contract and Foleon lane bleed.
2. Hero/entry-stack edge-to-window audit and implementation.

Do not combine both into an unbounded styling pass.
