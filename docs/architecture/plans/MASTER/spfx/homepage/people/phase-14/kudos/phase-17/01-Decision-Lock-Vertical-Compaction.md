# 01 — Decision Lock: Vertical Compaction / Overflow

## Locked decisions

### 1. Preserve the existing concept
The current hero + frosted featured-card composition remains the signature move.
No redesign.
No replacement with a flatter utility layout.

### 2. Treat this as whole-surface compaction
The code agent must not reduce the hero/featured height in isolation and leave surrounding public-surface areas untouched.

Any approved size reduction must be reviewed against:
- hero band
- CTA row
- featured card shell
- featured avatar/ring
- featured eyebrow / title / recipient line / excerpt / meta row / reaction affordance
- recent recognition section label, rows, padding, and spacing
- archive section label, search field, rows, and section padding
- browse/feed rows if they are visually downstream of the same public-surface language
- surface footer spacing and hosted clearances

### 3. Use ui-kit guidance as the implementation anchor
Changes must be made in conformance with:
- `@hbc/ui-kit`
- homepage / presentation-lane doctrine
- the current `people-culture-homepage` variant strategy

Do not pile new accidental overrides into the webpart if the correct implementation seam is the ui-kit homepage variant.

### 4. Compaction must preserve hierarchy
The goal is not “smaller.”
The goal is:
- less vertical waste,
- more first-viewport signal,
- stronger content-carrying balance.

### 5. Hosted safe zones are mandatory
Top safe-zone behavior and bottom-right assistant-button safe-zone behavior are required parts of the fix, not optional polish.

### 6. Closure requires proof at 100% zoom
No closure unless the updated harness proves:
- desktop 100% zoom
- desktop 90% zoom
- reduced-width hosted desktop
- iPhone 12 Pro hosted view
- keyboard/focus-visible behavior for changed controls
- no-dead-CTA coverage for changed visible controls

## Recommended compaction direction

### Masthead
- reduce hero top/bottom padding modestly but visibly
- tighten CTA row spacing
- keep title/subcaption legible and premium

### Featured card
- slightly reduce card vertical padding
- slightly reduce hero-avatar/ring scale
- tighten internal vertical gaps
- clamp featured excerpt more aggressively at desktop 100% zoom
- keep the card authoritative

### Lower zones
- bring recent recognition earlier in the first viewport
- compact archive/search/rows enough to stay visually proportional after masthead tightening
- keep continuation zones feeling authored, not merely compressed

### Hosted protection
- reserve a bottom-right no-conflict zone for the floating assistant overlay
- confirm top chrome coexistence at constrained hosted conditions
