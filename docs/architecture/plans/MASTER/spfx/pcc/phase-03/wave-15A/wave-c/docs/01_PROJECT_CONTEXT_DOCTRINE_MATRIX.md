# 01 — Project Context Doctrine Matrix

## Governing doctrine sources

| Source | Wave C relevance |
|---|---|
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md` | Base SPFx host-safety, accessibility, styling, and runtime expectations. |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md` | Binding overlay for PCC-style command-center surfaces. |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md` | 56-point scoring model and hard-stop rules. |
| `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md` | Benchmark rigor adapted to PCC as a non-homepage full-page app. |
| `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md` | Checklist discipline adapted to app-local shell/surface context. |
| `docs/reference/ui-kit/standards/` | Tokens, state model, breakpoint/container fit, SPFx surface quality. |
| `docs/reference/ui-kit/patterns/` | Command-center, bento, widget, and state patterns. |

## PCC-specific adaptation

Wave C applies homepage scorecard rigor without applying homepage-only composition rules. PCC is a non-homepage SharePoint-hosted full-page command-center surface, so the relevant evaluation is:

- host-safe app-local shell;
- clear project identity;
- command-center hierarchy;
- stable bento/card contract;
- source confidence and state clarity;
- accessible navigation and heading path;
- reliable behavior in SharePoint constrained containers.

## Doctrine obligations mapped to Wave C

| Obligation | Wave C interpretation | Required proof |
|---|---|---|
| Strong productized surface identity | Every surface must read as a control surface for the selected project, not a generic module. | Screenshots for all eight surfaces showing project + surface identity. |
| Command-center hierarchy | Shell header, surface context header, and card titles must not compete. | Visual scan review plus DOM/heading test where practical. |
| State model completeness | Surface headers must expose live/reference/loading/error/unavailable/degraded posture when applicable. | Tests covering at least preview/reference, loading, error, unavailable. |
| Data/contract seam rigor | Header cannot imply live source confidence when repo truth only has fixture/reference data. | Source status matrix and test assertions. |
| Accessibility and keyboard quality | Surface context must be screen-reader coherent; no hover-only critical meaning. | RTL tests plus optional axe/manual keyboard notes. |
| Breakpoint/container-fit quality | Context header must remain useful in wide, constrained SharePoint, tablet, and phone/narrow modes. | Screenshot matrix. |
| Evidence-backed closure | No “looks good” closeout. | Scorecard impact sheet, screenshots, command output, residual risks. |

## Hard stops for this wave

The local agent must stop or escalate if any of the following is discovered:

1. The existing shared surface header primitive is missing or non-rendering across any routed surface.
2. A routed surface lacks a stable active-panel marker.
3. A surface shows project context that conflicts with shell project context.
4. A header claims live/fresh/available source data that the read model does not expose.
5. A fix requires backend/API expansion.
6. A change requires replacing Wave B shell/nav architecture.
7. Accessibility testing reveals broken keyboard navigation or duplicate `h1`/landmark misuse that cannot be safely fixed within Wave C.

## Scorecard categories improved by Wave C

Wave C can materially improve:

- purpose-fit sophistication and persona expression;
- surface composition and hierarchy;
- state-model completeness;
- contract/data seam clarity;
- breakpoint and shell-fit quality;
- accessibility and keyboard behavior;
- validation and closure proof;
- product confidence / executive polish.

Wave C does not fully close:

- tenant-hosted runtime proof;
- full `56/56`;
- later surface-level workbench redesign;
- backend data freshness;
- live integration credibility.
