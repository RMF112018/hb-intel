# Prompt 06 — Project Link Drawer, Review Queue, and URL Policy UX

## Objective

Implement the Add/Edit Project Link Drawer, custom link review queue, and URL policy preview UX as future-command intent only.

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

Read wireframes 03 and 04 plus:

```text
docs/05_SPFX_UX_IMPLEMENTATION_BLUEPRINT.md
docs/07_SECURITY_URL_POLICY_AND_HBI_GUARDRAILS.md
```

## Required Implementation

1. Implement drawer shell with local-only controlled fields.
2. Implement validation summary and URL policy preview.
3. Implement role/action visibility and disabled reason captions.
4. Implement review queue with submitted/rejected/blocked/stale states.
5. Implement details view/read-only drawer for review item context if useful.
6. Ensure no save/submit/approve/reject/archive write occurs.

## Accessibility Requirements

- focus moves to drawer heading on open;
- Escape closes;
- focus returns to trigger;
- validation errors are announced or visibly linked;
- disabled controls have reason text.

## Required Tests

- drawer opens/closes;
- Escape closes if testable;
- blocked URL shows policy reason;
- credential-like query param is shown as blocked;
- viewer cannot edit;
- reviewer cannot directly edit submitted detail by default;
- no write handler is called or present.

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
