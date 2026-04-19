# 02 — Architecture and Ownership Map

## Objective
Map the correct ownership boundaries so the remediation package does not reopen already-correct architecture.

## Canonical ownership model

### 1. Homepage wrapper owns the pre-shell entry stack
**Owner:** `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`

The wrapper owns the vertical stack immediately below the standalone hero:

1. embedded `PriorityActionsRail`
2. `HbHomepageShell`

This is correct and should remain intact.

### 2. The wrapper owns only integration inputs, not rail content authority
**Owner:** `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts`

The wrapper should continue to own only:

- `enabled`
- `bandKey`
- `activeAudience`
- `fallbackConfig`
- `featuredActionKeys`

The wrapper must not become the content-authoring authority for the rail.

### 3. The rail remains the public product surface
**Owner:** `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`

This component should remain the public product surface for both:
- standalone/non-homepage uses
- wrapper-owned homepage embed

The homepage should continue to opt into a named presentation context rather than forking the product.

### 4. Data and presentation seams are correctly separated
**Current seam groups:**

#### Data / normalization
- `priorityActionsContracts.ts`
- `priorityActionsNormalization.ts`

#### Presentation resolution
- `priorityActionsPresentation.ts`

#### Shared render family
- `packages/ui-kit/src/HbcPriorityRail/*`

That separation is correct and should be preserved.

---

## Ownership rules that must stay locked

### Locked Rule 01
Do **not** reclassify the rail as a shell occupant.

### Locked Rule 02
Do **not** move wrapper integration inputs into generic shell module slices.

### Locked Rule 03
Do **not** fork a homepage-only rail implementation if the current flagship context path can be made correct.

### Locked Rule 04
Do **not** treat the screenshot as proof that the architecture needs to be reopened.

---

## Where the remediation actually belongs

### Implementation belongs primarily in:
- `PriorityActionsRail.tsx`
- `priorityActionsNormalization.ts`
- `priorityActionsPresentation.ts`
- `HbcPriorityRailSurface.tsx`
- `HbcPriorityRailOverflow.tsx`
- `priority-rail.module.css`
- tests
- hosted validation / package proof artifacts

### Implementation does **not** primarily belong in:
- shell occupant registration
- shell module preset architecture
- backend/API architecture
- unrelated homepage modules

---

## Final architectural directive
Preserve the ownership model.

Fix the product-quality failures inside the existing ownership model unless Prompt 01 proves a real runtime/parity defect that requires package/export correction.
