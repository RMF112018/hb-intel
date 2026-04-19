# Prompt 03 — Rebase Shell Measurement on Authoritative Usable Width

## Objective
Refactor the shell measurement model so entry-state resolution, slot-comfort logic, and shell conformance derive from authoritative usable width rather than from self-referential shell-element geometry.

## Why this work exists
`useShellContainer.ts` is one of the most important remaining closure seams.

Right now the shell measures the shell element itself and uses that width to drive:
- `resolveEntryStateWithReason(...)`
- band pairing vs stacking
- shell conformance data
- short-height posture

That is too dependent on how the shell root itself is sized and padded. In a host-aware SharePoint shell, measurement must flow from the declared fit contract, not from whichever element is easiest to observe.

## Governing authority
You must follow:
- `apps/hb-webparts/src/webparts/hbHomepage/shell/useShellContainer.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellConformance.ts`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

## Current weakness in nuanced terms
The current shell is not ignorant of container width. It is using container width.

The problem is that the width truth is still too self-contained and not clearly anchored to the shared outer fit contract plus intentional usable-width accounting.

That means a technically coherent shell can still be wrong about real host-fit posture.

## Intended future state
After this prompt is complete:
- authoritative width source is explicit
- usable width is intentionally computed
- the shell can explain why a given entry state was chosen
- pairing/stacking is driven by corrected width truth
- conformance reporting remains accurate and inspectable

## What must change
1. Rework the measurement seam so it is based on the right authority.
2. If insets reduce usable width, account for them intentionally.
3. Ensure `resolveBandLayout(...)` receives corrected width truth.
4. Preserve the breakpoint model unless repo-truth correction is required.
5. Preserve first-lane and conformance seams, but feed them better inputs.

## Done means
Done means:
- the code agent can name the exact authoritative width input
- usable width after insets is no longer accidental
- threshold behavior is stable and explainable
- shell diagnostics reflect the new truth

## Prohibitions
- Do not redesign shell orchestration.
- Do not move fit responsibility into child surfaces.
- Do not keep the old shell-self-measurement model as the silent real authority.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Proof of closure
Your implementation report must include:
1. the new authoritative measurement source
2. the usable-width computation rule
3. threshold validation around key entry-state edges
4. explanation of why the old model was insufficient
5. exact tests added or updated
