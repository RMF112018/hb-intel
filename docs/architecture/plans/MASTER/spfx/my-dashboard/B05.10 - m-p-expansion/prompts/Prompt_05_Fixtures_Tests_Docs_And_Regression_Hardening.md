# Prompt 05 — My Projects Multi-Platform Launch Expansion | Fixtures, Tests, Docs, and Regression Hardening

## Objective

Close all residual package work after core schema, backend, and frontend implementation:

1. fixture completeness,
2. test completeness,
3. docs reconciliation,
4. stale “dual launch” wording cleanup,
5. regression hardening,
6. evidence-ready final validation setup.

Do not introduce new product behavior in this prompt unless needed to complete coverage for the already-implemented feature.

---

## Mandatory working rules

1. Do not re-read files that remain available in your current context or working memory unless exact lines are needed or source changed.
2. Work from the Prompt 04 repo state.
3. Do not add new feature decisions.
4. Do not widen scope to backfill-script hang remediation.
5. Do not run live tenant apply in this prompt.
6. Keep docs current-state accurate and distinguish target schema vs live-verified schema where relevant.

---

## Required fixture audit

Inspect and complete:

- `packages/models/src/myWork/fixtures/myProjectLinksReadModels.ts`
- any fixture index exports
- any tests consuming exact fixture shapes

Confirm fixtures cover:
- all-platform-ready item,
- missing BuildingConnected,
- missing Document Crunch,
- legacy-only Registry stage/link item,
- merged-row stage fallback if fixtures encode it.

---

## Required test audit

Use `supporting/Test_Matrix.md` as the checklist.

Verify the codebase has test coverage for:

- provisioning descriptor,
- readiness verifier/helper,
- contract warning codes,
- provider action builders and stage rules,
- frontend menu order and new options,
- consolidated hint,
- existing UI regressions.

Add missing tests. Do not duplicate already adequate coverage.

---

## Required docs audit

Update/reconcile documentation:

- `docs/reference/sharepoint/list-schemas/hbcentral/lists/projects.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/legacy-project-fallback-registry.md`
- `docs/reference/spfx-surfaces/my-dashboard/my-projects-schema-readiness.md`
- `docs/how-to/administrator/provision-my-projects-source-list-schema.md`
- `apps/my-dashboard/README.md`

Search for current-state references to:
- “dual launch”
- “SharePoint or Procore”
- any schema text that omits BuildingConnected, Document Crunch, or Registry stage

Update only where the new implementation supersedes those statements.

---

## Required validation

Run the complete focused validation suite assembled from prior prompts.

At minimum include:
- scripts tests,
- provider tests,
- My Dashboard UI tests,
- functions typecheck,
- any changed models typecheck/tests,
- Prettier.

If exact package scripts differ, use repo truth and report exact commands.

---

## Required closeout

Return exactly:

# Prompt 05 Closeout — Fixtures, Tests, Docs, and Regression Hardening

## 1. Executive Verdict
State whether package coverage is complete before final integration validation.

## 2. Fixtures Finalized
List fixture scenarios.

## 3. Tests Added or Updated
List test files and key assertions.

## 4. Docs Reconciled
List docs and what changed.

## 5. Validation Results
Exact commands and outcomes.

## 6. Remaining Work for Prompt 06
State only final integration validation and commit closeout.
