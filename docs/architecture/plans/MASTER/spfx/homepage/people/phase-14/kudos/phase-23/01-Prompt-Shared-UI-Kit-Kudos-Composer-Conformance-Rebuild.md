# Prompt 01 — Shared UI-Kit Kudos Composer Conformance Rebuild
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

The shared `HbcKudosComposer` family currently violates the repo’s published UI-kit authoring rules. Rebuild this shared component family so it is genuinely UI-kit-compliant and no longer depends on a local CSS-module / hardcoded-style pattern that contradicts `packages/ui-kit/DESIGN_SYSTEM.md`.

## Primary files / areas to inspect

- `packages/ui-kit/DESIGN_SYSTEM.md`
- `packages/ui-kit/src/homepage.ts`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcKudosComposer/kudos-composer.module.css`
- `packages/ui-kit/src/HbcKudosComposer/HbcKudosComposer.stories.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`

## Required work

1. Audit the current `HbcKudosComposer` implementation against the published authoring rules in `packages/ui-kit/DESIGN_SYSTEM.md` and list the exact rule breaks before editing.
2. Replace the current CSS-module-heavy implementation with a styling approach that aligns with the repo’s declared UI-kit standard. If Griffel `makeStyles` is the governing standard, move the component to that pattern completely rather than partially.
3. Eliminate hardcoded visual values from the shared Kudos composer surface wherever governed shared tokens should be used instead.
4. Keep the public API stable unless an API change is absolutely required; if an API change is necessary, update all current consumers in the same change set.
5. Ensure the shared flyout, form, preview, success, and error states remain visually cohesive after the rebuild.
6. Bring the Storybook file into compliance with the design system requirements for shared UI-kit components.
7. Do not leave the shared composer in an in-between state where part of the feature uses CSS modules and part uses the new standard without a clear architectural rationale.

## Non-goals / guardrails

- Do not collapse public-runtime-specific business logic into the shared UI-kit layer.
- Do not move SharePoint-only data access into the shared UI-kit package.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes for the touched package(s)
- `pnpm typecheck` passes
- targeted Storybook / component build validation passes for the touched UI-kit area
- targeted Kudos Playwright coverage still passes for composer-related flows
- verify the public runtime and companion runtime still render correctly using the rebuilt shared composer

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
