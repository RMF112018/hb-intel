# Spotlight Gap Register

## Gap 01 — No explicit layout-mode contract
**Severity:** Critical  
**Type:** Structural redesign  
**Why it matters:**  
The target state requires explicit behavior by usable-space mode. The current implementation has only CSS breakpoints and no formal content-visibility contract.

**Evidence**
- no mode enum / state / resolver in the surface
- CSS is breakpoint-based only
- stories validate width wrappers, not actual mode behavior

**Required correction**
Add a real layout-mode resolver and a visibility matrix for:
- wide
- medium
- compact
- minimal  
(or equivalent naming)

---

## Gap 02 — No practical-usable-space or container-aware logic
**Severity:** Critical  
**Type:** Structural redesign  
**Why it matters:**  
Homepage webparts live inside constrained lanes. Viewport width alone is not enough to choose the right information burden.

**Evidence**
- README explicitly documents viewport-media-query behavior
- no container measurement or host-lane width awareness exists
- compactness currently tracks viewport styling, not actual usable space

**Required correction**
Introduce container-aware sizing or an equivalent host-fit mechanism so the surface can choose mode from actual available width (and, if needed, height pressure).

---

## Gap 03 — Featured details are always mostly exposed
**Severity:** Critical  
**Type:** Structural redesign  
**Why it matters:**  
The target state requires an entry experience that can reduce visible detail under tighter conditions.

**Evidence**
The featured slot always tries to show:
- title
- headline
- summary
- milestones
- freshness
- team strip
- CTA

**Required correction**
Split featured content into:
- always-visible essentials
- on-demand details panel / disclosure region

---

## Gap 04 — Secondary rail is always present and not mode-suppressible
**Severity:** Critical  
**Type:** Structural redesign  
**Why it matters:**  
Secondary / exploration content ("More projects", past spotlights, stale-demoted
items) should not compete with the primary spotlight in compact states. The rail
today has no mode-level visibility governance.

**Evidence**
- supporting rail renders whenever `secondary.length > 0` (`HbcProjectSpotlightSurface/index.tsx:637`)
- the rail is labeled `More projects` / `Additional projects` and carries the
  `secondary[]` partition — including stale-demoted items — not a named history list
- no collapse, accordion, drawer, or reveal toggle exists
- screenshots confirm the secondary rail remains visible even in tight states

**Required correction**
Introduce an explicit, mode-aware reveal path for the secondary rail that defaults
collapsed in compact/minimal modes. A "Show past spotlights" framing is acceptable
when the authored content clearly reads as historical, but the general contract is
"show additional/secondary projects on demand" — the framing should follow the
authored content, not be hard-coded.

---

## Gap 05 — Compact behavior is still compression, not selectivity
**Severity:** High  
**Type:** Structural redesign  
**Why it matters:**  
A premium compact state is not just a stacked version of the same payload.

**Evidence**
- mobile/tight screenshots still show a large hero, featured body, and history framing
- the surface becomes tall rather than intentionally selective
- information burden remains high

**Required correction**
Define per-mode visibility rules and remove non-essential default content in tighter modes.

---

## Gap 06 — Media scale is not mode-governed
**Severity:** High  
**Type:** Targeted refinement with structural dependency  
**Why it matters:**  
The media zone should reinforce hierarchy, not consume disproportionate vertical space in tight states.

**Evidence**
- media min-height scales by breakpoint only
- large-screen image area can feel overlarge relative to content
- small-screen image still consumes dominant vertical space before details are curated

**Required correction**
Bind media height/aspect behavior to layout mode and content completeness.

---

## Gap 07 — Normalized `contentCompleteness` is underused
**Severity:** High  
**Type:** Targeted refinement  
**Why it matters:**  
The normalization pipeline already computes useful completeness tiers, but the surface does not leverage them to adapt what it renders.

**Evidence**
`operationalAwarenessConfig.ts` computes `contentCompleteness`, but the surface model and surface rendering do not use it.

**Required correction**
Promote completeness into the view model and let it inform:
- default visible fields
- fallback content strategy
- mode-specific rendering choices

---

## Gap 08 — Storybook coverage is not closure-grade for compactness
**Severity:** Medium  
**Type:** Targeted refinement  
**Why it matters:**  
The required redesign needs proof, not just a default and mobile story.

**Evidence**
Current stories do not prove:
- explicit layout modes
- collapsed details
- collapsed history
- narrowest stable nested state
- content-completeness-driven variants

**Required correction**
Add stories for:
- wide default
- compact collapsed
- minimal collapsed
- expanded details
- expanded history
- sparse/minimal-content
- railless state
- reduced-motion-safe interactions where applicable

---

## Gap 09 — README/documentation overstates current adaptivity
**Severity:** Medium  
**Type:** Refinement / closure  
**Why it matters:**  
The repo should not imply a stronger adaptive model than is actually implemented.

**Evidence**
README correctly reflects single-column stacking, but the implementation still lacks true mode-governed compactness and disclosure.

**Required correction**
Update README and any closure docs after redesign so they describe:
- layout mode ownership
- disclosure defaults by mode
- container/usable-space rules
- narrowest stable nested behavior

---

## Gap 10 — Missing mode-aware seam between existing sub-components
**Severity:** Medium  
**Type:** Structural refinement  
**Why it matters:**  
The next redesign needs isolated, testable seams for:
- mode resolution
- featured essentials vs. featured detail disclosure
- secondary-rail disclosure
- media contract bound to mode + content completeness

**Evidence**
The surface file already factors `Masthead`, `FeaturedMedia`, `FeaturedSlot`,
`MilestoneStrip`, `TeamStrip`, `RailTile`, and `SupportingRail` as discrete
internal sub-components. The real defect is not monolithic structure — it is the
absence of a shared mode resolver and visibility matrix connecting those
sub-components. Today every sub-component renders unconditionally whenever its
data is present.

**Required correction**
Introduce (a) a layout-mode resolver, (b) a visibility matrix consumed by the
existing sub-components, and (c) explicit essentials-vs-details / rail-disclosure
seams inside `FeaturedSlot` and `SupportingRail`. Extracting sub-components
across files is secondary — the priority is the behavioral seam, not a file split.
