# 05 — Prompt: Hosted Safe Zones and 100% Zoom Overflow Hardening

## Mission

Harden the HB Kudos public surface against **hosted overflow and obstruction at 100% zoom**, including SharePoint chrome pressure and the persistent bottom-right assistant overlay.

## Required outcome

The public webpart must feel intentionally composed inside the host environment, not merely acceptable in isolation.

## Required hosted problems to solve

### A. Top hosted pressure
At constrained and mobile-hosted conditions, the masthead must not feel jammed under host chrome.

### B. Bottom-right obstruction
The lower archive/footer area must visibly accommodate the floating assistant button / overlay risk zone.

### C. Viewport-budget discipline
Desktop 100% zoom must not leave the surface feeling top-heavy or overflow-prone.

## Mandatory rules

- Accommodate the assistant overlay; do not ignore it.
- Do not solve hosted issues by simply adding large empty whitespace everywhere.
- Use deliberate safe-zone behavior.
- Keep keyboard/focus behavior first-class.
- Keep changes scoped to the public surface and its hosted validation seams.

## Required implementation direction

1. Add or refine top safe spacing behavior for constrained hosted conditions.
2. Add a bottom-right safe-zone strategy so archive rows / footer content do not visually conflict with the assistant overlay.
3. Review section-bottom spacing, footer spacing, and row-end placement where needed.
4. Ensure 100% zoom desktop layouts maintain a balanced opening viewport.
5. Add any stable structure hooks required for hosted assertions.

## Deliverables

- public-surface hosted safe-zone adjustments
- short note describing the top and bottom safe-zone solution
- proof screenshots for:
  - desktop 100%
  - desktop 90%
  - reduced-width hosted desktop
  - iPhone 12 Pro hosted view
