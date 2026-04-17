# UI Doctrine — SPFx Homepage Overlay

> **Governing Status:** Homepage-specific overlay on the [SPFx Governing Standard](./UI-Doctrine-SPFx-Governing-Standard.md).
> **Scope:** HB Central homepage webparts (`apps/hb-webparts`), homepage shared primitives, homepage editorial compositions, homepage shells, and hosted homepage application surfaces.
> **Relationship:** Inherits all binding rules from the SPFx Governing Standard. Adds homepage-specific constraints and freedoms that do not apply to generic SPFx domain apps.
> **Supersedes:** Any older UI-kit guidance that assumes homepage webparts should follow the same composition patterns as domain-app SPFx surfaces.

---

## 1. Doctrine hierarchy

This overlay does not replace the SPFx Governing Standard. It sits on top of it.

**Reading order for homepage work:**
1. SPFx Governing Standard — binding shared rules (accessibility, token discipline, host awareness, stack standard, anti-safety-zone posture, breakpoint doctrine)
2. This homepage overlay — homepage-specific rules, freedoms, and constraints
3. SharePoint Homepage & Shell Boundaries — lane boundaries and supported customization posture
4. Homepage Import Policy — entry-point and import rules (in `entry-points.md`)

When this overlay is silent on a topic, the SPFx Governing Standard governs.
When this overlay speaks, it takes precedence for homepage surfaces.

---

## 2. Locked homepage scope

### 2.1 Actual rebuild focus — BINDING
Homepage structural rebuild work must focus on the real webpart code under:

- `apps/hb-webparts/src/webparts/`

Shared primitives matter, but homepage success or failure is judged by the webparts that actually render in SharePoint.

### 2.2 Homepage-specific manifest focus — BINDING
Every homepage webpart under `apps/hb-webparts/src/webparts/` must include the appropriate adjacent manifest.

This is a homepage requirement, not an optional packaging detail.

---

## 3. Binding homepage rules

### 3.1 Page-canvas ownership — BINDING
Homepage webparts own the page canvas. They must not:
- create shell chrome (nav bars, sidebars, footer rails)
- duplicate or fight SharePoint's host chrome
- render placeholder-extension content (belongs to Lane B)
- assume control over page regions they do not own

### 3.2 Import discipline — BINDING
Homepage webparts must import from `@hbc/ui-kit/homepage` as their primary UI entry point. Broad `@hbc/ui-kit` and `@hbc/ui-kit/app-shell` are prohibited. Enforced by ESLint `no-restricted-imports` in `apps/hb-webparts/.eslintrc.cjs`.

Supplementary token imports from `@hbc/ui-kit/theme` and icon imports from `@hbc/ui-kit/icons` are allowed when the homepage entry point does not export the needed item.

### 3.3 Accessibility — BINDING
All homepage webparts must meet:
- WCAG 2.1 AA minimum contrast (4.5:1 text, 3:1 interactive)
- Visible keyboard focus indicators
- `prefers-reduced-motion` support
- No hover-only critical information
- Light theme first
- credible behavior in touch-sized and constrained-height states

### 3.4 Authoring safety — BINDING
Every homepage webpart must behave well when:
- minimally configured
- partially configured
- moved between page sections
- viewed in SharePoint edit mode
- loaded with missing, stale, or empty data
- nested in a shell lane or section width narrower than the author expected

A webpart that looks good only when fully configured is not production-ready.

### 3.5 Empty, loading, and error states — BINDING
Every webpart must have:
- a clear empty state
- a professional loading state
- a graceful error state
- author-safe defaults that communicate what the webpart does

### 3.6 Token discipline — BINDING
Use shared semantic tokens from `@hbc/ui-kit/theme` by default.
Homepage-specific aliases are allowed and expected where they materially support the premium homepage posture.

Direct hex/rgb values and hardcoded pixel spacing are prohibited in ordinary homepage webpart source unless documented as a deliberate local exception for flagship work.

