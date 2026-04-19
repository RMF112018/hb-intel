# 08 — External Research and Pattern Notes

## Purpose
Capture the outside product and interaction-design guidance that should inform the remediation.

## Research conclusions applied to this package

### 1. Container-aware behavior is the right baseline
Modern responsive component guidance supports adapting components to their actual container space rather than only the browser viewport. That aligns with the repo’s existing direction and should be preserved and strengthened.

**Implication for this package**
- keep container-aware rail behavior
- do not fall back to viewport-only logic
- prove narrowest stable nested behavior explicitly

---

### 2. Menus are appropriate for secondary action sets, not for primary navigation
Menu-button guidance supports menus as temporary choice surfaces with explicit trigger state, focus handling, and dismissal behavior. That fits secondary actions better than primary command presentation.

**Implication for this package**
- keep primary actions visible and direct
- move secondary tools into a deliberate overflow layer
- prefer anchored overflow on larger surfaces when the item set is secondary rather than primary

---

### 3. Bottom sheets are stronger for handheld overflow than tiny compressed popovers
Handheld guidance favors bottom-sheet style disclosure for constrained touch contexts and longer secondary action lists.

**Implication for this package**
- preserve or strengthen sheet-based overflow on phone-like states
- do not force desktop-style anchored micro-menus into cramped handheld conditions

---

### 4. Scanning improves when information is chunked, labeled deliberately, and stripped of waste
Strong information-scanning guidance consistently favors concise labels, grouped structure only when it helps, and removal of repeated low-value framing.

**Implication for this package**
- group only where grouping adds clarity
- compact singleton groups
- suppress repeated heading waste
- increase useful action density

---

### 5. Progressive disclosure is appropriate when secondary tools would otherwise overload the first-read field
Good dashboard and action-surface design uses progressive disclosure to keep first-read value strong.

**Implication for this package**
- primary actions should remain direct
- lower-frequency tools should be discoverable without dominating first view
- overflow must feel intentional, not bolted on

---

### 6. Surface elevation must be used intentionally
Overuse of raised surfaces creates visual noise.

**Implication for this package**
- do not solve sparse layout by adding more card chrome
- solve the visible-set and grouping logic first
- use elevation to support hierarchy, not as decoration

---

## Practical design rules derived for this remediation
1. Preserve container-aware adaptation.
2. Keep primary commands direct.
3. Use anchored menu / popover overflow for larger-screen secondary tools.
4. Use sheet-style overflow for handheld states.
5. Eliminate repeated section waste.
6. Increase command density without reintroducing flat directory rows.
7. Use visual emphasis intentionally and sparingly.
