# B03-05 — Implement My Work Home Surface and Focused Adobe Module Shell Placement

## Objective

Implement the B03 structural home dashboard and focused Adobe module shell-placement surfaces so the My Work shell is visibly complete and its card choreography can be validated, while carefully deferring Batch 04 read-model ownership and Batch 05 detailed Adobe UI ownership.

## Prerequisite

Prompts B03-01 through B03-04 are complete.

## Read first

Do not re-read files that are still in your current context or memory. Inspect only what you need.

Reference targets:

```text
apps/project-control-center/src/surfaces/phase05Dashboard/PccPrimaryDashboardSurface.tsx
apps/my-dashboard/src/layout/myWorkFootprints.ts
apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx
docs/architecture/plans/MASTER/spfx/my-dashboard/dev-plan/B03_My_Work_Shell_Navigation_And_UX_Development.md
```

## Implement

### 1. Create home-surface files

```text
apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx
apps/my-dashboard/src/surfaces/home/WorkSummaryCard.tsx
apps/my-dashboard/src/surfaces/home/SourceReadinessCard.tsx
```

### 2. Create Adobe shell-placement files

```text
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueHomeCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignActionQueueModuleSurface.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueSummaryCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignAgreementActionListCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignQueueStateCard.tsx
apps/my-dashboard/src/modules/adobeSign/AdobeSignConnectionGuidanceCard.tsx
```

### 3. Card role taxonomy

Expose stable card role markers:

| Component | `data-my-work-card-role` |
|---|---|
| WorkSummaryCard | `work-summary` |
| AdobeSignActionQueueHomeCard | `adobe-sign-action-queue-home` |
| SourceReadinessCard | `source-readiness` |
| AdobeSignQueueSummaryCard | `adobe-sign-queue-summary` |
| AdobeSignAgreementActionListCard | `adobe-sign-agreement-action-list` |
| AdobeSignQueueStateCard | `adobe-sign-queue-state` |
| AdobeSignConnectionGuidanceCard | `adobe-sign-connection-guidance` |

Use `data-my-work-card` on card roots.

### 4. Home surface ready/partial choreography

Implement order:

1. Work Summary
2. Adobe Sign Action Queue Home Card

Span overrides:

| Mode family | Work Summary | Adobe Queue |
|---|---:|---:|
| 12-column | 4 | 8 |
| 10-column | 3 | 7 |

At smaller modes, stack in the same order.

### 5. Home surface non-ready choreography

Provide a structural non-ready surface rendering path suitable for tests and future B04/B05 data injection:

1. Work Summary
2. Adobe Sign Queue State Card
3. Source Readiness Card

Span overrides:

| Mode family | Work Summary | Queue State | Source Readiness |
|---|---:|---:|---:|
| 12-column | 3 | 6 | 3 |
| 10-column | 3 | 4 | 3 |

Do not invent final source-state business logic. Use a narrow presentation-level state input or internal structural variant strictly to prove placement.

### 6. Focused Adobe ready/partial choreography

Implement order:

1. Adobe Sign Queue Summary Card
2. Agreement Action List Card

Span overrides:

| Mode family | Queue Summary | Action List |
|---|---:|---:|
| 12-column | 4 | 8 |
| 10-column | 3 | 7 |

### 7. Focused Adobe non-ready choreography

Implement order:

1. Adobe Sign Queue State Card
2. Connection / Source Guidance Card

Span overrides:

| Mode family | Queue State | Guidance |
|---|---:|---:|
| 12-column | 8 | 4 |
| 10-column | 6 | 4 |

### 8. Home card gateway

The home Adobe queue card must expose a meaningful CTA that calls the shell selection callback to focus:

```text
adobe-sign-action-queue
```

Recommended visible text:

```text
View queue
```

Do not implement Adobe source deep links here.

### 9. Copy posture

All card copy should be production-grade and consistent with B03 source-authority posture. Avoid:
- `TODO`,
- `placeholder`,
- `mock`,
- fake counts claiming live truth.

Where counts or data are structurally represented before Batch 04, use carefully framed neutral summary copy or isolated fixture view models.

### 10. Shell/module data markers

Add where applicable:

```text
data-my-work-module="adobe-sign-action-queue"
data-my-work-adobe-sign-queue
```

## Tests

Add/extend tests for:

- home ready card order,
- home non-ready card order,
- focused ready card order,
- focused non-ready card order,
- 10/12-column span override contracts,
- CTA module selection,
- data attributes,
- no modal takeover or URL navigation introduced.

## Validation

Run targeted tests and type checks. Report exact commands/outcomes.

## Hard no-go rules

- Do not implement final Adobe queue row/business logic.
- Do not implement OAuth or backend routes.
- Do not create analytics cards.
- Do not add source-open URLs.
- Do not make home/card source state look live if Batch 04 has not delivered real read models.
- Do not re-read files still in current context or memory.

## Completion note

Report:
- surfaces/cards created,
- what structural state mechanism was used,
- tests run,
- whether Prompt 06 is unblocked.
