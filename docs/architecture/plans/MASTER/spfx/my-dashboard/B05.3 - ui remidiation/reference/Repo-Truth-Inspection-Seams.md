# Repo-Truth Inspection Seams

## High-Priority Runtime Seams

### Shell and navigation
```text
apps/my-dashboard/src/shell/MyWorkShell.tsx
apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
apps/my-dashboard/src/state/useMyWorkShellState.ts
```

### Header / hero
```text
apps/my-dashboard/src/shell/MyWorkHeroBand.tsx
apps/my-dashboard/src/state/myWorkHeroViewModel.ts
```

### Home composition
```text
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
```

### Adobe fragmentation
```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueHomeCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueStateCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueSummaryCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignAgreementActionListCard.tsx
```

### My Projects
```text
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx
apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css
```

### Layout
```text
apps/my-dashboard/src/layout/MyWorkBentoGrid.tsx
apps/my-dashboard/src/layout/MyWorkCard.tsx
apps/my-dashboard/src/layout/myWorkFootprints.ts
```

### State/view-model truth
```text
apps/my-dashboard/src/state/myWorkCardViewModel.ts
apps/my-dashboard/src/state/myWorkSurfaceReadiness.ts
apps/my-dashboard/src/shell/MyWorkActiveEnvelopeContext.tsx
```

## Data Path / Contract Boundaries to Preserve

```text
packages/models/src/myWork/
apps/my-dashboard/src/api/
apps/my-dashboard/src/runtime/
backend/functions/src/hosts/my-work-read-model/
```

Only inspect backend/functions if current repo truth demonstrates the UI posture reset requires clarification of a frontend-consumed contract. This package is not a backend redesign.

## Build / Package Validation

```text
apps/my-dashboard/package.json
tools/build-spfx-package.ts
```
