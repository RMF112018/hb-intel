# Local Validation Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
git diff --check
pnpm exec prettier --check <touched markdown/json files>
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/default_constraints_log_seed_structure.json >/tmp/wave12_constraints_seed_structure_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/risk_matrix_config_reference.json >/tmp/wave12_risk_matrix_config_validated.json
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-12/reference/constraint_exposure_scoring_reference.json >/tmp/wave12_constraint_exposure_config_validated.json
git diff --cached --name-only
git diff --name-only
```
