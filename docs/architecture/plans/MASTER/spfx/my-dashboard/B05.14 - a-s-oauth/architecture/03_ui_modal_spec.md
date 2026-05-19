# UI Modal Specification — Floating Borderless Adobe Sign Document

## Visual Objective

The modal must make the Adobe Sign document feel like it is floating above the My Dashboard page.

The underlying My Dashboard page remains visible, but de-emphasized by a translucent gray overlay and subtle blur.

## Required Visual Treatment

### Backdrop

- Full viewport fixed overlay.
- Translucent gray / black layer.
- Subtle blur applied to the background.
- Backdrop must not look like a drawer or card container.
- Clicking outside the modal must not close the modal during signing without confirmation.

Recommended CSS posture:

```css
.backdrop {
  position: fixed;
  inset: 0;
  z-index: var(--my-dashboard-modal-z, 10000);
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}
```

### Floating Document Container

- Borderless.
- No visible card border.
- No heavy shadow that fights the Adobe content.
- Rounded corners are acceptable but should be subtle.
- Near full-height.
- Width should adapt:
  - desktop: approximately 78–88vw,
  - large desktop: max width around 1120–1280px,
  - mobile/tablet: nearly full viewport width.
- Height:
  - desktop: 88–94vh,
  - mobile: 100dvh or near full-screen.

Recommended posture:

```css
.modal {
  position: fixed;
  inset-block: clamp(16px, 3vh, 32px);
  inset-inline: 50%;
  transform: translateX(-50%);
  width: min(88vw, 1240px);
  height: min(94vh, 980px);
  border: 0;
  background: transparent;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.35);
}
```

### Header

Minimal floating header only.

Include:

- agreement title,
- sender or action type if available,
- “Open in Adobe Sign” fallback action,
- close button.

Header requirements:

- Borderless or extremely subtle separator.
- Should not visually compete with the Adobe document.
- Close action should require confirmation if the iframe is active and no terminal event has been received.

### Iframe

- Takes nearly all modal height.
- `title` must describe the agreement.
- `sandbox` should be used only if validated with Adobe behavior; do not overconstrain and break signing.
- Do not inject scripts into Adobe content.
- Do not inspect iframe DOM.

### Close Behavior

If action is active and no terminal event has been received:

- show confirmation:
  - “Close Adobe Sign action?”
  - “Your signing session may still be in progress. You can reopen it from the action queue.”
- options:
  - Continue signing
  - Close modal

If terminal event received:

- close after refresh completes or allow user to close manually.

### Responsive Behavior

Desktop:

- floating document over blurred page.

Tablet:

- near full-width and full-height.

Mobile:

- use full-screen modal.
- external fallback should remain prominent because iframe/session behavior may degrade.

## Accessibility

Required:

- focus trap inside modal,
- Escape behavior with confirmation,
- focus returns to originating “Act Now” button,
- iframe has descriptive `title`,
- status updates use `aria-live="polite"`,
- fallback action is keyboard accessible,
- close button has clear aria-label,
- body scroll is locked while modal is open.

## Empty/Error States

Modal must support:

- resolving,
- loading Adobe Sign,
- iframe load timeout,
- blocked embed / unable to load,
- session timeout,
- completion refresh,
- refresh failed.

Each state must include:

- plain-English status,
- fallback launch option where applicable,
- retry or close option.
