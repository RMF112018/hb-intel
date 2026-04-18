# Plan Summary — Wave 01 Enhanced

## Goal

Preserve the strong underlying list / contract / normalization / write architecture already present in `main`, while decisively closing the remaining product-layer, interaction, responsive, validation, and proof gaps that still block truthful end-state closure.

## What “done” means for this wave

This wave is complete only when all of the following are true:

- admin item identity is durable across add, reorder, archive, edit, save, and discard flows
- reorder and archive semantics are coherent and provable
- validation breadth matches the declared contract surface and blocks invalid authored states
- the shared `HbcPriorityRail` family behaves like a real command-band system, not a premiumized list strip
- the public rail and admin preview honestly honor the authored config model across breakpoint/device variants
- the admin surface clearly communicates editable vs read-only vs insufficient-permission states
- token discipline is restored across the shared surface and admin surface
- hosted validation evidence exists and the closure docs are refreshed to match real post-fix truth

## In scope

- Priority Actions command-band public webpart
- Priority Actions admin webpart
- Priority Actions contracts, normalization, validation, state, and write seams
- `@hbc/ui-kit` Priority Rail shared surface family
- responsive/runtime alignment required to honor the existing authored contract
- token cleanup required for doctrine-compliant closure
- hosted proof and closure-document refresh

## Out of scope

- unrelated homepage zones
- unrelated shell-extension redesign
- speculative future homepage editor work
- unrelated SharePoint list architecture

## Prompt order

1. repair authoring identity / lifecycle / reorder trust
2. harden contracts / validation / write integrity
3. rebuild shared command-band surface family
4. align public runtime and preview with responsive behavior
5. complete the permission-aware admin authoring product
6. finish token discipline, hosted validation, and closure proof
