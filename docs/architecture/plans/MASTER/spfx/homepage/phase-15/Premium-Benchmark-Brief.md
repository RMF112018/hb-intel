# Premium Benchmark Brief — HB Central Homepage

## Purpose

This brief defines the premium quality bar for the HB Central SharePoint homepage redesign.
It is binding on all subsequent Phase 15 prompts and implementation work.
Any future implementation that falls below this bar must be rejected and reworked.

---

## What "Premium" Means Here

Premium does not mean "cleaner SharePoint."
Premium does not mean "nicer cards."
Premium does not mean "good for an internal app."

Premium means:

- **Purchasable-product standard.** The homepage must feel like a product someone would pay for — comparable to premium SharePoint intranet products (Origami, ShortPoint, LiveTiles, Valo) and award-winning custom intranets (Estée Lauder MyELC, NNGroup Intranet Design Award winners).
- **Authored, not assembled.** Every zone must feel like it was composed with editorial intent, not dropped onto a grid.
- **Emotionally commanding at the top.** The first screen must create an immediate impression of quality, confidence, and brand presence — not a competent arrangement of rectangles.
- **Differentiated by surface.** Each homepage zone must have a distinct visual identity. A user should never confuse an editorial surface with an operational surface or a utility surface.
- **Product-grade interaction quality.** Hover states, focus rings, loading skeletons, transitions, and empty states must all feel deliberate and refined.
- **SPFx-realistic.** All of this must work within SPFx communication-site constraints. No unsupported DOM takeover. No fake full-page control. The premium standard is about design quality within platform reality, not fantasy mockups.

---

## What Must Never Appear in the Finished Homepage

These are binding prohibitions. If any of these survive into the final implementation, the work is incomplete.

| Prohibition | Rationale |
|---|---|
| Uniform white cards across all zones | Destroys hierarchy and makes every surface interchangeable |
| Invisible zone differentiation | Zone tints below ~0.05 opacity are imperceptible and do not create real visual separation |
| Flat, list-like launcher behavior | Link lists belong in settings pages, not in a premium homepage command surface |
| Generic text-input search treatment | A plain input field in a lightly tinted box is scaffolding, not a discovery product |
| Identical padding/radius/shadow across all surfaces | Uniform spacing erases the compositional hierarchy that makes a page feel authored |
| Side-by-side welcome and hero that feel like two unrelated cards | The top band must read as one integrated opening sequence |
| Thin technical shell strip with no visual presence | Lane B must feel like part of the product, not a debug toolbar |
| Interchangeable editorial and operational surfaces | These zones serve different purposes and must look and feel different |
| Card borders as the primary means of surface definition | Premium surfaces are defined by composition, background treatment, and spacing — not by border alone |
| Over-reliance on `elevationLevel0` and `elevationLevel1` shadows | These shadow levels are nearly invisible and do not create credible depth |

---

## Reference Traits the Redesign Must Achieve

These are the observable qualities that must be present in the finished homepage.

### 1. Signature Opening Sequence
The top band must be the homepage's most memorable surface. It must combine the personalized welcome, hero content, and brand presence into a single commanding visual sequence that sets the tone for the entire page. Reference: premium intranet products use full-width hero treatments with layered typography, brand-coherent imagery, and deliberate negative space.

### 2. Distinct Surface Families
Each homepage zone must belong to a recognizable surface family with its own visual character:
- **Command surfaces** (utility zone): dense, efficient, high-contrast, tool-like
- **Editorial surfaces** (communications zone): spacious, curated, magazine-like hierarchy with featured/secondary distinction
- **Operational surfaces** (project/safety zone): data-credible, structured, dashboard-adjacent
- **Discovery surfaces** (search/wayfinding zone): inviting, prominent input treatment, categorized pathways

### 3. Editorial Hierarchy Within Zones
Inside each zone, content must not compete at equal weight. Featured items must be visually dominant. Secondary items must be clearly subordinate. The eye must know where to land first.

### 4. Compositional Rhythm
The full page must have deliberate vertical rhythm — alternating between high-density utility bands and more spacious editorial bands. The page must not feel like one long grid of similar-weight sections.

### 5. Brand Presence Without Marketing
HB brand signals (blue/orange palette, typography, spacing discipline, confident tone) must be woven throughout the experience. The homepage must feel unmistakably Hedrick Brothers without feeling like a brochure.

### 6. Premium Interaction Polish
- Hover states that reveal intent (not just color change)
- Focus rings that feel designed, not default
- Loading skeletons that match the surface they replace
- Transitions that create smoothness, not distraction
- Empty states that feel intentional, not broken

### 7. Shell-Homepage Unity
Lane B (shell extension) and Lane A (homepage webparts) must feel like one product. The shell must support and frame the homepage, not sit above it as an unrelated strip.

---

## How Premium Maps to SPFx Reality

| Premium trait | SPFx-realistic implementation |
|---|---|
| Full-width hero | Communication-site `supportsFullBleed` + CSS composition within webpart boundaries |
| Layered typography | CSS custom properties + systematic type scale in tokens |
| Surface families | Distinct card weight/background/spacing tokens per zone, not one shared card |
| Editorial hierarchy | Featured/secondary content slots with explicit size and emphasis differentiation |
| Branded shell | Application Customizer placeholders (top/bottom) with coordinated visual language |
| Premium motion | CSS transitions gated by `prefers-reduced-motion`, no JS animation libraries |
| Discovery product | Styled search input with category navigation, promoted paths, and visual weight |

---

## Success Test

Hold the finished homepage against any premium SharePoint intranet product screenshot.
If the HB Central homepage does not feel like it belongs in the same category, the work is not done.

The standard is not "improved." The standard is "premium."
