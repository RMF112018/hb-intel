# 01 — Grid/Card Doctrine Matrix

## Objective

Translate governing UI doctrine and SPFx surface audit criteria into Wave D implementation requirements.

## Governing Sources to Re-Inspect Locally

- `docs/reference/ui-kit/doctrine/README.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`
- `docs/reference/ui-kit/GOVERNANCE-MAP.md`
- `docs/reference/ui-kit/GOVERNANCE-SUPERSESSION.md`
- `docs/reference/ui-kit/AGENT-USAGE-GUIDE.md`
- `docs/reference/ui-kit/standards/SPFx-Surface-Quality-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-State-Model-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Host-Runtime-Validation-Standard.md`
- `docs/reference/ui-kit/standards/SPFx-Breakpoint-and-Container-Fit-Standard.md`
- `docs/reference/ui-kit/patterns/SPFx-Widget-and-Bento-Layout-Patterns.md`
- `docs/reference/ui-kit/patterns/SPFx-Command-Center-Dashboard-Patterns.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-evidence.md`

## PCC Adaptation of Homepage/SPFx Criteria

| Homepage / SPFx criterion | PCC Wave D adaptation | Implementation implication |
| --- | --- | --- |
| Full-page SPFx surface must respect host chrome | PCC canvas must fit within SharePoint page chrome without relying on local dev viewport assumptions | Validate desktop, constrained SharePoint, tablet, narrow modes. |
| Surface should communicate clear product purpose | Each active route must start with a Tier 1 command/context card | Header/context cards remain full-width and visually dominant. |
| Dashboard composition should guide scan path | PCC cards must not be equal-weight peer blocks | Add tier/region semantics and surface-level layout patterns. |
| Widgets/cards should dock to the grid without wrapper failures | Direct children of `PccBentoGrid` must remain cards or approved layout primitives | Preserve direct-child invariant or introduce a shared primitive that owns that invariant. |
| Responsive behavior must be container-based | Breakpoints must follow container width, not just viewport media queries | Keep/use `useContainerBreakpoint`; add tests for shell/host constraints. |
| Empty/blocked states must remain useful | Degraded states should reserve product context and not produce dead canvas | Blocked/unavailable patterns must include Tier 1 context + useful next steps. |
| Accessibility is part of doctrine readiness | Heading order, landmarks, disabled controls, keyboard navigation must be testable | Add card tier heading contract and keyboard/screen-reader evidence plan. |

## Wave D Acceptance Requirements

### Layout / Grid Composition

- `PccBentoGrid` must expose stable data markers for mode, columns, gap, and safety posture.
- Card spans must be deterministic from the footprint/tier contract.
- Dense packing must remain prohibited unless doctrine is updated to allow it.
- Cards must not collapse below usable minimum inline size in non-phone modes.
- Row-span calculation must avoid tenant-host feedback loops.

### Card Hierarchy and Density

- Tier 1 cards establish active surface purpose and command/context posture.
- Tier 2 cards carry operational queues, summaries, lanes, and actionable-but-currently-inert workflows.
- Tier 3 cards carry reference, policy, source health, deferred seams, and support detail.
- A card’s visual weight must follow tier first, footprint second.
- Density must be intentional: compact for reference/metric clusters, comfortable for command/operational content.

### Responsive / Host Fit

- Wide desktop must use available canvas without dead margins.
- Simulated SharePoint constrained width must not create unreadable narrow cards.
- Tablet must maintain readable card sequence and priority.
- Phone/narrow mode must collapse into a single-column narrative sequence.
- Team & Access must be explicitly validated because it has prior narrow-column failure evidence.

### Accessibility

- Tier 1 card heading should normally be `h2` inside the route context unless the shell already owns `h1`/`h2` semantics.
- Tier 2/3 headings should follow a stable hierarchy; do not hardcode every card as `h3` if that creates invalid nesting.
- Disabled affordances must include reasons via `aria-describedby` or the established `PccDisabledAffordance` helper.
- Screenshot evidence is not an accessibility substitute.

## Scorecard Impact Boundaries

Wave D can improve layout, density, scan path, responsive behavior, shell interaction, and perceived product confidence. It cannot close final readiness, live integration, tenant validation, full accessibility, or surface-specific business-flow gaps by itself.
