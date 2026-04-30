---
name: hb-workspace-surface-router
description: Route HB Intel work by repo surface before implementation, validation, or documentation changes.
when_to_use: Use at the start of unfamiliar or multi-area repo work, especially when the scope may touch apps, packages, feature packages, backend, tools, docs, SPFx, or PCC.
argument-hint: "[target scope or files]"
---

# HB Workspace Surface Router

Route the work for:

```text
$ARGUMENTS
```

## Procedure

1. Classify the surface:
   - `apps/*`
   - `packages/*`
   - `packages/features/*`
   - `backend/*`
   - `tools/*` or `scripts/*`
   - `docs/*`
   - PCC
   - SPFx
   - tenant/deployment-sensitive

2. Read the smallest source set:
   - `pnpm-workspace.yaml`
   - root `package.json` only if workspace behavior matters
   - nearest `package.json`
   - nearest README
   - nearest config/test/export files
   - governing docs for the surface

3. Identify:
   - package/app name;
   - local scripts;
   - public exports;
   - affected consumers;
   - validation level;
   - relevant Skills/agents.

4. Output:
   - surface classification;
   - required sources;
   - recommended Skill/agent;
   - allowed scope;
   - validation route;
   - risk notes.
