# 10 — Test, Validation, and Evidence Plan

## Validation Philosophy

The remediation is not complete when code compiles. It is complete when:

- implementation behavior is validated;
- regression risks are controlled;
- accessibility semantics are tested;
- responsive intent is documented;
- hosted evidence exists or is explicitly recorded as the remaining gate.

## Required Local Validation Commands

Each implementation prompt should use the standard baseline/post-validation command pattern defined in `reference/03_Command_Validation_Lanes.md`.

At the end of substantive code prompts, run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard lint
git diff --check
```

If a prompt's scope is docs-only or read-only, follow its specific instruction instead.

## Required Unit/Integration Test Coverage

### Shared card/grid cleanup

- `MyWorkCard` no longer accepts/renders `titleContent`.
- Shared-card heading semantics remain correct.
- Grid or card posture changes do not break footprint/span attributes.

### View switch

- Default active tab: Action Queue.
- Completed tab activates only on Enter/Space/click.
- Arrow keys change focus per manual activation.
- `aria-selected`, `aria-controls`, and panel semantics are correct.
- View switch still hides in non-capable card states.

### Status rail

- Active-view status chip renders.
- Freshness renders only when valid.
- Correct chip labels for Action Queue and Completed states.

### Activity rows

- Queue rows render action/metadata/Open structure.
- Completed rows render date/sender metadata per fallback rules.
- `Updated date unavailable` does not render.
- Open links preserve:
  - anchor semantics;
  - `_blank`;
  - `noopener noreferrer`.

### Preview context

- Queue preview line renders only when total > shown.
- Completed preview line renders only when total > shown.
- Preview line suppresses when shown == total.

### Completed retry

- Error/degraded Completed panel shows Retry.
- Retry reissues the recent-completions request.
- Retry does not break cache semantics after successful load.

### Existing state coverage

Preserve assertions for:

- authorization required;
- configuration required;
- principal unresolved;
- source unavailable;
- backend unavailable;
- partial;
- available-empty;
- available-items.

## Hosted Evidence Matrix

Prompt 08 must define and, where environment permits, capture SharePoint-hosted evidence for:

### Action Queue states

1. empty ready;
2. populated ready;
3. partial;
4. authorization required;
5. configuration required;
6. principal unresolved;
7. source unavailable;
8. backend unavailable.

### Completed states

1. loading on first activation;
2. populated ready;
3. empty ready;
4. partial;
5. degraded/error with Retry;
6. successful retry if feasible.

## Viewport Evidence Matrix

Capture or document expectations at:

| Mode | Evidence Goal |
|---|---|
| ultrawide | wide hosted flagship posture |
| desktop | standard full SharePoint canvas |
| standard laptop | current user-like hosted state |
| small laptop | reduced width resilience |
| tablet landscape | full-width card posture |
| tablet portrait | stacked one-column behavior |
| phone portrait | narrowest stable state |
| short-height | avoid dead volume / CTA clipping |

## Scorecard Recovery

Prompt 08 must produce a re-audit using the attached scorecard.

### Intended target scores

| Category | Target |
|---|---:|
| Doctrine and host compliance | 4 |
| UI-kit / premium-stack compliance | 3 |
| Token and styling discipline | 3 |
| Purpose-fit sophistication | 4 |
| Surface composition and hierarchy | 4 |
| Homepage integration quality | 3 |
| Breakpoint and shell-fit quality | 4 |
| Interaction completeness | 4 |
| State-model completeness | 4 |
| Contract/data seam rigor | 3 |
| Identity/media/attribution quality | 3 |
| Accessibility and keyboard behavior | 4 |
| Host-runtime resilience | 3 |
| Validation and closure proof | 4 |

```text
Target total: 50 / 56
```

A final score below `48 / 56` requires explicit explanation of residual gaps.

## Closeout Documents

Prompt 08 should create or update:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/01_Implementation_Closeout.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/02_Validation_And_Evidence_Register.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/03_Reaudit_Scorecard.md
```

## Hosted Evidence Honesty Rule

If the local environment cannot capture hosted SharePoint screenshots:

- do not fabricate evidence;
- record the exact evidence still pending;
- state that implementation is complete pending hosted acceptance proof.

## Failure Handling

If validation fails:

- do not stage or commit;
- report exact failed commands and output summary;
- isolate whether the issue is in prompt scope or pre-existing repo truth;
- stop before expanding scope.
