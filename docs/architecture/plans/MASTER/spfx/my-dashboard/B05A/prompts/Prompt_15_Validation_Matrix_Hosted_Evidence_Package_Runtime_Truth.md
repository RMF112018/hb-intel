# Prompt 15 — Validation Matrix, Hosted Evidence, and Package / Runtime Truth

## Objective

Validate the completed My Projects implementation with a full local test matrix, package/runtime truth audit, and hosted SharePoint evidence plan. This prompt must prove the implementation is ready to close — or identify exactly what blocks closure.

It is a **validation and evidence** prompt. It may include operator-gated hosted checks, but it must not falsely claim live validation occurred when operator prerequisites are unavailable.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 14 closeout
- Prompt 10 route closeout
- Prompt 01 provisioning readiness artifact
- Prompt 05 and Prompt 06 migration/backfill closeouts
- Prompt 07 writer-truth closeout

---

## Repo-truth references to inspect

### Package/runtime truth
- `apps/my-dashboard/config/package-solution.json`
- `apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json`
- any packaging/build scripts for My Dashboard

### Validation commands / package scripts
- `apps/my-dashboard/package.json`
- `backend/functions/package.json`
- `packages/models/package.json`
- `packages/features/estimating/package.json`
- `apps/estimating/package.json`

### Completed implementation files
- My Projects UI module
- project-links contracts/fixtures
- backend provider/route/tests
- schema/backfill/writer changes

### Doctrine/closure model
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`

---

## Validation scope

# 1. Local validation command matrix

Run all relevant commands for touched packages. At minimum:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test

pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test

pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard lint
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
```

If Prompt 04 changed estimating/project setup code, also run:

```bash
pnpm --filter @hbc/features-estimating check-types
pnpm --filter @hbc/features-estimating test
pnpm --filter @hbc/spfx-project-setup build
pnpm --filter @hbc/spfx-project-setup test
```

Record exact pass/fail results and do not omit failing commands.

# 2. Static verification matrix

Verify the following with targeted searches and file inspection:

## Schema/contract
- 14 role fields appear where expected.
- Legacy Registry `procoreProject` contract exists.
- `procoreProject?: 'Yes' | 'No'` is gone or documented as a deliberate legacy residual requiring remediation.
- discovery writer forced override is gone.
- new route path exists in shared contract and backend host.

## UI
- My Projects title/purpose copy exists.
- two explicit action labels exist.
- View All disclosure exists.
- empty/partial/principal-unresolved/bounded copy exists.

Suggested searches:

```bash
rg -n "leadEstimatorUpns|warrantyManagerUpns|procoreProject" \
  backend/functions/src \
  packages/models/src \
  docs/reference/sharepoint/list-schemas/hbcentral/lists

rg -n "procoreProject\\?: 'Yes' \\| 'No'|MatchStatus: 'matched'|MatchConfidence: 'high'|MatchMethod: 'no-match'" \
  packages/models/src \
  backend/functions/src/services/legacy-fallback

rg -n "my-work/me/project-links|getMyProjectLinks|MyProjectLinksReadModel" \
  packages/models/src \
  apps/my-dashboard/src \
  backend/functions/src

rg -n "My Projects|Open SharePoint Site|Open SharePoint Folder|SharePoint unavailable|Open Procore|Procore unavailable|View all My Projects|No assigned projects were found|We could not confirm your project assignment identity" \
  apps/my-dashboard/src
```

# 3. Package / manifest / runtime truth

Inspect:

```text
apps/my-dashboard/config/package-solution.json
apps/my-dashboard/src/webparts/myDashboard/MyDashboardWebPart.manifest.json
```

Report:

- solution version;
- feature version;
- webpart manifest version;
- whether versions were intentionally changed during implementation;
- whether hosted validation references the correct package/runtime posture.

Do **not** invent PCC-like alignment expectations. Use My Dashboard repo truth.

# 4. Operator-gated tenant provisioning evidence

Do not run live mutations automatically. Record whether the operator has run or authorized:

- live schema provisioning;
- Projects backfill apply;
- Registry mirror/backfill apply;
- any tenant schema-read validation.

If not run, state:

- `operator-pending`;
- which prompts/Definition-of-Done items cannot be fully live-proven yet.

# 5. Hosted My Dashboard evidence

If operator prerequisites and hosted access are available, capture evidence across:

- ultrawide desktop;
- desktop;
- standard laptop;
- tablet landscape;
- tablet portrait;
- phone portrait;
- short-height constrained state.

Hosted evidence should prove:

- My Projects surface is visually premium and not a Project Sites clone;
- no horizontal overflow;
- both actions remain visible and usable;
- expand/collapse remains stable;
- shell is not broken;
- degraded states render credibly where fixture or host configuration allows.

If hosted evidence cannot be captured, produce a clearly labeled:

```text
HOSTED EVIDENCE OPERATOR-PENDING
```

section rather than making unsupported claims.

# 6. Evidence artifact

Create a validation/evidence report. Recommended filename:

```text
15_My_Projects_Validation_Hosted_Evidence_And_Runtime_Truth.md
```

Include:

- command table;
- static verification table;
- package/runtime truth table;
- tenant/operator proof status;
- hosted evidence status;
- residual blockers.

---

## Required non-goals

- Do not introduce new feature work during validation.
- Do not suppress failing tests.
- Do not claim live tenant work occurred if it did not.
- Do not run live schema or backfill mutations unless explicitly operator-authorized and prompt-scoped.
- Do not alter package versions unless the implementation/deployment path already requires a justified change.

---

## Evidence requirements

The report must contain:

1. command results;
2. package/runtime truth;
3. schema/backfill/writer status;
4. hosted validation status;
5. explicit PASS / FAIL / OPERATOR-PENDING classifications;
6. exact residual gaps, if any.

---

## Commit / closeout expectations

If the prompt adds only evidence/docs, recommended commit title:

```text
test(my-projects): capture validation and hosted evidence posture
```

Closeout format:

1. Verdict: PASS / FAIL / OPERATOR-PENDING
2. Branch / HEAD
3. Files changed
4. Validation command results
5. Static verification results
6. Package/runtime truth
7. Tenant provisioning/backfill proof status
8. Hosted evidence status
9. Residual blockers before Prompt 16
10. Recommended next prompt:
   - Prompt 16 if closure-ready;
   - or stop with explicit blocker list if not.

---

## Guardrails

- Protect unrelated active work.
- No opportunistic refactors.
- No lockfile/package changes unless already justified.
- Hosted validation must be truthful, reproducible, and explicitly separated from local-only proof.