### 3.7 Breakpoint doctrine applies at both shell and application level — BINDING
Homepage work must explicitly govern:
- shell-level breakpoint behavior
- application-level breakpoint behavior

The homepage shell and each hosted homepage application must be deliberately dynamic across multiple display conditions.

Homepage work is non-compliant when:
- the shell adapts but hosted surfaces do not
- hosted surfaces technically shrink but become stressed or low-value
- a composition works only at desktop widths
- a first-screen state delays meaningful homepage value behind branding or utilities

---

## 4. Binding top-of-class stack standard for homepage work

### 4.1 Homepage premium stack — BINDING
Homepage rebuild work must use the approved premium stack where relevant:

- `motion`
- `lucide-react`
- `@floating-ui/react`
- `@radix-ui/react-slot`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
- `class-variance-authority`
- `clsx`

Installing this stack without materially using it is non-compliant.

### 4.2 Required stack usage posture — BINDING

#### `motion`
Use through `motion/react` for:
- signature hero reveal choreography
- premium CTA response
- hover and press refinement
- subtle section and panel transitions

#### `lucide-react`
Use as the homepage icon system for:
- priority actions
- launcher items
- search/discovery affordances
- operational cues
- editorial metadata accents where useful

Do not use Unicode glyphs or text initials as pseudo-icons in homepage webparts.

#### `@floating-ui/react`
Use for:
- search suggestions
- anchored overlays
- launcher flyouts
- premium contextual panels

#### `@radix-ui/react-slot`
Use for composable shells and reusable CTA/link/button patterns.

#### `@radix-ui/react-tooltip`
Use for elegant micro-help, especially where compact affordances need clarification.

#### `@radix-ui/react-separator`
Use for refined hierarchy and rhythm.

#### `@radix-ui/react-scroll-area`
Use for polished overflow in discovery and curated surfaces where needed.

#### `class-variance-authority` and `clsx`
Use to create serious homepage surface variants and readable class composition.

---

## 5. Binding anti-safety-zone homepage rules

### 5.1 Generic enterprise card-grid outcomes are prohibited — BINDING
Homepage webparts must not settle into:
- thin-border white-card repetition
- timid hierarchy
- small polite modules floating in excessive empty canvas
- subtle, barely noticeable premiumization passes

### 5.2 Large empty hero slabs are prohibited — BINDING
A flagship homepage hero may not be:
- mostly empty blue area
- a text block plus one button with dead space around it
- visually weaker than the modules beneath it

### 5.3 Pseudo-icons are prohibited — BINDING
The homepage may not use:
- Unicode icons
- text initials
- placeholder glyph substitutes

where a real premium icon system is expected.

### 5.4 Structural rebuild takes precedence over decorative polish — BINDING
If the homepage still reads as a cautious enterprise card grid, the correct response is structural replacement, not incremental styling.

---

## 6. Homepage-specific shell and top-band doctrine

### 6.1 Entry stack must deliver brand + action + value — BINDING
The homepage entry stack must be governed as a composed experience.

The recommended entry sequence remains:

1. flagship hero
2. top actions / utility band
3. first shell lane

The first screen must deliver:
- the full hero message,
- at least the primary actions,
- and the beginning of the first shell lane.

The first shell lane must not feel buried beneath the hero and utilities.

### 6.2 The hero is not the homepage — BINDING
The hero is a flagship brand and welcome surface.

It must not consume so much vertical space that the user cannot see meaningful shell content on first load.

No homepage implementation may treat “branding first, homepage later” as acceptable.

### 6.3 Signature hero standard — BINDING
The homepage top band must behave as a **single flagship product surface**.

It must not read as:
- one greeting surface plus one hero surface
- a greeting card beside the hero
- a greeting block below the hero that still feels separate

### 6.4 Greeting integration — BINDING
The personalized greeting must be integrated into the signature hero experience in rendered output.

Internal logic may be modular, but the rendered result must be one authored top-band object.

### 6.5 Full-width support — BINDING
The signature hero banner manifest must explicitly include:

