# HB Central Leadership Message Foleon Reader Rescue

**Date:** 2026-04-27  
**Scope:** Repo-truth audit, screenshot-hosted UI/UX assessment, subject-matter research, remediation plan, and prompt package for the Leadership Message Foleon reader lane.  
**Status:** Planning / code-agent implementation package. No production code is changed by this package.

> Audit boundary: this package is based on the live `main` branch inspected through GitHub connector access, the user-provided hosted screenshot, and public subject-matter research. Hosted validation was screenshot-based only; no authenticated browser automation was run against the tenant in this session.


## Accessibility and Breakpoint Contract

## Accessibility Requirements

### Heading order

- Outer article uses `aria-labelledby` pointing to one visible H2.
- The headline must be the meaningful content headline, not the lane/component name.
- Do not introduce extra heading levels unless they create real navigation value.

### CTA labels

- CTA must have a specific accessible name.
- Avoid vague labels like `Open`, `Click here`, or `Learn more`.
- External-open-only CTA should include visual and/or accessible indication that it opens in Foleon/new tab.

### Status announcements

- Blocked/unavailable reasons use visible text.
- Disabled CTA uses `aria-disabled` and `aria-describedby`.
- Do not rely only on data attributes for user-facing status.

### Keyboard focus

- Primary CTA is keyboard reachable.
- If full-card click pattern remains, there must still be exactly one semantic button.
- No nested interactive controls inside a button.
- Footer/archive action must sit outside the card-launch overlay.

### Full-window viewer

- Launch sends focus into dialog.
- Close/ESC returns focus to original launch button.
- Dialog has accessible title.
- Iframe has a specific title.
- Origin policy and sandbox remain intact.

### Reduced motion

- Any reveal, hover, or viewer transition must respect `prefers-reduced-motion`.
- Preview/blocked states should not animate critical information.

### Readability

- Summary max width: roughly 60-72 characters.
- Avoid long paragraphs.
- Use no more than three context chips.
- Important action appears above fold at common row heights.

### Contrast

- Text and CTA must meet readable contrast.
- Do not rely on brand blue/orange tint if contrast falls below standard.

### Image/media alt text

- Real meaningful images need alt text if they convey content.
- Decorative background/placeholder media should be `aria-hidden`.
- If alt text is not available, use conservative generated alt only when necessary.

### Touch targets

- Minimum practical target: 44 px.
- CTA must remain tappable on phone and at 125%+ browser zoom.

## Breakpoint Requirements

### Desktop paired homepage row

- Use a compact two-zone layout only if the container width supports it.
- Keep CTA visible without scrolling inside the webpart.
- Optional identity/media rail must not consume more than 30-35% of width.

### Desktop full-width fallback

- Allow a wider editorial feature composition.
- Max line length stays controlled.
- CTA and context should not drift far from headline.

### Tablet

- Stack identity/media above or beside content depending on actual container width.
- Hide optional context before shrinking text too far.

### Phone

- Single column.
- Source/status line first.
- Headline next.
- Summary max 2-3 lines.
- CTA immediately after summary.
- Context chips reduced to 0-2 items.

### Short-height

- Avoid tall hero imagery unless real media is critical.
- Summary clamps.
- CTA remains visible.

### SharePoint edit mode

- Webpart bounding boxes may appear; layout must not require exact edge-to-edge bleed.
- Preview/empty states must remain author-safe.
- Do not mimic SharePoint chrome.

### Preview mode

- Preview explains layout validation.
- No fake names/quotes/audience.
- No live Foleon iframe or network call unless explicitly supported by preview URL and safe policy.

### 75% zoom / high-density displays

- Avoid microtext.
- Status chips must not become unreadable.
- CTA remains visible and aligned.

### Container-aware behavior

The lane must use container-size realities where possible. Viewport-only media queries are insufficient because the reader sits inside homepage slots.
