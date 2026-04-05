# Prompt 02 — Implement the Narrow Cumulative Loader Remediation

## Objective

Implement the smallest correct remediation for the cumulative loader-contract regression identified in Prompt 01.

This prompt is for **implementation only**.

## Repo focus

Primary:
- `tools/build-spfx-package.ts`

As needed:
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `apps/hb-webparts/config/package-solution.json`

Only touch other files if Prompt 01 proves they are part of the actual regression.

## Implementation principles

- preserve the successful baseline parameters proven by the hero and rail proof cases wherever possible
- change only the cumulative regression layer
- keep previously validated webparts included in the package
- do not collapse back to replacement-style single-target rollout
- do not broaden into unrelated architectural refactors

## Required implementation targets

Your implementation must target the defect layer identified in Prompt 01. Examples of acceptable narrow remediation targets include:

- fixing cumulative `entryModuleId` emission
- fixing cumulative `scriptResources` emission
- fixing generated shim module identity/content/pathing
- fixing packaged asset inclusion for cumulative aliases
- fixing mismatch between packaged identities and SharePoint runtime expectations
- introducing a safer cumulative mapping strategy if the current alias strategy is the proven blocker

## Required deliverable

Provide a completion note with:

1. files changed
2. exact defect layer addressed
3. exact narrow remediation implemented
4. what was intentionally not changed
5. known remaining risks before tenant validation

## Hard constraints

- Do not remove previously validated webparts from the package.
- Do not declare success without rebuilding and inspecting the package.
- Do not “fix” the issue by falling back permanently to single-target proof cases.
- Do not re-read files already in active context unless needed for verification.
