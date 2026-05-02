# Validation Command Reference

## Required Baseline Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required General Validation Commands

```bash
git status --short
git diff --check
git diff --name-only
git diff --cached --name-only
pnpm exec prettier --check <touched markdown/json files only>
```

## JSON Validation for Wave 13 Reference Files

```bash
for f in \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/default_buyout_log_seed_structure.json \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/buyout_module_data_contract.json \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/buyout_state_machine.json \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/field_mutability_matrix.json \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/buyout_exception_reason_codes.json \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/fixture_scenarios.json \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/procore_buyout_data_mapping_reference.json \
  docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13/reference/source_research_urls.json
do
  python3 -m json.tool "$f" > /tmp/"$(basename "$f")".validated
done
```

## Repo-Observed Package Scripts

Prompt 01 must re-open package scripts locally before using these.

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test

pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test

pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```

## Optional Targeted Lint

Only run if prompt scope and repo state make it appropriate:

```bash
pnpm --filter @hbc/models lint
pnpm --filter @hbc/functions lint
pnpm --filter @hbc/spfx-project-control-center lint
```

Do not fail the implementation solely on known unrelated pre-existing lint warnings/errors; report them explicitly with evidence.

## Forbidden Validation Shortcuts

- Do not run broad `pnpm format`.
- Do not run broad `prettier --write`.
- Do not use uninspected scripts.
- Do not stage validation artifacts under `/tmp`.
- Do not commit if validation creates unexpected repo changes.
