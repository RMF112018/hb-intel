
# Prompt 05 — Tests, Evidence, and Closeout

## Objective

Finalize test coverage, evidence generation, and closeout documentation for the My Projects source-list provisioning implementation.

## Why this issue exists now

The provisioning path touches production SharePoint schema, so it needs stronger proof than code compilation.

## Why it matters

The implementation is not acceptable until it proves safety, idempotence, dry-run behavior, wrong-type protection, and readiness closure.

## Current repo-truth condition

The repo already values evidence-oriented closeouts and operator-gated scripts. Existing B05A artifacts include readiness, backfill, and permission gating docs.

## Required future state

Produce final closeout documentation with:

- implementation summary;
- changed files;
- test commands and results;
- dry-run sample report path or fixture;
- operator proof items still pending, if any;
- exact commands for live tenant execution;
- explicit no-tenant-mutation statement if no live apply was run by the agent.

## Exact files / seams / symbols to inspect

- New provisioner tests.
- Shared utility tests.
- Existing legacy fallback provisioner tests.
- Readiness helper tests.
- B05A README or closeout docs.

## Research-informed technical considerations

- Closure evidence should distinguish app configuration from effective runtime permission.
- Closure evidence should include post-apply readiness JSON, not just successful field-create calls.
- Wrong-type drift must remain visible and unresolved unless manually remediated.

## Required implementation scope

- Add missing tests for idempotence and safety.
- Add closeout doc under the relevant B05A or my-dashboard planning/evidence path.
- Confirm all changed docs use current names: `HB Central`, `My Dashboard`, `My Projects`, `Legacy Project Fallback Registry`.
- Confirm no secrets or tokens appear in docs/tests/fixtures.

## Explicit non-scope

- Do not run live `--apply` unless the operator explicitly instructs and credentials are available.
- Do not commit screenshots or tenant exports containing secrets.
- Do not alter unrelated My Dashboard UI.

## Required tests

- All new tests.
- Existing related tests.
- Typecheck.

## Validation commands

```bash
pnpm test -- backend/functions/src/services/sharepoint-schema-provisioning
pnpm test -- backend/functions/src/services/my-projects
pnpm test -- scripts/provision-my-projects-source-list-schema
pnpm test -- scripts/verify-my-project-role-fields
pnpm typecheck
```

## Proof-of-closure artifacts

- Test output.
- Closeout markdown.
- Dry-run fixture/report.
- Final operator checklist.

## Completion standard

This prompt is complete when the repo has a tested, documented, deterministic provisioning path and the local agent can provide a clear PASS/FAIL closeout without relying on manual inference.

> **Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.**