```json
"supportsFullBleed": true,
```

This is locked.

### 6.6 Visual authority — BINDING
The top band must establish the page’s quality standard immediately through:
- stronger hierarchy
- stronger scale
- stronger composition
- stronger brand expression
- materially better use of available width

### 6.7 Locked hero content — BINDING (Phase 18)
The flagship homepage hero contains exactly three identity elements:

1. **Company logo / brand lockup** (Hedrick Brothers + "HB Central")
2. **Tagline:** "Build with GRIT."
3. **Personalized welcome message** ("Good {morning/afternoon/evening}, {First Name}.")

No editorial headline, CTA, metadata row, alert chip, context line, eyebrow, or other furniture. Premium presence is achieved through composition, scale, spacing, typography, and materiality — not content volume.

### 6.8 Hero background standard — BINDING (Phase 18)
The hero background must not use a gradient wash (no blue/orange enterprise banner treatment).

Approved background system:
- **Primary:** Authored photography (wide, low-clutter project or craft imagery) with a subtle readability scrim overlay
- **Fallback:** Deep charcoal/graphite surface (`hsl(220, 12%, 13%)`) with grain texture, atmospheric vignetting, and restrained tonal warmth

The background must support text readability without heavy overlay bands.

### 6.9 Quick links must become prioritized actions — BINDING
The utility band must be treated as a **priority actions system**, not a flat directory of equal-weight destinations.

Required behavior:
- highest-frequency actions first
- visible primary actions limited by breakpoint
- lower-priority tools moved behind a governed `More tools` or equivalent overflow affordance
- no long flat directory rows presented as the premium answer

### 6.10 Shell must be container-aware — BINDING
Hosted surfaces should not be placed side-by-side simply because the viewport is technically wide enough.

They may share a row only when the **actual slot width** supports a premium, stable nested layout.

The shell must make row-sharing decisions based on shell-fit reality, not optimism.

### 6.11 Single-column fallback is not failure — BINDING
Tablet portrait and all handheld states should default to a disciplined single-column shell sequence unless a specific exception is proven stable.

The shell must not force compressed multi-column compositions in portrait or handheld states.

### 6.12 Reflow safety is mandatory — BINDING
The homepage entry stack must not require awkward two-dimensional scrolling, and critical actions must remain reachable at higher zoom or in constrained width and height states.

---

## 7. Homepage breakpoint spec — shell level

### 7.1 Breakpoint matrix — BINDING
Homepage shell work must validate against the following practical shell design targets:

| Display Type | Practical Shell Design Target | Required Entry Model |
|---|---:|---|
| Ultrawide desktop | 1600–2200 px usable content width | Premium wide composition |
| Standard laptop / desktop | ~1180–1400 px usable shell width | Compressed flagship desktop |
| Tablet landscape large | ~1100–1250 px usable width | Simplified desktop-like |
| Tablet landscape medium | ~980–1120 px usable width | Tablet landscape guided layout |
| Tablet portrait large | ~820–950 px usable width | Guided single-column entry |
| Tablet portrait medium | ~720–850 px usable width | Large-mobile style entry |
| Phone portrait large | ~390–430 px usable width | Immediate mobile entry |
| Phone portrait standard | ~375–410 px usable width | Immediate mobile entry |
| Phone landscape / short-height | short-height constrained state | Compact banner + fast actions |

Raw device resolution is informative, but practical usable space governs implementation.

### 7.2 Action visibility rules — BINDING
The shell must cap visible primary actions by breakpoint:

| Device Class | Visible Primary Actions | Overflow Behavior |
|---|---:|---|
| Ultrawide desktop | 6 | `More tools` |
| Standard laptop / desktop | 5 | `More tools` |
| Tablet landscape | 4–6 | `More tools` |
| Tablet portrait | 4 | `More tools` |
| Phone portrait large | 4 | Sheet / `More tools` |
| Phone portrait standard | 3–4 | Sheet / `More tools` |
| Phone landscape | 0–4 depending on strip mode | Action sheet / overflow strip |

