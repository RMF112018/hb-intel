# Prompt 06 — Accessibility, Keyboard, and Focus Compliance
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

Close the remaining accessibility and interaction-compliance gaps across public and companion HB Kudos surfaces, with special attention to target sizes, focus-visible behavior, focus restoration, and keyboard-only operation.

## Primary files / areas to inspect

- `packages/ui-kit/DESIGN_SYSTEM.md`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcKudosComposer/*`
- `apps/hb-webparts/src/webparts/hbKudos/*`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/*`
- `e2e/webparts/kudos/hosted/kudos.hosted.keyboard-and-focus.spec.ts`

## Required work

1. Audit interactive control sizes across the public and companion Kudos experiences against the declared minimum target-size expectations and correct undersized controls.
2. Ensure all critical actions expose strong `:focus-visible` behavior that is visible, consistent, and keyboard-friendly.
3. Make focus restoration explicit when flyouts close so the trigger or appropriate originating control regains focus reliably.
4. Harden keyboard-only traversal through composer, feed, reader, archive, companion queue, and detail views.
5. Where semantic markup can be improved for assistive tech, do so as part of this pass.
6. Update or expand keyboard/focus tests so the corrected behavior is locked in.

## Non-goals / guardrails

- Do not rely on fragile implicit browser behavior for focus restoration if an explicit implementation is warranted.
- Do not trade accessibility gains for visual regressions without correcting the visual design properly.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes
- `pnpm typecheck` passes
- keyboard/focus Playwright coverage passes
- spot-check confirms no critical control remains undersized or visually focus-invisible

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
