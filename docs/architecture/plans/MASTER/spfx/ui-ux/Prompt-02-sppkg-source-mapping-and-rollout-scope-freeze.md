# Prompt 02 — Sppkg Source Mapping And Rollout Scope Freeze

## Objective

Verify the exact source applications, build paths, and packaging flow for the three target SharePoint packages before any suite-wide rollout work proceeds.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `dist/sppkg/`
- `packages/spfx/`
- `apps/accounting/`
- `apps/estimating/`
- `apps/admin/`
- `apps/project-hub/`
- `package.json`
- `pnpm-workspace.yaml`

## Instructions

1. Verify which source applications and packaging scripts actually produce:
   - `dist/sppkg/hb-intel-accounting.sppkg`
   - `dist/sppkg/hb-intel-project-setup.sppkg`
   - `dist/sppkg/hb-intel-project-sites.sppkg`
2. Do not assume package-to-app mapping from names alone.
3. Identify the exact build/package commands, entry points, and SPFx manifests involved.
4. Confirm whether additional packages or wrappers participate in producing each `.sppkg`.
5. Freeze rollout scope in a short package-provenance report that later prompts can cite.
6. If any target artifact lacks a clean repo-truth mapping, stop and document the gap before implementation spreads.

## Deliverables

- a package provenance report
- an authoritative mapping table from `.sppkg` artifact to source app / entrypoint / build script / SPFx manifest
- a rollout-scope freeze note for later prompts

## Acceptance criteria

- every target `.sppkg` has a verified provenance chain or an explicitly documented unresolved gap
- no later rollout prompt would need to guess which source app it should change
- package commands and entrypoints are explicit and reproducible

## Guardrails

- Treat `docs/architecture/blueprint/current-state-map.md` as the governing reference for present-state disagreements.
- Do not create a parallel design system outside `@hbc/ui-kit`.
- Do not flatten valid domain-specific workflow behavior just to make screenshots look more similar.
- Be explicit when something is a confirmed repo fact versus an inference.
- Prefer updating authoritative docs and existing package surfaces over introducing duplicate layers.
- Treat SPFx host limitations honestly rather than forcing false parity with non-SPFx surfaces.

## Completion note

When you finish, summarize:
- what you verified from repo truth
- what you changed
- what you intentionally left unchanged
- any residual risk or follow-up prompt dependencies