### 7.3 Hero height rules — BINDING
The shell must control hero height by breakpoint:

| Device Class | Recommended Hero Height |
|---|---:|
| Ultrawide desktop | 420–460 px |
| Standard laptop / desktop | 340–380 px |
| Tablet landscape | 280–320 px |
| Tablet portrait | 240–280 px |
| Phone portrait large | 200–220 px |
| Phone portrait standard | 190–210 px |
| Phone landscape | 120–160 px |

### 7.4 First shell lane rules — BINDING
The shell must enforce the following:

- the first shell lane must begin on first view
- two-column first lanes are conditional, not assumed
- tablet portrait and phones default to single-column first-lane behavior
- hosted surface compatibility is judged by shell fit, not by whether it technically renders

If a hosted surface cannot remain stable in its assigned slot width, the shell must:
- widen it,
- stack it,
- move it,
- or force an alternate hosted layout mode.

---

## 8. Homepage breakpoint spec — application level

### 8.1 Every hosted homepage application must define narrowest stable nested mode — BINDING
Every homepage application or webpart intended to live inside a shell lane must define:

- its narrowest stable nested width
- the layout modes it supports
- whether it can participate in a two-column first lane
- what changes in compact and minimal states
- which metadata, summary bars, actions, companions, or sidecars collapse or hide
- whether it has a required single-column mode
- whether hover-dependent behavior is eliminated in handheld or touch-first states

### 8.2 Application-level shell fit governs composition — BINDING
The homepage shell must not guess application stability.

Hosted surfaces intended for important or early shell placement must expose enough guidance for the shell to determine:
- row-sharing eligibility
- preferred slot width
- preferred dominance or secondary role
- compact-state suitability
- whether a different hosted layout mode must be forced at narrower widths

### 8.3 Application-level breakpoint failure is a homepage failure — BINDING
A homepage implementation is not acceptable if the shell behaves well but the hosted applications become:
- crowded
- visually brittle
- metadata-heavy to the point of stress
- interaction-fragile
- unreadable
- dependent on desktop-only affordances

The homepage is judged as a complete composed product.

---

## 9. Directional homepage guidance

### 9.1 Editorial hierarchy — DIRECTIONAL
Homepage compositions should establish clear visual hierarchy:
- the signature hero is visually dominant
- section headers establish rhythm between zones
- editorial cards support scanning
- utility and command surfaces are compact but forceful
- discovery surfaces feel active and premium, not passive

### 9.2 Width and scale — DIRECTIONAL
Homepage work should use the available canvas with confidence.

Avoid:
- timid centered-rail layouts
- undersized modules
- empty canvas created by weak width usage

Prefer:
- confident width usage
- asymmetric balance where appropriate
- focal sequencing that still reads well when zoomed out

### 9.3 Motion with discipline — DIRECTIONAL
Homepage motion should be:
- lighter than PWA motion
- purposeful
- visibly premium
- `prefers-reduced-motion` aware

Avoid theatrical motion, but do not collapse into lifeless hover states.

### 9.4 Media treatment — DIRECTIONAL
When homepage webparts include media:
- images should have defined aspect ratios
- placeholders should be visually clean
- hero imagery should support responsive full-width treatment
- alt text should be authoring-governed

### 9.5 Command and discovery expectations — DIRECTIONAL
Utility and discovery zone webparts should favor:
- compact, premium command layouts
- real iconography
- strong affordance clarity
- richer search/discovery behavior
- anchored overlays where genuinely useful

### 9.6 Content freshness guardrails — DIRECTIONAL
Webparts that display time-sensitive content should:
- communicate recency clearly
- degrade gracefully when stale
- support author-governed freshness treatment

### 9.7 Dynamic adaptation should feel positive, not merely safe — DIRECTIONAL
Breakpoint behavior should not read as reluctant compression.

Preferred outcomes:
- faster clarity on smaller screens
- stronger prioritization under constraint
- cleaner lane sequencing
- more decisive action visibility rules
- better nested fit inside shell lanes

