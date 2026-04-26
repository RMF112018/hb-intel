# 03 — UI/UX Specification

## Design intent

The preview fallback should make the Foleon integration feel intentionally prepared, not broken. It should show a credible editorial layout for Project Spotlight and Company Pulse without claiming content is live.

## Highlights preview layout

Recommended structure:

1. **Preview banner**
   - Eyebrow/badge: `Preview`
   - Heading: `Foleon content preview`
   - Copy: `This sample layout shows how Marketing highlights will appear once Foleon publications are connected.`
   - Secondary note: `No sample cards are live publications.`

2. **Feature card**
   - One large card resembling the live `feature` variant.
   - Sample title: `Project Spotlight: Coastal Residence Progress`
   - Content type: `Project Highlight`
   - Preview badge visible near content type.
   - Summary emphasizes sample nature.

3. **Supporting cards**
   - Three compact cards:
     - `Company Pulse: Quarterly News Digest`
     - `Market Update: Florida Construction Outlook`
     - `Leadership Message: Building Continuity Across Teams`
   - All show Preview/Sample treatment.
   - All actions disabled or non-routing.

4. **Admin/author note**
   - Small, calm note: `Admins can replace this preview by syncing or publishing Foleon records and assigning active placements.`

## Content Hub preview layout

Recommended structure:

1. Header remains `All publications`.
2. Search/filter controls may remain visible but should be visually subordinate or disabled for preview content unless the implementation supports preview-only client filtering.
3. Body renders a “sample archive” section:
   - heading: `Sample publication archive`
   - copy: `The archive will show searchable Foleon publications once published records exist.`
   - grid of 4–6 sample cards.
4. If preview filter chips are active, they must be visually clear as sample-only. The simpler first pass is to render static sample archive cards and keep live search/filter behavior for real content only.

## Manager guidance layout

Add a lightweight panel only if it fits current Manager UI:

- Placement: below metrics or above the main editor panel when `content.length === 0`.
- Tone: operational, not marketing.
- Copy:
  - `Preview fallback is active for public pages until published records exist.`
  - `This does not create records, open readers, or emit production telemetry.`
  - `Publish content and create active placements to replace the preview automatically.`

## Labels and copy

Use consistent labels:

- Badge: `Preview`
- Secondary badge: `Sample layout`
- Disabled action: `Preview only`
- Tooltip/helper: `Sample card — no publication is currently linked.`
- Do not use `Read` on preview cards unless disabled and paired with `Preview only`.

## CTA behavior

Required:

- Preview card primary action must not route.
- External action must not render for preview cards.
- If a disabled button is used, include visible helper copy because disabled controls can be skipped by some assistive tech.
- Prefer a non-disabled informational affordance, e.g. a secondary text/button styled element with `aria-disabled="true"` and no action.

## Responsive behavior

| Width condition | Expected behavior |
|---|---|
| Wide/full-width | Feature card + compact grid; preview banner spans width |
| Medium/nested lane | Feature card stacks above two-column compact cards if space allows |
| Narrow/tablet portrait | Single-column stack; summaries trim to 2–3 lines |
| Phone | Single-column, no hover-only affordances, clear Preview labels |
| Short-height | Reduce vertical art height; keep heading and first preview card visible |

No horizontal scrolling. No critical action depends on hover. Touch targets should remain credible.

## Accessibility requirements

- The preview region needs an accessible label, e.g. `aria-label="Foleon preview fallback"`.
- Do not move focus automatically when fallback appears.
- Loading states should keep `role=status` / polite announcement behavior.
- Preview fallback itself should not be an alert; it is not an error.
- Maintain heading order: route header → preview heading → card headings.
- Visual Preview labels must be text, not color-only.
- Meet WCAG AA contrast: 4.5:1 normal text, 3:1 interactive/non-text indicators.
- Respect reduced motion if motion is added.
- For sample image blocks, use decorative `alt=""` or CSS-only placeholders.

## Dark/light theme

Current app forces `HbcThemeProvider forceTheme="light"`. First implementation should be light-theme complete. If theme support changes later, use semantic tokens rather than raw hex values.

## Image/media strategy

- No external placeholder services.
- No random internet images.
- No copyrighted images.
- Prefer CSS gradient/texture placeholders, geometric editorial blocks, or already-approved repo assets.
- Ensure media aspect ratios match final card composition.

## Alignment with homepage doctrine

This fallback must improve the current state-model score by:

- replacing generic empty states with purpose-fit preview states;
- preserving host-safe canvas behavior;
- using governed homepage primitives/imports;
- avoiding dead CTAs;
- supporting compact/nested display;
- proving source/package/runtime behavior remains truthful.
