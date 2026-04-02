# Prompt 14 — Package Rebuild Validation And Acceptance Evidence

## Objective

Rebuild the verified target SharePoint packages from the updated sources and produce acceptance evidence that the conformed UI/UX is actually flowing into the deliverable artifacts.

## Mandatory operating instruction

Do **not** re-read files that are still within your active context or memory. Reuse already loaded repo context whenever possible and only open additional files when they are necessary to close uncertainty.

## Required repo-truth inputs

- `dist/sppkg/`
- `package.json`
- `pnpm-workspace.yaml`
- `packages/spfx/`
- `apps/accounting/`
- `apps/estimating/`
- `apps/admin/`
- `apps/project-hub/`

## Instructions

1. Rebuild the verified source applications and target SharePoint packages.
2. Validate that the three target `.sppkg` outputs are produced from the updated, conformed source paths.
3. Capture evidence for:
   - successful build/package execution
   - source-to-artifact traceability
   - major shell/layout/shared-component adoption
   - unresolved warnings or caveats
4. If packaging fails, root-cause and fix within scope or document the blocking gap precisely.
5. Produce a release-readiness style evidence note rather than a vague success claim.

## Deliverables

- build/package execution evidence
- an acceptance note tying source changes to `.sppkg` artifacts
- explicit blockers or caveats if anything remains unresolved

## Acceptance criteria

- each target package is either rebuilt successfully or has a clearly documented blocking cause
- evidence ties the rebuilt artifacts to the conformed source changes
- no unsupported success claims are made
- the output can support a serious review conversation

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
