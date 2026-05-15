# Prompt 06 — Remove Obsolete UI Artifacts and Reconcile Tests / Docs

```markdown
# Objective

Remove obsolete runtime UI artifacts that enforce or describe the rejected old product model, reconcile tests and documentation to the new target posture, and update the My Dashboard README from stale batch-scaffold framing to current runtime truth.

# Repo-truth context

Start from Prompts 01–05.

Primary seams to inspect:
- all files changed in Prompts 01–05;
- `apps/my-dashboard/README.md`;
- `apps/my-dashboard/src/shell/`
- `apps/my-dashboard/src/surfaces/home/`
- `apps/my-dashboard/src/modules/adobeSign/`
- `apps/my-dashboard/src/state/`
- `apps/my-dashboard/**/*.test.tsx`
- relevant current-reference docs under:
  - `docs/reference/spfx-surfaces/my-dashboard/`
  - `docs/architecture/plans/MASTER/spfx/my-dashboard/`

Important: treat historical batch docs as historical unless they are presented as current operational truth or actively referenced by README/current docs.

Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

# Architectural guardrails

1. Do not preserve dead UI runtime artifacts merely because they existed before.
2. Do not delete shared contracts or still-live helper logic without proving they are unused or obsolete.
3. Do not rewrite unrelated historical docs.
4. The README must describe actual current posture, not B02-only scaffolding.
5. Tests must reflect the new UI architecture, not the rejected prior one.

# Implementation instructions

## 1. Dead artifact cleanup
Identify and remove or decisively de-render obsolete artifacts, including where applicable:
- primary navigation component/tests;
- dropdown launcher styles/tests;
- focused Adobe route artifacts/tests;
- hero telemetry components/view-models/tests;
- standalone Work Summary card;
- standalone Source Readiness card;
- standalone Adobe queue state / connection guidance artifacts if no longer part of the consolidated architecture.

Do not assume every file must be deleted. Apply the `Expected-Removal-And-Preservation-Map.md` logic.

## 2. README update
Rewrite `apps/my-dashboard/README.md` so it accurately states:
- current app purpose;
- primary My Work dashboard posture;
- two rendered production modules;
- one-card-per-module principle;
- source-of-record handoff posture;
- high-level validation/build commands;
- SPFx package artifact identity where already accurate.

Remove stale claims that the app does not implement My Work shell or Adobe UI.

## 3. Current-reference docs
Inspect current-reference docs that would actively mislead future developers if left unchanged. Update only those that claim the old tab/focused-route UI model is current target truth.

## 4. Test reconciliation
- remove/replace tests that assert visible tab/dropdown/focused-route behavior;
- add/retain tests that prove:
  - compact header;
  - two target cards;
  - Adobe consolidation;
  - My Projects compressed state behavior;
  - bento span choreography where testable.

# Why the current implementation is insufficient

A UI-posture reset is not complete if the repo retains active tests and current docs that continuously reassert the rejected old architecture. That would invite regression.

# Required implementation outcome

After this prompt:
- runtime artifacts no longer enforce the old UI model;
- README reflects the new product;
- tests/docs align with the target posture;
- future developers will not be guided back into the developer-first shell.

# What done really looks like

A new developer can read `apps/my-dashboard/README.md` and understand the actual product posture now shipped. The test suite defends the new posture instead of the old one.

# Verification

Run:
```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

# Documentation updates

This prompt owns:
- `apps/my-dashboard/README.md`
- directly misleading current-reference docs, if any
- relevant component comments/test descriptions

# Deliverables / exit criteria

Return:

1. **Implementation Decision:** PASS / PARTIAL / BLOCKED
2. **Files inspected**
3. **Files changed**
4. **Files deleted, if any, and why**
5. **README update summary**
6. **Current-reference docs updated, if any**
7. **Test posture reconciliation**
8. **Validation commands/results**
```
