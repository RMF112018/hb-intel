# Audit 01 — Live Launcher Architecture and Render Path

## Objective

Prove the actual active homepage launcher render path on `main`, identify which seams are authoritative, and separate strong architecture from weak surface decisions.

## Active homepage render path

### 1. Wrapper-owned entry stack
`apps/hb-webparts/src/webparts/hbHomepage/HbHomepageEntryStack.tsx`

This file is the active wrapper-owned entry stack:

1. hero region
2. launcher region
3. shell region

The comments are explicit that the homepage launcher band replaced the earlier homepage flagship rail path and that the rail remains available only for standalone / adjacent mounts.

### 2. Homepage launcher integration seam
`apps/hb-webparts/src/webparts/hbHomepage/HbHomepageLauncherBand.tsx`

This is the active homepage launcher bridge.

It:
- measures the host container width
- resolves shell entry state
- loads priority-actions config/items through `usePriorityActionsData`
- filters items by device
- partitions items into primary + overflow through the launcher adapter
- renders `HbcHomepageLauncher`

### 3. Shared data and presentation seams still in play
Relevant files:
- `apps/hb-webparts/src/homepage/data/usePriorityActionsData.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsNormalization.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsPresentation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsLauncherAdapter.ts`

The important finding is that the wrapper/data architecture is not casual. It is explicit and reasonably well-separated.

### 4. Active UI primitive family
Relevant files:
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncher.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherChip.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/HbcHomepageLauncherOverflow.tsx`
- `packages/ui-kit/src/HbcHomepageLauncher/homepage-launcher.module.css`
- `packages/ui-kit/src/HbcHomepageLauncher/types.ts`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts`

This is the surface family that now governs the hosted homepage launcher.

## What is strong and should be preserved

### A. Hosted path cutover is real
The hosted homepage path now bypasses the old flagship rail primitive and routes through `HbcHomepageLauncher`.

### B. Container-aware measurement is correct in principle
`HbHomepageLauncherBand` measures its own host width and reconciles that with shell entry-state data rather than relying on naive viewport-only assumptions.

### C. Count governance is explicit
Visible-count governance is centrally defined in launcher constants and adapter logic, not buried in ad hoc styling.

### D. Runtime markers are useful
The launcher root exposes version, device class, visible count, overflow count, overflow mode, and short-height state for hosted validation. That is valuable and should survive the rebuild.

### E. Data and filtering seams are not the main problem
Audience / schedule / device filtering are already explicit and testable.

## What is weak and should not be protected

### A. Primitive naming exposes the core misframing
The code repeatedly describes the surface as:
- chip band
- compact horizontal capsule
- compact branded chips

That is not accidental wording. It reveals the intended product shape.

### B. The adapter contract is overfit to chip output
The adapter maps into `HomepageLauncherChipModel`, which is already too narrow to express:
- inline overflow tile variant
- dedicated secondary tile posture
- handheld single-entry launcher mode
- full-drawer content model representing all tools on small handheld

### C. Overflow is treated as a separate command layer
The current primitive assumes primary chips are one family and overflow trigger is a different utility control. That is the exact hierarchy the new package must undo.

### D. Phone mode is still row-thinking
The current architecture only changes overflow modality on phone/short-height. It does **not** define a distinct handheld launcher mode with a different entry primitive and different content strategy.

## Decision

### Preserve
- entry stack ownership
- launcher band integration seam
- data loading/filtering seams
- container measurement / entry-state resolution posture
- runtime markers and packaging traceability

### Rebuild
- launcher item contract
- launcher primitive family
- overflow-entry primitive
- handheld behavior model
