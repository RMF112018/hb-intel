# 03 — Prompt: Footer Safe-Zone and Host-Control Clearance Remediation

You are working in the live repo at:

- `https://github.com/RMF112018/hb-intel.git`

## Objective

Correct the HB Kudos flyout footer and lower safe-area behavior so the persistent SharePoint assistant button in the lower-right corner is fully accommodated.

## Critical host-environment rule

The SharePoint assistant button is a permanent host control.

You must **not**:
- hide it
- move it
- disable it
- clip it
- out-z-index it
- rely on it being absent during validation

The UI must adapt to it.

## Mandatory code scope

Audit and remediate at minimum:

- `packages/ui-kit/src/HbcKudosComposer/index.tsx`
- `packages/ui-kit/src/HbcKudosComposer/kudos-composer.module.css`
- any related shared footer/safe-area logic
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` only if minor composition tuning remains necessary after the shared fix

## Required outcomes

The footer system must:

- reserve permanent lower-right clearance for the SharePoint assistant button
- keep primary and secondary actions fully visible
- keep actions comfortably clickable
- avoid visual crowding against the host control
- maintain proper spacing at 100% browser zoom
- preserve stable internal scrolling
- preserve visual balance across desktop SharePoint-hosted runtime

## Required implementation direction

1. Audit current footer padding and bottom inset logic.
2. Distinguish clearly between:
   - device safe-area inset handling
   - host-control clearance handling
3. Implement a durable shared clearance strategy that accounts for immutable SharePoint host controls in the lower-right viewport area.
4. Ensure the scrollable body and sticky/footer action zone cooperate correctly with that clearance.
5. Validate with the host control visible.

## Validation standard

You must prove:

- no footer action is partially obscured
- no footer action is uncomfortably close to the assistant button
- no action label, icon, focus ring, or click target is compromised
- the footer still looks intentional rather than padded arbitrarily
- the adjustment works at 100% zoom in SharePoint-hosted runtime

## Explicit prohibition

Do not treat `env(safe-area-inset-bottom)` alone as sufficient proof of resolution.
The problem includes persistent SharePoint host UI, not just device inset behavior.

## Deliverables

Provide:
- exact files changed
- exact shared seam that now owns host-control clearance
- before/after reasoning
- any remaining local composition follow-up needed
