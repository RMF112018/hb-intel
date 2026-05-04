# Validation Command Reference

## Local Repo Truth

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## JSON Artifacts

```bash
python3 -m json.tool docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-14/_doc-updates/artifacts/manifest.json >/dev/null
python3 -m json.tool docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-14/_doc-updates/artifacts/approval_checkpoint_state_machine.json >/dev/null
```

Repeat for all touched/generated JSON artifacts.

## Model Package

Confirmed remote scripts:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

## Backend Functions Package

Confirmed remote scripts:

```bash
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
```

## SPFx PCC Package

Confirmed remote scripts:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

Use `build` only in prompts that touch SPFx source or when Prompt 07 final validation requires it.

## Diff / Formatting

```bash
git diff --check
git diff --name-only
git diff --cached --name-only
git diff --cached --check
pnpm exec prettier --check <touched-markdown-json-files>
md5 pnpm-lock.yaml
```

## Validation Reporting Standard

Each prompt closeout must record:

- commands run;
- pass/fail result;
- any unrelated failures;
- lockfile MD5 before/after;
- package/manifest/workflow mutation attestation.
