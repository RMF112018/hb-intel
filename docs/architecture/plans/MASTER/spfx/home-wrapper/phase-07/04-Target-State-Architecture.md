# 04 — Target-State Architecture

## Goal state

The flagship HBCentral homepage should move from:

### Current
1. hero webpart
2. standalone page-canvas action layer
3. standalone `HbHomepage` shell webpart

to:

### Target
1. hero webpart
2. `HbHomepage` runtime wrapper
   - wrapper-owned priority-actions region
   - `HbHomepageShell`
3. no duplicate page-canvas action layer on the flagship homepage

## What stays the same

- `PriorityActionsRail` remains a real standalone React surface.
- The standalone `PriorityActionsRail` SPFx webpart remains available for non-homepage usage unless later repo proof requires retirement.
- `HbHomepageShell` continues to own shell bands, shell slots, and shell occupants only.
- `HbKudos`-style “embed the React component inside homepage runtime” remains the governing precedent.

## What changes

### 1. `HbHomepage` stops being a pass-through
Preferred implementation pattern:
- `HbHomepage.tsx` remains a thin entry
- it renders a new dedicated runtime wrapper component such as:
  - `HbHomepageEntryStack.tsx`, or
  - `HbHomepageRuntime.tsx`

### 2. A wrapper-owned pre-shell region is created
That wrapper should render:
- wrapper root
- actions region
- shell region

### 3. A wrapper-facing config seam is introduced
Preferred data owned by the wrapper seam:
- `enabled?: boolean`
- `bandKey?: string`
- `fallbackConfig?: Partial<PriorityActionsRailConfig>`
- `activeAudience?: string`

The wrapper must not absorb the rail’s list-admin schema or business logic.

### 4. Entry-stack semantics are updated
After implementation, the canonical sequence should become:

- **hero stage**
- **actions stage**
- **first shell lane**

But the actions stage is now:
- wrapper-owned on the flagship homepage
- still independently mountable elsewhere

### 5. Homepage page-canvas cutover becomes mandatory
On the flagship page, there must no longer be a conflicting standalone action layer above the embedded rail.

## Recommended file shape

### Preferred new runtime files
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepage.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx` (new)
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.module.css` (new)

### Preferred contract/helper files
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageWrapperConfig.ts` (new preferred)
  - or an equivalently named seam

### Expected reconciliation files
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- any repo docs/comments that still overstate independent production mounting on the flagship homepage

### Expected closure / proof seams
- component tests for wrapper order / gating
- visual proof harness or snapshot seam
- page-canvas cutover / inspection toolchain under existing repo-native admin or PnP seams

## Non-goals

- do not add `priority-actions-rail` to `OccupantId`
- do not add rail band semantics to shell preset library
- do not move rail list/admin logic into homepage shell code
- do not rebuild the shell around command-band semantics
- do not broaden the work into unrelated homepage modules

## “Done” definition

This work is done only when all of the following are true:

1. `HbHomepage` is a real wrapper runtime.
2. The wrapper renders the rail before the shell.
3. The shell remains shell-only.
4. Standalone rail product seams remain intact.
5. Entry-stack comments/docs are no longer misleading.
6. The flagship homepage page canvas no longer duplicates the action layer.
7. Tests and visual proof exist.
