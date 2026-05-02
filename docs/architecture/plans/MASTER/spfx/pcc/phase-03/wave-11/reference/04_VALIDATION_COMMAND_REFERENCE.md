# 04 — Validation Command Reference

Use repo-appropriate commands based on touched files and package scripts.

## Baseline / Scope

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## JSON Validation

```bash
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json >/tmp/wave11_default_items_validated.json
```

## Count Check Example

```bash
python3 - <<'PY'
import json
from pathlib import Path

p = Path("docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json")
data = json.loads(p.read_text())
items = data.get("defaultItems", [])
ambiguous = data.get("ambiguousItems", [])
pm = [i for i in items if i.get("sourceSheet") == "PM"]
field = [i for i in items if i.get("sourceSheet") == "Field"]
owner_active = [
    i for i in items
    if i.get("sourceWorkbookType") == "owner-contract-responsibility-matrix"
    and i.get("recommendedTargetClassification") == "active-default-obligation"
]
print("defaultItems total:", len(items))
print("ambiguousItems total:", len(ambiguous))
print("PM items:", len(pm))
print("Field items:", len(field))
print("owner-contract active default obligations:", len(owner_active))
PY
```

## Package Validation

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

## Formatting / Diff

```bash
git diff --check
pnpm exec prettier --check <touched files>
git diff --cached --name-only
git status --short
md5 pnpm-lock.yaml
```

## Rule

Use the actual package scripts from local `package.json` files. If scripts differ, use the repo's actual scripts and record the discrepancy.
