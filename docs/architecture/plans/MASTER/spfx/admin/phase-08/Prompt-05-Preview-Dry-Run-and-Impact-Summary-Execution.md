# Prompt-05 — Preview / Dry-Run and Impact Summary Execution

## Objective

Add backend support for preview / dry-run so operators can see what a SharePoint standards application or repair would do before privileged execution is triggered.

## Important execution rules

- Do not bypass preview logic for repair-oriented flows unless a narrowly documented repo-truth exception exists.
- Keep output explicit, operator-readable, and audit-friendly.
- Reuse prior-phase run / risk / checkpoint semantics where applicable.

## Inputs

Use:
- the drift workflow output
- shared admin run / risk / audit semantics already present in the repo
- existing orchestration / activity patterns

## Scope of work

Implement the smallest correct preview / dry-run behavior for:
- standards application preview
- standards reapplication preview
- controlled repair preview
- package / API posture remediation preview where relevant

## Required behavior

Preview output should include, where applicable:
- target asset
- standards snapshot reference
- proposed changes
- non-changes
- warnings / risk markers
- unsupported or blocked actions
- operator-facing impact summary
- backend evidence payload suitable for later audit

## Documentation output

Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-8/admin-spfx-phase-8-preview-and-dry-run.md`

Document:
1. preview semantics
2. non-destructive guarantees
3. impact-summary shape
4. audit / evidence expectations
5. current exclusions or limitations

## Validation

Run the smallest targeted validation to prove:
- preview is non-destructive,
- preview output is stable enough for UI rendering,
- and preview artifacts are compatible with later execution flows.

## Completion condition

Stop after preview / dry-run behavior is implemented and documented.
Do not build the final repair flow in this prompt.
