# 04 — Implementation Guardrails

## Objective

Prevent the code agent from accidentally expanding scope or weakening already-correct PCC behavior.

## Scope Guardrails

Do not implement:

- new features;
- new backend routes;
- new data mutations;
- new SDK integrations;
- new external launch behavior;
- new SharePoint list schemas;
- new Procore/Sage/Graph/Document Crunch/Adobe Sign calls;
- new authentication or authorization logic;
- new HBI answer behavior.

This remediation is UI primitive/card classification, visual hierarchy, tests, and closeout documentation only.

## Runtime Guardrails

Preserve:

- direct bento child invariant;
- one active-panel marker per route;
- row-span collapse resistance;
- no `grid-auto-flow: dense`;
- no live launch anchors for preview-only / visibility-only surfaces;
- read-only / no-write posture;
- portal drawer isolation outside the bento grid;
- existing fixture/read-model cardinality unless existing tests intentionally update for repo-truth changes.

## TypeScript Guardrails

- Do not use `any` unless there is no practical alternative and the reason is documented.
- Keep union types narrow.
- Prefer existing exported types:
  - `PccCardTier`
  - `PccCardRegion`
  - `PccCardFootprint`
  - `PccMvpSurfaceId`
  - existing view-model types.
- Avoid creating duplicate card taxonomy constants if existing types are sufficient.

## CSS Guardrails

- Use existing `--pcc-*` variables and `@hbc/ui-kit/theme` tokens.
- Avoid hardcoded brand colors where tokens exist.
- Do not create massive fixed heights.
- Do not make state/deferred cards look broken or invisible.
- Do not hide content solely to make screenshots cleaner.
- Avoid over-reliance on opacity for important text.
- Preserve contrast and focus visibility.

## Test Guardrails

- Do not weaken existing tests.
- Do not delete existing assertions unless they are demonstrably stale and replaced with stronger assertions.
- Prefer stable `data-pcc-*` selectors over broad text search.
- Keep tests deterministic.
- Avoid relying on hosted SharePoint DOM in unit tests.
- Do not snapshot entire DOM trees.

## Documentation Guardrails

- Create one closeout document for this remediation.
- Do not create a sprawling documentation tree unless necessary.
- Closeout must distinguish:
  - source/test closure completed;
  - hosted screenshot evidence pending or completed.
- Do not claim hosted proof if it was not captured.

## Worktree Guardrails

Before changes:

```bash
git status --short
```

If unrelated local changes exist:

- do not overwrite them;
- inspect enough to avoid conflict;
- proceed only on files required by this remediation.

After changes:

```bash
git status --short
git diff --check
```

## Commit Guardrails

Commit only the files changed for this remediation.

Do not include unrelated local edits or generated artifacts.

## Agent Efficiency Directive

Do not re-read files that are still in your current context or memory unless:

- exact line-level editing context is required;
- the file changed since it was last read;
- a test failure indicates the earlier understanding is stale.

Use targeted `rg`, targeted file reads, and existing context to conserve tokens.
