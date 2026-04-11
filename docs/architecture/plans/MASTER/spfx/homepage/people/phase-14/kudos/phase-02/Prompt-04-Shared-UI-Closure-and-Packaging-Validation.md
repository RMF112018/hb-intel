# Prompt 04 — Shared UI Closure and Packaging Validation

You are working in the live repo at:
`https://github.com/RMF112018/hb-intel`

Branch: `main`

Treat live repo truth as authoritative.

## Objective

Close the HB Kudos implementation visually and structurally so it reads as a premium, host-fit, production-grade SharePoint homepage product, then prove the built package is current.

## Governing files

- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Decision-Lock-Appendix.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Plan-Summary.md`
- `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/Prompt-06-Validation-Packaging-and-Closure.md`
- current `docs/reference/ui-kit/` doctrine

## Primary files in scope

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/shared/KudosDetailPanelContent.tsx`
- `apps/hb-webparts/src/homepage/data/useKudosComposer.ts`
- relevant `@hbc/ui-kit/homepage` shared primitives and exports
- `apps/hb-webparts/config/package-solution.json`
- any package/build registration files actually in repo truth

## Audit findings this prompt must address

1. The employee webpart is too vertically stretched and too narrow for the host surface.
2. The Give Kudos flyout is too long and operationally clumsy for a homepage-hosted recognition action.
3. The companion surface lacks density, authority, and premium governance fit.
4. Repeated recognition/governance UI patterns remain local when they should be shared.
5. Legacy kudos page/workspace remnants weaken closure confidence.

## Required outcomes

### A. Promote repeated patterns into shared homepage-safe primitives

Evaluate and promote, where appropriate:
- recognition archive card/list patterns
- governance queue row shell
- governance toolbar / preset strip
- workflow / aging / ownership chips
- inline governance action bar
- audit timeline block
- governance detail sections

Do not leave these as repeated local premium patterns if they are reused or clearly reusable.

### B. Refit the employee HB Kudos surface for the actual host

The resulting webpart must feel correct in the SharePoint homepage section without requiring a browser zoom hack.

Address:
- width usage
- vertical burden
- hierarchy
- archive density
- action placement
- flyout usability
- footer/floating-action overlap risks

### C. Refit the companion surface

Make the companion read as a premium governance workspace rather than a generic pill-filter page.

Address:
- density
- queue information quality
- action affordance clarity
- empty-state quality
- host-fit and section-fit
- visual authority

### D. Accessibility cleanup

Validate and improve at minimum:
- focus visibility
- tab semantics
- flyout/dialog affordances
- keyboard navigation
- control labeling
- reduced-motion safety if applicable

### E. Legacy-remnant decision

Audit the legacy `kudosPage` surfaces.

Make a deliberate repo-truth decision:
- fully rehome and wire them into the final architecture, or
- remove/quarantine them so they no longer weaken closure confidence

### F. Final packaging and freshness proof

Rebuild the relevant package(s) and prove:
- manifests are correct
- registrations are correct
- the final `.sppkg` reflects current source
- no stale contents remain

## Implementation rules

- Preserve `@hbc/ui-kit/homepage` as the primary entry point for homepage webparts.
- Do not backslide into prohibited entry points.
- Do not use local inline styling for reusable premium patterns that should now be shared.
- Do not re-read files that are still within your current context or memory unless a detail is genuinely uncertain.

## Deliverables

Return:

1. changed-file summary
2. shared-primitive promotion summary
3. employee-surface UI closure summary
4. companion-surface UI closure summary
5. accessibility validation summary
6. legacy-remnant decision summary
7. package/build result
8. freshness proof for the final `.sppkg`
9. remaining issues, if any
10. final closure recommendation

## Important rules

- Do not claim closure if the webpart still effectively requires zooming out just to feel viewable in its host context.
- Do not claim closure if repeated recognition/governance patterns are still duplicated locally without a good reason.
- Do not claim closure if the final package proof is weak or stale-risk remains unresolved.
