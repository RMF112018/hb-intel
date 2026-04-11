# HB Kudos — Repo-Truth Forceful Remediation Package

This package is grounded in a direct audit of the live repo source code in `RMF112018/hb-intel` plus the rendered screenshots already provided.

## Scope audited
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcKudosComposer/kudos-composer.module.css`
- `packages/ui-kit/src/HbcPeopleCultureSurface/index.tsx`
- `packages/ui-kit/src/HbcPeopleCultureSurface/people-culture-surface.module.css`

## What the audit proved
1. The current implementation is still explicitly locked to the current boundary and currently argues against splitting/replacing it inside `HbKudos.tsx` comments and structure.
2. The composer is configured in typed mode, but the actual people-search pipeline is a custom adapter that can silently fail and always degrade to an empty result list.
3. The people-search adapter uses raw `fetch()` against `ClientPeoplePickerSearchUser`, swallows all errors, and returns `[]` on every failure path.
4. The UI kit does contain chip/token behavior, but the user experience still depends entirely on the search adapter successfully resolving identities.
5. The homepage featured card is styled as an on-dark experience while the homepage variant card background is a very light frosted-glass treatment. That contrast mismatch is a primary reason the card reads as hollow in the live render.
6. The current codebase contains too much narrative defending the current structure and not enough hard proof that the product outcome is actually working in-host.

## Package contents
- `Audit-Summary.md`
- `Root-Cause-Matrix.md`
- `Prompt-01-Decisive-Remediation.md`
- `Prompt-02-Closure-Validation.md`

## Operating posture for the agent
The agent is not being asked to preserve the current abstraction. It is being instructed to resolve the failures. If the current boundary blocks closure, it must be changed.
