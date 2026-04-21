# Project Portfolio Spotlight Audit Summary

## Objective

Conduct a fresh, repo-truth UI/UX audit of the live `main` implementation of the Project Portfolio Spotlight and determine what is required to move it from “technically premium-styled and structurally thoughtful” to a genuinely flagship SharePoint homepage surface.

## Evidence basis

This audit was grounded in:

- the live `main` branch implementation under `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/`
- the shared surface family under `packages/ui-kit/src/HbcProjectSpotlightSurface/`
- the homepage shell preset and zone seams under `apps/hb-webparts/src/webparts/hbHomepage/`
- the governing doctrine under:
  - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
  - `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
  - `docs/reference/ui-kit/homepage-webpart-benchmark.md`
- the user-provided runtime screenshots at:
  - 2560x1440
  - 1920x1080
  - 1512x982 retina
  - 1024x1366
  - 430x932
  - 390x844
- the attached audit checklist and scorecard

## Bottom line

The current Spotlight is **not near benchmark-grade**.

The implementation has several genuinely strong foundations:

- thin SPFx consumer boundary
- clear data / normalization / presentation split
- container-aware layout mode contract
- explicit details and history disclosures
- authoring-safe loading / empty / error states
- a real attempt at premium editorial composition

But the hosted runtime still misses the real objective. In the screenshots, the module is dominated by a large missing-image slab, the featured story starts too low in the viewport, first-view value is weak, and the surface reads more like a carefully styled container than a decisive homepage flagship.

## Audit score

| Category | Score (0-4) | Notes |
|---|---:|---|
| Doctrine and host compliance | 2 | Host-safe and thin-shell, but the hosted result still violates the anti-empty-slab / first-view-value standard. |
| UI-kit / premium-stack compliance | 2 | Good use of `motion`, `lucide-react`, and a shared surface family, but important overlay/panel and separator work is still largely hand-rolled. |
| Token and styling discipline | 1 | The Spotlight CSS is saturated with raw hex / rgba / px values instead of a governed token bridge. |
| Purpose-fit sophistication and persona expression | 1 | The intended “featured portfolio story” is not communicated quickly enough in the hosted runtime. |
| Surface composition and hierarchy | 1 | The missing-image state becomes the dominant visual object and buries the actual story. |
| Homepage integration quality | 2 | The shell pairing is directionally right, but Spotlight visually outweighs the row without delivering equivalent first-view value. |
| Breakpoint and shell-fit quality | 2 | The mode system is real, but the runtime still overcommits vertical space and compresses too passively under constraint. |
| Interaction completeness | 2 | The disclosures are accessible, but the first-view task path is still under-authored and the featured CTA is too fragile. |
| State-model completeness | 3 | Loading / empty / error handling is credible and author-safe. |
| Contract, data, and backend seam rigor | 3 | Typed list mapping, publish-window gating, caching, and normalization are all solid. |
| Identity, media, and attribution quality | 1 | Media reliability and missing-media posture are the largest visible failure in the runtime. |
| Accessibility and keyboard behavior | 3 | Stronger than average: explicit buttons, focus outlines, `hidden`, reduced-motion handling, dialog semantics. |
| Host-runtime resilience | 2 | The hosted result still underperforms materially versus its own authored intent. |
| Validation and closure proof | 2 | Stories and documentation exist, but the real runtime still shows unresolved visual and product-quality gaps. |

**Total: 27 / 56**

## Acceptance readout

- Minimum professional acceptance: **not met**
- Homepage-grade acceptance (40+/56): **not met**
- Flagship / benchmark-grade acceptance (48+/56): **not remotely met**

## Most important strengths to preserve

1. **Thin ownership boundary.** The webpart is not a logic sink.
2. **Container-aware mode contract.** The architecture at least acknowledges SharePoint slot reality.
3. **Explicit disclosure model.** Details and history are not hover-gated.
4. **Local-vs-shared seam discipline.** Data and view-model shaping remain local; presentation lives in the UI surface family.
5. **Authoring-safe state handling.** Missing-data scenarios do not explode the runtime.

## Most important failures

1. **The hosted first view is dominated by a missing-image billboard.**
2. **The featured story begins too low in the viewport on desktop and tablet.**
3. **The surface still feels over-furnished in height and under-furnished in value.**
4. **The current missing-media state is not selective or editorial; it is just empty.**
5. **The styling system is not doctrine-clean enough for a flagship benchmark surface.**

## Recommended implementation order

1. Prove and close the featured-media truth seam.
2. Rebuild the missing-media posture and first-view hierarchy so the featured story survives when media is absent.
3. Rework wide / medium / compact / minimal footprints so the surface becomes meaningfully more selective under constraint.
4. Tighten CTA hierarchy and subordinate the history rail.
5. Replace raw styling literals with governed tokens / local surface tokens and close with hosted proof.
