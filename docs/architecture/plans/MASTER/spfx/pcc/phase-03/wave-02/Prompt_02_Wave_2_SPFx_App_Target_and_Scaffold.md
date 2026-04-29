# Prompt 02 — Wave 2 SPFx App Target and Scaffold

## Operating Instructions

You are executing this prompt in the live `RMF112018/hb-intel` repository. Treat the current repo as the source of truth. Do not assume files from memory are current. However, do not repeatedly re-read files that are still within your current context unless the file may have changed or the prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis, do not ask broad clarification questions, and do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Create the dedicated PCC SPFx app scaffold at `apps/project-control-center/`, following the repo pattern proven by existing SPFx apps, especially the app-level Vite mount pattern. Do not implement full PCC UI yet; create the safe app target, root component, package scripts, local preview shell, and minimal test skeleton.

## Prerequisite

Prompt 01 must confirm:

- Wave 1 closeout is present;
- the basis-of-design image exists;
- `apps/project-control-center/` is the correct target;
- allowed files are locked.

## Required Scaffold

Create the minimum viable app package:

```text
apps/project-control-center/package.json
apps/project-control-center/tsconfig.json
apps/project-control-center/vite.config.ts
apps/project-control-center/index.html
apps/project-control-center/src/mount.tsx
apps/project-control-center/src/PccApp.tsx
apps/project-control-center/src/PccApp.test.tsx
apps/project-control-center/src/styles/*.css or *.module.css
apps/project-control-center/README.md
```

If repo truth requires root export support, create a `packages/spfx/src/webparts/projectControlCenter/` root in the same app pattern as Project Sites. Do not add it unless necessary and document why.

## Required Package Behavior

- Package name should be `@hbc/spfx-project-control-center` unless repo naming conventions require another name.
- Use React 18 and existing workspace catalog conventions.
- Use `@hbc/models` / `@hbc/models/pcc` for PCC contracts.
- Use `@hbc/ui-kit` where available and compatible.
- Use local fixture-driven rendering only.
- Include `build`, `check-types`, `lint`, and `test` scripts if consistent with repo pattern.

## Forbidden Work

Do not:

- modify backend/functions;
- modify provisioning or template packages;
- add Graph/PnP live calls;
- add Procore runtime;
- add tenant mutation;
- add app catalog packaging;
- bump manifests/solution versions;
- implement all surface UI in this prompt;
- copy homepage paired-row layout code.

## Validation

Run:

```bash
git status --short
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center lint
```

If the package name differs, update the commands to the actual package name and document why.

## Closeout

Create:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Prompt_02_Closeout.md
```

Confirm scaffold created, no version/manifest/deployment changes, and no live integration paths.