---

## 10. Homepage freedoms

### 10.1 Full-width composition
Homepage webparts may use full-width section layouts when the page section supports it. This is standard and expected for the signature hero.

### 10.2 Zone-specific visual treatment
Different homepage zones may have different visual density, card styles, and spacing. Strong zone differentiation is allowed and often desirable.

### 10.3 Local homepage primitives
Homepage-local shared components are allowed and encouraged when specific to homepage composition and not yet proven for broader reuse.

### 10.4 Brand expression
Homepage webparts may express HB brand identity more strongly than generic operational SPFx surfaces. The result should feel premium and established, not flashy or startup-like.

### 10.5 Stronger stack adoption
Homepage work is explicitly allowed to adopt the approved premium stack when it materially improves:
- iconography
- motion
- overlays
- discovery behavior
- compositional quality
- surface elegance

---

## 11. Shared UI-kit vs local homepage territory

| Territory | Owned By | Examples |
|-----------|----------|---------|
| Reusable visual primitives | `@hbc/ui-kit` (via `/homepage` entry) | homepage primitives, CTA shells, icon frames, search primitives, premium surface families |
| Homepage governance constants | `@hbc/ui-kit/homepage` | brand foundation, typography aliases, spacing aliases, accessibility policy, density policy, import guardrails, breakpoint policies |
| Semantic tokens | `@hbc/ui-kit/theme` | shared tokens and homepage-aware aliases |
| Homepage composition shells | `apps/hb-webparts/src/homepage/shared/` | composition shells only when they materially support homepage structure |
| Webpart components | `apps/hb-webparts/src/webparts/` | each homepage webpart folder |
| Homepage helpers | `apps/hb-webparts/src/homepage/helpers/` | config normalization, identity resolution, greeting logic, overlay helpers, shell-fit helpers |
| Homepage contracts | `apps/hb-webparts/src/homepage/webparts/` | per-zone configuration contracts, shell-fit contracts, breakpoint contracts |

**Promotion rule:** Promote local homepage components to `@hbc/ui-kit` only when reuse beyond homepage is justified and the pattern is aligned with the shared premium design language.

---

## 12. What homepage surfaces must NOT do

- import from `@hbc/ui-kit` root or `@hbc/ui-kit/app-shell`
- create shell chrome, navigation, or footer elements
- use unsupported SharePoint DOM manipulation
- suppress or fight the SharePoint host chrome
- depend on fake premiumization through tint-only card changes
- use Unicode icons in place of a real icon system
- leave the hero without full-bleed support when it is intended to be flagship
- assume the page author’s SharePoint section layout will rescue weak structural design
- treat “it technically fits” as proof of shell compatibility
- force multi-column early-lane layouts in portrait or handheld states without proof

---

## 13. Locked assumptions for future homepage work

Future implementation phases should treat the following as locked:

1. `apps/hb-webparts/src/webparts/` is the primary rebuild focus
2. each homepage webpart must have the correct adjacent manifest
3. the signature hero banner manifest must include `"supportsFullBleed": true`
4. `@hbc/ui-kit/homepage` remains the primary homepage entry point
5. the approved premium stack is mandatory where relevant
6. Unicode icons and timid enterprise card-grid outcomes are non-compliant
7. the top band must render as one flagship surface
8. the three-lane model remains the governing architecture
9. supported customization posture remains page canvas + placeholders only
10. the flagship hero contains only logo, tagline "Build with GRIT.", and personalized greeting (Phase 18)
11. the hero background must not use a gradient wash — charcoal base or authored photography only (Phase 18)
12. the split-path hero pattern (separate greeting + editorial hero) is retired for flagship use (Phase 18)
13. breakpoint specs are required at both shell and application level for serious homepage work
14. the first shell lane must begin on first load across major device classes
15. tablet portrait and phone states default to single-column unless an exception is proven stable
16. the shell must be exceptionally dynamic and positive across multiple display conditions, not merely “responsive”
