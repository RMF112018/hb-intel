# 04 — Validation Command Reference


## Required Repo Truth / Validation Commands

Run and record before edits:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Expected lockfile MD5 unless explicitly justified and authorized:

```text
c56df7b79986896624536aab74d609f4
```

Run before commit:

```bash
git diff --check
git diff --stat
git diff --name-only
git diff --cached --name-only
```

For touched markdown/json files:

```bash
pnpm exec prettier --check <touched markdown/json files>
```

For touched JSON files:

```bash
python3 -m json.tool <each touched json file> >/dev/null
```

For source implementation prompts, inspect the relevant `package.json` files before selecting package commands. Do not guess package scripts. Use repo-confirmed equivalents of:

```bash
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
```


## Additional Static Guard Searches

Use repo-appropriate search tools to prove no forbidden runtime/external behavior was added. Examples, scoped to touched files where possible:

```bash
rg "fetch\(|XMLHttpRequest|EventSource|WebSocket|navigator\.sendBeacon" <touched source files>
rg "procore|sage|graph\.microsoft|@microsoft/sp-|@pnp|autodesk|docusign|adobe|document-crunch" <touched source files>
rg "POST|PUT|PATCH|DELETE" backend/functions/src/hosts/pcc-read-model
rg "buyout-workspace|procurement-workspace|external-writeback|accounting-posting" apps/project-control-center/src packages/models/src
```

Do not use broad destructive commands. Do not run broad Prettier write.
