# Prompt 04 — Public PriorityActionsRail Webpart Refactor

## Objective
Refactor or complete the public `PriorityActionsRail` webpart so it consumes the canonical read model and shared surface family, and behaves as the governed homepage command band specified in the carried-forward spec.

## Current-state repo-truth
- `PriorityActionsRail` already exists as a homepage webpart target and already has a dedicated proof-case mount seam.
- The homepage entry stack doctrine explicitly says quick links must become a prioritized actions system directly beneath the flagship hero and above the first shell lane.
- The public rail is therefore not a net-new conceptual surface, but its implementation must be upgraded to spec, doctrine, and benchmark expectations.

## Relevant SharePoint list-schema truth
The public rail must render from:
- one resolved active config row from `Priority Actions Band Config`
- enabled, normalized item rows from `Priority Actions Band Items`

Runtime behavior must respect:
- breakpoint visible-count caps
- layout-mode fields
- badge/global display controls
- external-link behavior
- item-level device gates
- audience and schedule gates
- overflow treatment

## Why the current implementation is insufficient
Even though the public webpart already exists, it is insufficient until it:
- reads from the documented canonical list model through explicit seams
- renders through the shared promoted surface family
- supports doctrine-grade loading/empty/error/partial states
- resolves overflow and breakpoint behavior deliberately
- behaves credibly in SharePoint-hosted, edit-mode-safe, constrained-width conditions

## Relevant governing doctrine / benchmark authorities
- homepage overlay: quick links must become prioritized actions, visible actions must be capped by breakpoint, and the command band must sit in the identity → action → value sequence
- governing standard: explicit application-level breakpoint behavior and reflow safety are binding
- benchmark package: utility surfaces must remain operational/compact/efficient and still reach benchmark-grade maturity

## Exact files, seams, symbols, patterns, and schema docs to inspect
Inspect:
- `apps/hb-webparts/src/webparts/priorityActionsRail/`
- `apps/hb-webparts/src/mount-priority-actions-rail-proof-case.tsx`
- `apps/hb-webparts/src/mount.tsx`
- outputs from Prompt 01, 02, and 03
- homepage helper/model seams already used by the existing rail
- the carried-forward spec and doctrine docs

Target files expected by the spec:
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRailWebPart.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.manifest.json`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.module.scss` or equivalent style seam

## Required implementation outcome
Deliver a public homepage command band that:
- consumes the normalized Priority Actions read model
- renders visible primary actions plus governed overflow actions
- supports optional heading, badge visibility, external-link indication, and sticky-after-hero compact mode if enabled
- remains compact, utility-first, and visibly non-generic
- behaves credibly across desktop, laptop, tablet, portrait tablet, and phone states
- is author-safe in loading/empty/partial/error situations

## What done really looks like
- The rail feels like a productized HB command band, not Quick Links with better CSS.
- It does not compete with the hero or bury the first shell lane.
- Desktop/laptop show a compact rail; portrait/tablet/phone degrade cleanly into governed compact modes.
- Overflow is explicit and polished.
- Keyboard navigation, focus, and reduced-motion behavior are complete.
- Public error states do not expose raw exceptions.
- The proof-case mount renders the upgraded webpart cleanly.

## Proof of closure required
- Public webpart compiles and mounts through existing seams
- proof-case mount demonstrates the upgraded rail
- screenshots or local proof captures show all major breakpoint modes
- state proofs exist for loading, empty, partial, error, and success
- keyboard/focus behavior is validated
- reduced-motion path is validated

## Constraints / prohibited shortcuts
- Do not leave render logic coupled directly to SharePoint transport rows.
- Do not solve responsiveness with accidental shrinkage or tiny horizontal micro-cards.
- Do not expose critical semantics only in tooltips or hover states.
- Do not regress manifest adjacency or packaged runtime behavior.
- Do not copy HB Kudos panel structures or emotional tone.

## Instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
