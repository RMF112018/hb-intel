# Audit 04 — Enhanced Issues Register

## Issue 01 — Launcher primitive still reads as chip/button strip
**Severity:** Critical  
**Type:** Structural redesign

### Problem
The active launcher surface is intentionally implemented as a compact chip band rather than a launcher tile family.

### Why this matters
This blocks the launcher from reading as a premium work-hub entry surface and keeps it trapped in a utility-strip posture.

### Primary seams
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherChip.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`

### Required future state
Primary items must read as true launcher tiles:
- not pill capsules
- not compact chip buttons
- not tiny quick-action controls

### Done means
Desktop/tablet launcher shows a consistent tile family with stronger silhouette, spacing, icon framing, and hierarchy.

---

## Issue 02 — `More Tools` is detached from the family
**Severity:** Critical  
**Type:** Structural redesign

### Problem
Overflow entry is intentionally styled and modeled as a separate white utility control.

### Why this matters
This breaks launcher family resemblance and makes overflow feel like an afterthought instead of a governed part of the launcher.

### Primary seams
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`

### Required future state
`More Tools` is an inline launcher tile:
- same family
- secondary hierarchy
- orange brand posture
- accessible and keyboard-reachable
- still visually distinguishable from primary tiles

### Done means
The overflow entry belongs to the row as a real tile, not a detached outlined button.

---

## Issue 03 — Small handheld mode is not a dedicated launcher mode
**Severity:** Critical  
**Type:** Structural redesign

### Problem
Phone mode still renders several primary items plus overflow-only sheet.

### Why this matters
This is not the required mobile behavior and does not produce a finger-safe, high-clarity launcher for small handhelds.

### Primary seams
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`

### Required future state
Small handheld collapses to one launcher entry tile that opens a drawer / sheet containing all tools.

### Done means
No reduced desktop row remains on small handheld.

---

## Issue 04 — Contract is too chip-shaped for the required target state
**Severity:** High  
**Type:** Targeted structural expansion

### Problem
Current contract supports primary chips and overflow items, but not:
- inline secondary tile variant
- handheld single-entry launcher mode
- all-tools drawer content model
- richer launcher family semantics

### Primary seams
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`

### Required future state
Launcher contracts explicitly support:
- tile variants
- secondary tile posture
- handheld entry mode
- all-tools collection
- optional supporting text where justified

### Done means
No surface behavior depends on brittle local branching or hidden assumptions.

---

## Issue 05 — Breakpoint policy is present but not reconciled to positive mode changes
**Severity:** High  
**Type:** Targeted refinement + structural follow-through

### Problem
Current breakpoint logic governs counts and overflow mode, but not the more important shift from desktop/tablet launcher to small-handheld single-entry launcher mode.

### Primary seams
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`

### Required future state
Breakpoint rules explicitly define:
- desktop / tablet tile row behavior
- small-handheld single-entry behavior
- short-height override behavior
- drawer mode trigger semantics
- acceptance criteria by width class

### Done means
The launcher no longer “shrinks until uncomfortable.” It changes mode deliberately.

---

## Issue 06 — Tests and closure proof validate the wrong end state
**Severity:** Critical  
**Type:** Closure / governance failure

### Problem
Current tests reinforce the chip-band outcome and the 3-primary-plus-overflow phone behavior.

### Primary seams
- `apps/hb-webparts/src/homepage/__tests__/priorityActionsLauncherAdapter.test.ts`
- `apps/hb-webparts/src/homepage/__tests__/priorityActionsPresentation.test.ts`
- any ui-kit launcher tests added or updated during remediation

### Required future state
Tests and closure evidence must prove:
- tile family outcome
- inline overflow tile
- small-handheld single-entry tile + full tools drawer
- hosted package/runtime parity
- screenshot-backed closure

### Done means
The same weak outcome cannot pass again under the new proof regime.
