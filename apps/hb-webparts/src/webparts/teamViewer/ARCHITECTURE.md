# TeamViewer — Phase 01 / Prompt 01 Architecture Notes

## Summary

`teamViewer` is a standalone homepage webpart that presents article-linked
team members. It learns from HB Kudos seam discipline (runtime contract,
photo hydration, host-safe layout, hook-driven orchestration) but takes
zero direct dependency on Kudos domain contracts, workflows, or surfaces.

## Seam map

| Concern | Location | Notes |
|---|---|---|
| Runtime id / anti-drift | `teamViewerRuntimeContract.ts` | Mirrored by manifest + mount. |
| Contracts (person, binding, groups, flags, config) | `teamViewerContracts.ts` | Normalized shapes for renderer. |
| Config resolution + flag defaults | `teamViewerConfig.ts` | `profileDetailDrawer` defaults `false`. |
| Article binding | `hooks/useTeamViewerArticleBinding.ts` | property → destination-key → host-context. |
| Data loader | `hooks/useTeamViewerData.ts` | Stub; Prompt 02 lands SP reads. |
| Photo hydration | `hooks/useTeamViewerPhotoHydration.ts` | Generic over `TeamViewerPerson`. |
| Host-safe layout | `hooks/useTeamViewerHostSafeLayout.ts` | Local; promote to shared when 2nd consumer appears. |
| Selectors (sort/group/density) | `display/teamViewerSelectors.ts` | Pure; unit-testable. |
| Composition | `components/TeamViewerSurface.tsx` + cards/drawer/states | `@hbc/ui-kit/homepage` primitives only. |

## Extraction vs. local decisions

- **Local:** photo hydration, host-safe layout, runtime contract, surface
  primitives. Premature generalization avoided — these are candidates
  for a shared `homepage/shared/*` module once a second consumer proves
  reuse.
- **Reused from ui-kit:** `HbcEmptyState`, `HbcSpinner`, lucide icons,
  `createGraphPersonPhotoFn` via `@hbc/ui-kit/homepage`.
- **Not created:** a TeamViewer surface family (tokens/variants). Single
  consumer today; defer until grammar repeats.

## Anti-coupling

TeamViewer does not import from:

- `../hbKudos/`
- `../hbKudosCompanion/`
- `homepage/shared/KudosGovernancePrimitives*`
- Kudos contracts, composer, celebrate, archive, feed, governance.

Stable selectors:

- `data-hbc-webpart="team-viewer"`
- `data-hbc-testid="team-viewer-public-root"`

## Article binding (locked answers)

1. **Resolution order:** `articleId` property (direct-binding) →
   `destinationKey` property (property) → host site/page context
   (host-context). Host-context resolution is declared in Prompt 01; the
   real `HB Article Destination Pages` list read lands in Prompt 02.
2. **Keying:** hybrid. A direct `articleId` short-circuits; otherwise
   resolve via destination-page row.
3. **Bio/resume fields:** `bio`, `resumeRichText`, `resumeDocumentUrl`
   on `HB Article Team Members`. Schema gap flagged: if these columns
   don't exist on the live list, Prompt 02 must add them.
4. **Feature flag posture:** `profileDetailDrawer` default `false`. The
   drawer is a real component; the orchestrator renders it only when
   the flag is true. Disabled-state proof: card has no interactive
   affordance (renders as `<article>`, not `<button>`); drawer DOM
   absent.

## Next files for Prompt 02

- `../../homepage/data/articleTeamMembersListSource.ts` (new)
- `../../homepage/data/articleDestinationPagesListSource.ts` (new)
- Expand `hooks/useTeamViewerData.ts` to consume the new sources.
- Harness fixtures for: empty, partial-identity, no-photo, no-title,
  large, unresolved-binding, resolved-binding, drawer-enabled,
  drawer-disabled.
