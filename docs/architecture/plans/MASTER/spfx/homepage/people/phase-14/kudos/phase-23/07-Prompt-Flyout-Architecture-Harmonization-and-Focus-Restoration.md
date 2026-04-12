# Prompt 07 — Flyout Architecture Harmonization and Focus Restoration
## Context
Work against the live repository:

- `https://github.com/RMF112018/hb-intel.git`
This prompt is part of the HB Kudos major-findings remediation package. Treat the accompanying audit report as the governing summary of the issue being corrected.
Do not re-read files that are already in your current context window or active memory unless necessary for post-edit validation.
Preserve the split-runtime boundary between the public Kudos runtime and the companion runtime.

## Objective

The shared flyout shell is reused, but surrounding behavior is still not harmonized enough across composer, feed, article reader, and companion detail experiences. Normalize that architecture and interaction contract.

## Primary files / areas to inspect

- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFlyoutBody.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

## Required work

1. Define the desired interaction contract for Kudos flyouts: open, close, focus capture, focus restoration, action-zone layout, body layout rhythm, and host-safe behavior.
2. Implement that contract consistently across the public composer, feed panel, article reader, and governance detail experiences.
3. Remove avoidable per-consumer shell drift where it is making the experience inconsistent.
4. Keep shell-level responsibilities in the shell and consumer-level responsibilities in the consumer.
5. Ensure the shared flyout remains usable in hosted SharePoint conditions while still feeling unified across all Kudos surfaces.

## Non-goals / guardrails

- Do not flatten all flyout content into one giant component.
- Do not break hosted safe-zone behavior while harmonizing shell usage.

## Deliverables

- implement the code changes required to resolve this finding
- update or add tests where needed
- add or update focused documentation only where it materially supports long-term governance
- produce a concise change summary identifying what was changed, why, and any remaining risk

## Validation requirements

- `pnpm lint` passes
- `pnpm typecheck` passes
- composer, feed, article, and companion detail flows all pass targeted regression validation
- focus restoration and close behavior are demonstrably consistent across all affected flyouts

## Completion standard

Do not stop at partial improvement. Close the finding completely enough that this area would not be called out again in a fresh repo-truth audit.
