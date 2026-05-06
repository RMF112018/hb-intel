# 07 — Test, Screenshot, and Accessibility Evidence Plan

## Purpose

Define the Wave E validation proof required for state-model and product-language remediation.

## Unit / Component Tests

Required tests by area:

| Area | Required tests |
|---|---|
| `PccPreviewState` / state primitive | State catalog, default copy, custom title/description, `reason`, `nextStep`, loading `aria-busy`, error `role="alert"`, data markers. |
| Operational taxonomy / alias map | Every target state kind maps to a display spec; no undefined state; source-status mapping is deterministic. |
| `PccDisabledAffordance` | Required reason, optional next step, `aria-disabled`, `aria-describedby`, no click invocation. |
| Documents source-state messaging | Every source health and envelope status returns lane-specific label/message/tone. |
| Surface headers | Routed surfaces consume centralized posture copy; no forbidden primary strings. |
| Approvals | Every disabled approval action has reason and accessible relation. |
| External Systems | Launch/edit/save disabled paths have reasons and activation copy. |
| Readiness / Site Health | Degraded/blocked/error states show operational severity and next action. |
| Router fallback | Fallback unavailable state explains why and next step or is proven unreachable. |

## Grep Evidence

Run forbidden-token scans before and after changes.

Recommended command:

```bash
rg -n --glob '!**/*.test.*' --glob '!**/*.md'   '"Read-only preview"|"Fixture default"|"Preview confidence"|"Pending envelope"|"Read-model available"|"Envelope confidence"|"Runtime envelope timestamp"|"Not connected in this prompt"|"in this preview"|"in this prompt"|"preview-safe"|"fixture-driven"|"preview mode"|"Inert preview"|">Preview only<"|\bWave [0-9]+\b|\bPrompt [0-9]+\b'   apps/project-control-center/src
```

Closeout must classify any remaining hits:

- user-visible defect;
- test-only;
- comment/JSDoc;
- internal type literal;
- admin diagnostics.

## Screenshot Evidence

Minimum screenshot set:

| Surface | Required captures |
|---|---|
| Project Home | Reference/preview posture, setup-required card, disabled/reference priority action. |
| Team & Access | Header posture, permission request disabled reason, access manager disabled reason. |
| Documents | Source connected, missing binding/setup required, disabled browse/open explanation. |
| Project Readiness | Degraded/blocked/read-only state and empty lane if present. |
| Approvals | Approval queue plus disabled action explanation. |
| External Systems | Integration status tile, activation state, disabled edit/save explanation. |
| Control Center Settings | Locked/setup-required/editable distinction. |
| Site Health | Security/drift/repair severity and next action. |
| Router fallback | Only if reachable. |

Width matrix:

- `wideDesktop`
- `standardDesktop` / SharePoint-constrained simulated
- tablet
- phone/narrow container when the harness supports it

## Accessibility / Keyboard Evidence

Required checks:

- Loading state communicates busy status.
- Error state uses alert semantics appropriately.
- Disabled affordance reason is visible, not hover-only.
- `aria-describedby` resolves to visible reason text.
- Keyboard tab order does not trap focus.
- Disabled/inert controls do not perform actions.
- Text remains readable at constrained widths.

## Command Evidence

Record exact commands and results:

```text
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed files>
```

## Evidence Index

Use:

```text
artifacts/screenshot-evidence-index-template.md
```

Store operator-pending screenshots under the corresponding closeout folder if screenshot capture cannot be completed by the agent.

## Pass Criteria

Wave E can be closed when:

- tests pass;
- forbidden user-visible strings are absent or documented as non-user-facing;
- every routed surface has state coverage;
- disabled actions are explained and accessible;
- screenshot/evidence plan is populated;
- residual risks are documented;
- no final 56/56 claim is made without later-wave evidence.
