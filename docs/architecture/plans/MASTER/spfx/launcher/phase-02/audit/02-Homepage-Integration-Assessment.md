# 02 — Homepage Integration Assessment

## What is strong

- The launcher is explicitly placed in the entry stack between the hero and shell, which is the correct homepage utility posture.
- The integration uses the same outer-envelope and shared entry-state authority as the shell.
- The hero-to-launcher gap is intentionally tight, and the launcher-to-shell gap is intentionally larger.
- The launcher is not pretending to be shell chrome; it behaves as page-canvas content.

## What is directionally useful but insufficient

- The launcher is technically integrated, but the row still reads as a relatively small centered strip inside a larger canvas.
- The band shelf and inner surface treatment add structure, but they also contribute to a boxed-in feeling when the row should feel more confident and more integrated with the hero shelf.
- The launcher’s first-view value is being weakened by unnecessary chrome in the hosted result and by the overflow trigger’s visual mismatch.

## What is weak or strategically wrong

### 1. The row does not use the lane with enough authority
The current width formula in `.bandScroller` mathematically caps the row to the exact visible tile matrix and centers it. That creates large dead margins on standard desktop widths and weakens the launcher’s presence.

### 2. The launcher is over-signaled as an inventory surface
Counts and labels in the hosted result shift the launcher away from “act now” utility and toward directory-like “here are N tools” behavior.

### 3. The drawer is not integrated as a premium continuation of the row
The row feels one way; the drawer opens as a separate modal object with a different compositional grammar. This breaks the continuity a flagship homepage launcher needs.

### 4. The runtime evidence path is not trustworthy enough
When the code intends one thing and the hosted screenshot shows another, homepage integration is not closed. Package truth is part of integration quality.

## Why it matters

The homepage overlay requires the first screen to deliver hero + primary actions + beginning of the first lane. If the actions layer feels timid, noisy, or unstable, the whole first-screen entry stack underperforms even if the shell below is sound.

## Correction direction

- widen the row’s visual authority without turning it into a fake shell strip
- remove heading/count chrome from the homepage path
- make the overflow trigger a true peer to primary tiles
- redesign the drawer as a premium bottom tray aligned with the row’s grammar
- refresh hosted/package proof immediately after remediation
