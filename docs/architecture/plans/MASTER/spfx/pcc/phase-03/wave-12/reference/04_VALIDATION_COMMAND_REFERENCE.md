# Validation Command Reference — Wave 12 Constraints Log

Prompt 01 must inspect package scripts before treating any package-level command as mandatory. The following commands are expected based on GitHub connector repo truth and must be revalidated locally.

## Baseline / Status

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Diff / Formatting

```bash
git diff --check
pnpm exec prettier --check <touched markdown/json files>
git diff --name-only
git diff --cached --name-only
git diff --cached --stat
```

Do not run broad `prettier --write` across the repo. Use targeted `prettier --write <file list>` only if a prompt explicitly allows formatting cleanup on touched files.

## JSON Validation

```bash
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure.json >/tmp/wave12_constraints_seed_structure_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/risk_matrix_config_reference.json >/tmp/wave12_risk_matrix_config_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/constraint_exposure_scoring_reference.json >/tmp/wave12_constraint_exposure_config_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/source_research_urls.json >/tmp/wave12_source_research_urls_validated.json
```

## Package Validation — Subject to Local Script Verification

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

Use the smallest package-validation set that matches the touched files, then run broader validation in Prompt 07.

## Lockfile Protection

Capture the lockfile hash before and after each prompt:

```bash
md5 pnpm-lock.yaml
```

If the hash changes and the prompt did not explicitly authorize dependency changes, stop and report.
