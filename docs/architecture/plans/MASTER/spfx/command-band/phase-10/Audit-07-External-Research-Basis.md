# Audit-07 — External Research Basis

## Purpose

Document the external research that materially informed the enhanced package.

## Research themes used

### 1. Container-aware responsive behavior

Used to reinforce that component behavior should be governed by the **actual available container**, not just the viewport.

Applied implications:

- preserve and deepen container-query usage
- allow the launcher to react to the real width of the wrapper-owned actions region
- prefer compact adaptive behavior over optimistic multi-column stretching

### 2. Command-surface overflow patterns

Used to reinforce that compact action bars and toolbars should:

- keep primary actions in the main row
- avoid wrapping onto additional lines
- move surplus actions into a deliberate overflow mechanism
- group related items where possible for better scanability

Applied implications:

- preserve single-row launcher logic on larger classes
- keep menu/sheet overflow distinction
- strengthen grouping inside overflow instead of treating it as a flat dump list

### 3. Iconography semantics

Used to reinforce that icons work best when they are:

- tied to recognizable concepts
- paired with meaningful text labels
- not overloaded to represent multiple unrelated concepts
- not used as decorative noise

Applied implications:

- stop deriving homepage launcher identity from badge severity first
- use a governed icon mapping strategy centered on service/tool identity
- keep visible text labels alongside icons

### 4. Accessibility and focus rigor

Used to reinforce that compact launcher surfaces still need:

- credible focus indicators
- adequate target size or spacing
- no hover-only critical meaning
- label clarity even under dense conditions

Applied implications:

- keep explicit focus treatment as a first-class requirement
- validate target sizing/spacing rather than assuming compactness is acceptable
- add truncation rescue behavior where dense layouts hide full labels

### 5. SharePoint quick-link density patterns

Used to reinforce that SharePoint’s own quick-link guidance treats compact/icon-forward layouts as appropriate for easy access and higher-density surfacing.

Applied implications:

- keep the launcher utility-first and compact
- do not bloat the surface into a dashboard card system
- maintain a quick-access posture while making the surface more premium and semantically stronger than out-of-box Quick Links

## Important note

The external research informed the package’s direction, but the package still remains governed first by repo truth and the HB doctrine/benchmark files.
