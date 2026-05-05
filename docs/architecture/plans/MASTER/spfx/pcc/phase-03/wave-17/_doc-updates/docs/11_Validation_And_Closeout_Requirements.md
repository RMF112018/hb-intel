# 11 — Validation and Closeout Requirements

## Required Repo-Truth Evidence

Closeout must capture:

- `git status --short`
- `git branch --show-current`
- `git rev-parse HEAD`
- `git log --oneline -12`
- `md5 pnpm-lock.yaml` before and after
- local package path
- touched file list
- validation commands and outputs
- residual risks
- explicit no-runtime-change attestation

## Required Validation Commands

```bash
git diff --check
pnpm exec prettier --check <touched markdown/json files>
find <wave-17-package-path> -name "*.json" -print0 | xargs -0 -n1 python3 -m json.tool >/dev/null
rg -n "TB[D]|TO[D]O|Open decisio[n]|PLACEHOLDE[R]" <wave-17-package-path>
git diff --name-only
git diff --cached --name-only
```

## No-Orphaned-Docs Proof

Closeout must prove:

- every new Wave 17 canonical doc is linked from `wave-17/README.md`;
- every new list schema is linked from PCC `List-Map.md`;
- every prompt closeout is linked from Wave 17 closeout;
- no generated package artifact is left outside the approved planning path unless intentionally kept as reference.

## Artifact Promotion Requirements

- Planning-package artifacts stay in `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-17/_doc-updates/`.
- Canonical architecture docs land under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-17/`.
- SharePoint list schema docs land under `docs/reference/sharepoint/list-schemas/pcc/lists/`.
- No runtime source changes are promoted from this package.

## Residual Risk Reporting

Closeout must report:

- local repo truth that differed from remote audit;
- existing Site Health files that were reconciled;
- docs intentionally not modified and why;
- missing implementation work deferred to future packages;
- any validation not run and why;
- any lockfile or package manifest changes, which should be none.
