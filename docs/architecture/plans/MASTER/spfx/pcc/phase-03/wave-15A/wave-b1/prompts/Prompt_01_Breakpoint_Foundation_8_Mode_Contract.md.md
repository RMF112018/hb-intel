# Prompt 01 — Breakpoint Foundation: 8-Mode PCC Contract


# Shared Instructions for This Prompt

## Context-Efficiency Rules

- Use active context first.
- Do not re-read files that are already in your current context and have not changed.
- Read only files you will edit, tests you will update, the immediately prior closeout, or exact type definitions needed to compile.
- Do not run broad repo audits.
- Do not search unrelated packages or archived plans.
- Do not inspect backend/API/surface/shared-package files unless a validation failure points there or this prompt explicitly allows it.
- If you need files outside the allowed list, stop and explain why before expanding scope.

## Global Guardrails

- No backend/API runtime changes.
- No Graph/PnP/SharePoint REST.
- No Procore live integration.
- No dependency install/update.
- No `pnpm-lock.yaml` drift.
- No package/manifest bump unless packaging files are changed and user approval is obtained.
- No final 56/56 claim.
- No `git push` unless the user explicitly instructs it.


## Role

You are the PCC breakpoint foundation implementation agent.

## Objective

Expand PCC from the current 5 responsive modes to the finalized 8-mode breakpoint contract.

Do not change shell UI, navigation, hero/header, surfaces, backend/API, package files, or manifests.

## Allowed Files to Edit

```text
apps/project-control-center/src/layout/footprints.ts
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15A/wave-b/prompt-01-breakpoints/closeout/PROMPT_01_BREAKPOINTS_CLOSEOUT.md
```

Only edit `useContainerBreakpoint.ts` if the existing hook requires a type/default-mode update after changing `footprints.ts`.

## Allowed Reads

Use active context first. Read only:

- the files being edited,
- `docs/04_BREAKPOINT_POLICY_SPECIFICATION.md`,
- TypeScript errors if check-types fails.

Do not read homepage breakpoint policy. It is not PCC authority.

## Implementation Requirements

1. Replace `PCC_RESPONSIVE_MODES` with:

```text
phone
tabletPortrait
tabletLandscape
smallLaptop
standardLaptop
largeLaptop
desktop
ultrawide
```

2. Implement deterministic resolver boundaries:

```text
<480 => phone
480–768 => tabletPortrait
769–1024 => tabletLandscape
1025–1180 => smallLaptop
1181–1440 => standardLaptop
1441–1599 => largeLaptop
1600–1919 => desktop
>=1920 => ultrawide
```

3. Update all exhaustive maps:

- `PCC_RESPONSIVE_COLUMNS`
- `FOOTPRINT_COLUMN_SPANS`
- `FOOTPRINT_MIN_COLUMN_SPANS`
- `FOOTPRINT_MIN_INLINE_SIZE_PX`
- thresholds / resolver support

4. Add/extend boundary tests for:

```text
479, 480, 768, 769, 1024, 1025, 1180, 1181, 1440, 1441, 1599, 1600, 1919, 1920
```

5. Update shell responsive expectations without implementing tabs yet. If current rail variant expectations are still present, map them temporarily for the new modes until rail replacement occurs.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test -- PccBentoGrid.footprints PccShell.responsive
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
pnpm exec prettier --check <changed-files>
md5 pnpm-lock.yaml
```

## Stop Conditions

Stop if:

- breakpoint change requires homepage shell edits,
- tests require unrelated surface changes,
- lockfile changes,
- type errors point outside PCC and cannot be explained by the responsive mode union.

## Closeout

Create the closeout path listed above. Include:

- exact files changed from git diff,
- boundary test results,
- temporary rail mapping note if applicable,
- context-efficiency section,
- next prompt: horizontal tabs primitive.
