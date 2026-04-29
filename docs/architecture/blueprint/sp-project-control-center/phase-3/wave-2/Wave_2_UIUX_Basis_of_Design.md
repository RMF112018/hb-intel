# Wave 2 UI/UX Basis of Design — PCC SPFx Shell Frame

This document binds the visual and experiential direction for the Wave 2 PCC Shell Frame. It governs the implementation prompts that follow Prompt 01.

---

## 1. Authority Stack (Read in This Order)

1. **`docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`** — governing visual-direction asset for Wave 2 (W2-ODR-019).
2. **`docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`** — binding governing standard for any PCC SPFx surface.
3. This document and `Wave_2_Wireframe_and_Layout_Contract.md` — Wave 2-specific layout contract.
4. `@hbc/ui-kit` primitives and tokens — composition source. No new reusable visual primitives are authored in this app (per `.claude/rules/03-package-boundaries.md`).

**Explicitly non-inherited:** `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`. Per W2-ODR-018, PCC does not adopt the homepage paired-row overlay.

## 2. Governing Reference Asset

The dashboard basis-of-design image is the visual anchor. It establishes:

- composition density and breathing space,
- card variety and asymmetric layout cadence,
- hierarchy of primary panels vs supporting strips,
- visual treatment of summary, status, and entry-point regions,
- the premium, authored feel that the shell must reach.

Implementing prompts must work from this asset directly when interpreting layout intent. They must not infer layout from the homepage overlay or from generic enterprise dashboard conventions.

## 3. Inherited Doctrine — SPFx Governing Standard

PCC inherits the binding rules of the SPFx Governing Standard:

- **Host-aware polish.** PCC runs inside a host-controlled SharePoint canvas; the shell respects host chrome and page width while still presenting a premium authored composition.
- **Authoring safety and runtime resilience.** Webpart-level resilience and authoring-tool tolerance are non-negotiable.
- **Breakpoint resilience across the full device matrix.** PCC must compose meaningfully across ultrawide, laptop, tablet, phone, split-screen, and zoom conditions. Breakpoint behavior is derived from real container measurements, not hardcoded viewport assumptions.
- **Premium, non-generic surface.** The PCC shell must avoid the default enterprise card-grid look. Composition is intentional, varied, and authored.
- **Dynamic-yet-stable composition.** The shell flexes responsively without losing structural identity.

## 4. PCC-Specific Visual Principles

- **Bento/masonry-first composition.** PCC uses a controlled flexible bento/masonry layout (W2-ODR-018). Card spans and heights vary intentionally to express hierarchy and to map to surface importance.
- **Authored variety, not uniformity.** Cards differ in span, height, and visual treatment to express information density and surface role. Generic uniform grids and paired-row clones are out of scope.
- **Real container responsiveness.** Span, count, and stacking behavior derive from the rendered container size, not from assumed viewport widths. The shell adapts to host width changes (e.g. SharePoint canvas vs full-bleed).
- **Surface families.** Each MVP surface in `PCC_MVP_SURFACE_IDS` maps to a coherent visual family within the bento, not to a uniform card. Project Home is the densest authored composition; the remaining surfaces follow as authored regions with appropriate weight.
- **Token discipline.** All color, spacing, type, radius, and shadow choices come from `@hbc/ui-kit` tokens. No app-local design tokens are introduced.
- **No new reusable visual primitives in feature scope.** New reusable primitives belong in `@hbc/ui-kit`. The PCC app composes existing `@hbc/ui-kit` primitives into surface-specific assemblies.

## 5. Required State Catalog (W2-ODR-009)

Every consumer-facing region in the shell must visibly support the following states. The implementing prompt must not silently degrade into a single empty state for multiple cases.

| State                | Trigger                                                                                     | Visual contract                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Preview              | Default Wave 2 path with deterministic fixture data.                                        | Authored preview composition mapped to the surface family.                           |
| Empty                | Fixture-permitted absence of data.                                                          | Distinct empty composition with product-safe copy; no developer/sequencing language. |
| Loading              | Async preparation of injected runtime context.                                              | Skeleton composition that preserves the bento footprint without layout shift.        |
| Error                | Recoverable view-model error.                                                               | Honest error state with no fabricated content; retry surface where it is meaningful. |
| Missing-config       | External-system or document-control source not configured.                                  | Display-only configuration prompt; no live API; no secret handling.                  |
| Unavailable-fixture  | A fixture relevant to the surface is absent for the current project profile.                | Distinct from generic empty; signals fixture coverage gap, not user error.           |
| Unauthorized-persona | Persona/capability metadata indicates the surface is hidden for the active display persona. | Display-only gating; never claims authoritative authorization (W2-ODR-008).          |

## 6. Accessibility Posture

- Shell composition meets baseline keyboard and focus-order expectations consistent with `@hbc/ui-kit`.
- Generated image labels (where used for fixture imagery) are fallback a11y labels, named and treated as such — never editorial alt text.
- State changes (loading→preview, preview→empty) preserve focus where reasonable and avoid unannounced layout collapse.

## 7. Data Posture

- Sole data source: `PCC_FIXTURES` aggregate from `@hbc/models/pcc` (W2-ODR-007).
- Optional injected runtime context permitted only as non-live display input.
- No live Graph, PnP, Procore, REST, or tenant calls in Wave 2.

## 8. Out of Scope for Wave 2 UI/UX

- Inheriting the homepage paired-row overlay (W2-ODR-018).
- Live workflow operations, approval execution, access provisioning, repair execution, or Site Health scanning (W2-ODR-012, W2-ODR-014, W2-ODR-015, W2-ODR-016).
- Cross-tenant or cross-site authoring affordances.
- New reusable visual primitives outside `@hbc/ui-kit`.
- Document-management workflow inside the Document Control surface (W2-ODR-013).

## 9. Closeout Posture for Prompt 01

This document is added under `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/` only. No code, manifests, or other repo state is changed.
