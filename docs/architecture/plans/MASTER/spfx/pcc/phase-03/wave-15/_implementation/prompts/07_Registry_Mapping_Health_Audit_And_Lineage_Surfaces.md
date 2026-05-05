# Prompt 07 — Registry, Mapping, Health, Audit, and Lineage Surfaces

## Objective

Implement the registry, mapping/source health, mapping review detail, audit history, and HBI source lineage panel portions of the Launch Pad.

## Required Instruction Phrase

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```bash
cd /Users/bobbyfetting/hb-intel
```

## Required Initial Repo-Truth Commands

Run and record:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

If the worktree is not clean, distinguish user-owned drift from authorized prompt scope before editing. Do not stage unrelated files.

## Global Guardrails

- Work only in `/Users/bobbyfetting/hb-intel`.
- Preserve Wave 15 as a governed launch/reference layer first.
- Preserve no-writeback, no-sync, no-mirror posture.
- Preserve source-system ownership of source records.
- Preserve PCC ownership of launch/mapping/review/audit/health posture records.
- Preserve Wave 14 ownership of approval/checkpoint semantics.
- Preserve HBI no-authority posture.
- Do not add live external-system API calls.
- Do not add SharePoint/Graph/PnP writes.
- Do not add tenant/list/group/security mutation.
- Do not add command/write routes.
- Do not add iframe/current-image embed behavior.
- Do not add package dependencies or mutate lockfile.
- Do not mutate SPFx manifests, SPPKGs, deployment config, or CI workflows.
- Do not run broad formatting across the repo.


## Authorized Scope

- `apps/project-control-center/src/surfaces/externalSystems/**`
- External Systems SPFx tests

## Required Reference Inputs

Read wireframes 05-09 plus:

```text
docs/05_SPFX_UX_IMPLEMENTATION_BLUEPRINT.md
docs/07_SECURITY_URL_POLICY_AND_HBI_GUARDRAILS.md
```

## Required Implementation

1. External System Registry panel.
2. Mapping Source Health panel.
3. Mapping Review Detail view.
4. Audit History timeline/table.
5. HBI Source Lineage panel.
6. Citation-ready/refusal/unavailable/unauthorized states.
7. Metadata redaction behavior.
8. Responsive and accessible panel behavior.

## Required Tests

- registry active/inactive render;
- mapping stale/conflict/missing render;
- health degraded/throttled render;
- audit timeline redacts metadata where flagged;
- HBI lineage citation-ready render;
- HBI refusal render;
- no HBI authority action render;
- no external write/iframe behavior.

## Validation

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
md5 pnpm-lock.yaml
```


## Commit

Commit scoped changes if validations pass. Use the repo's standard commit summary/description style and include validation/guardrail evidence in the response.

## Final Output Requirements

Use `reference/08_PROMPT_CLOSEOUT_TEMPLATE.md` where applicable. Include exact commands run, validation results, files changed, guardrail attestation, and residual risks.
