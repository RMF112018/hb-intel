# 02 — Prompt: Shared Flyout Host-Aware Overlay Remediation

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct the shared hosted overlay strategy used by HB Kudos so the Give Kudos flyout behaves correctly inside SharePoint-hosted runtime.

## Critical decision lock

The fix must be made in the shared flyout / sheet infrastructure, not by a one-off local patch in the HB Kudos webpart.

## Mandatory code audit and remediation scope

At minimum inspect and update all relevant code in:

- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcKudosComposer/kudos-composer.module.css`
- any shared overlay / portal / sheet utilities used by that path
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/mount.tsx`

## Required outcomes

You must correct the shared flyout so that:

- the flyout header is fully visible in SharePoint-hosted runtime
- the flyout does not render beneath SharePoint site chrome
- panel top origin assumptions are host-aware
- panel height is host-aware
- internal scroll behavior is stable and predictable
- body scroll lock does not create host-runtime side effects
- the implementation remains reusable and ownership-correct

## Required implementation direction

1. Audit the current flyout positioning strategy.
2. Determine whether the current sheet must:
   - remain fixed but become host-offset-aware, or
   - move to a more appropriate portal/container strategy for SharePoint hosting.
3. Implement the strongest shared solution.
4. Do not patch this only in `HbKudos.tsx`.

## Explicit prohibitions

Do not:
- add a one-off margin-top in local Kudos code and call it complete
- solve the issue only with a z-index escalation
- assume full browser viewport ownership without regard to SharePoint chrome
- regress the existing mobile/desktop sheet behavior without proving the replacement is better

## Deliverables

After implementation, provide:

- concise change summary
- ownership summary
- files changed
- proof that the shared sheet now supports SharePoint-hosted rendering correctly
- known follow-on items for the footer safe-zone workstream
