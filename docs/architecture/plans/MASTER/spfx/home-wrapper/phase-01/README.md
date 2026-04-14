# HB Homepage Plan Package

## Purpose

This package provides a repo-truth-based development plan for introducing a new `hb-homepage` SPFx component that becomes the composed homepage orchestrator for selected `apps/hb-webparts` public homepage surfaces.

The package is structured for sequential execution by a local code agent.

## Package contents

- `Plan-Summary.md` — program-level summary, objectives, scope, architecture posture, sequencing, and closure expectations.
- `Prompt-01-Authority-and-Repo-Truth-Lock.md`
- `Prompt-02-Architecture-and-Surface-Contract.md`
- `Prompt-03-Create-hb-homepage-SPFx-Host.md`
- `Prompt-04-Embed-Phase1-Modules-Pulse-Leadership-Spotlight.md`
- `Prompt-05-Embed-People-Culture.md`
- `Prompt-06-Embed-Kudos.md`
- `Prompt-07-Mount-Packaging-and-Manifest-Integration.md`
- `Prompt-08-Hosted-Vetting-and-Closure.md`

## Governing assumptions

- Live repo: `main` branch of `RMF112018/hb-intel`
- Primary domain under implementation: `apps/hb-webparts`
- New target SPFx component: `hb-homepage`
- `hb-homepage` becomes the composed homepage wrapper for:
  - HB Kudos
  - Leadership Message
  - Project Portfolio Spotlight
  - People & Culture Public
  - Company Pulse
- `hbSignatureHero` remains independent and is not absorbed into `hb-homepage`
- The orchestrator owns layout, spacing, hierarchy, responsiveness, and module composition
- The orchestrator must remain SharePoint-safe and packaging-safe

## Required operating rules for the code agent

1. Work in the live repo only.
2. Treat repo truth as authoritative over prior plans or assumptions.
3. Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
4. Do not perform unrelated refactors.
5. Do not change scope outside the assigned prompt.
6. Before closing each prompt, prove the exact files changed, the architectural outcome achieved, and any remaining follow-on risks.
7. Preserve strict compliance with:
   - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
   - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Recommended execution order

1. Prompt 01
2. Prompt 02
3. Prompt 03
4. Prompt 04
5. Prompt 05
6. Prompt 06
7. Prompt 07
8. Prompt 08

## Important implementation posture

This package is intentionally sequenced so the new `hb-homepage` shell is established before the absorbed modules are elevated to the full HB Kudos benchmark. The reason is simple: the final benchmarking work should happen inside the real orchestrated host environment rather than inside legacy standalone page-placement assumptions.
