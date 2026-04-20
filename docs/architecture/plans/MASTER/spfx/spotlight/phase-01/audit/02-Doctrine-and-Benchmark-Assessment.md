# Doctrine and Benchmark Assessment

## Governing posture

This assessment uses the following as binding or directly in-scope authority:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/sharepoint-homepage-shell-boundaries.md`
- `docs/reference/spfx-surfaces/benchmark/` as benchmark/enforcement context

The central doctrine test is not “does the webpart render?”  
The test is whether the surface behaves like a **premium, host-aware, deliberately adaptive homepage module**.

## 1. Host-aware premium design

### Current status
**Partially compliant**

### What is working
- The surface clearly reads above commodity SharePoint-card quality.
- The masthead, left-accent shell, and image-led featured region establish a premium posture.
- The shift to a single-column stacked composition is materially better for real SharePoint section fit than a brittle 70/30 desktop split.

### Where it fails
- The surface is still vertically heavy and visually overcommitted in its default state.
- The featured media min-heights (`260 / 340 / 380px` at mobile / tablet / desktop)
  are moderate in absolute terms but not mode-governed, so the media-to-information
  balance can feel disproportionate when the surface renders into a tight nested
  SharePoint section column.
- Compact states still read like stacked compression rather than deliberate simplification.

### Assessment
The surface is premium in visual intent, but not yet premium in adaptive behavior.

## 2. Practical usable space doctrine

### Current status
**Non-compliant**

### What doctrine requires
The governing standard requires the component to adapt to practical usable space and define explicit stable behavior under tighter nested conditions.

### Current implementation reality
- layout changes are driven by viewport media queries
- there is no container-aware measurement
- there is no explicit layout mode object
- there is no narrowest stable nested mode contract
- there is no mode-specific content visibility table

### Assessment
This is one of the largest remaining failures.

## 3. Progressive disclosure

### Current status
**Non-compliant**

### What doctrine requires
Tighter states must show less information and push lower-priority material behind explicit user action.

### Current implementation reality
- the featured body is mostly fully rendered by default
- the rail is rendered by default whenever secondary items exist
- only the team panel has true explicit disclosure behavior
- there is no “show details” control
- there is no “show past spotlights” control

### Assessment
The current Spotlight is still a “show almost everything” surface. That directly conflicts with the locked target state.

## 4. Density control and compact-state credibility

### Current status
**Partially compliant, but insufficient**

### What is working
- The single-column composition avoids the most brittle desktop/sidebar failure mode.
- Typography and spacing are visually cleaner than older enterprise-card patterns.
- Rail tiles are more disciplined than a generic list.

### Where it fails
- The compact/mobile states remain tall and story-heavy.
- The image retains major vertical dominance even when the entry experience should become selective.
- Details, supporting context, and history compete simultaneously instead of sequencing by priority.

### Screenshot-backed observation
Across tablet-portrait and handheld screenshots, the Spotlight still occupies a very large vertical share of the homepage while continuing to expose major featured content and visible history framing. That is not an intentional minimal state.

## 5. Information hierarchy

### Current status
**Directionally good, structurally incomplete**

### What is working
- Image first, title second is correct.
- The rail is visually subordinate to the featured item.
- Section-level CTA is separated from featured CTA.

### Where it fails
- Headline, summary, milestones, freshness, team strip, CTA, and history all compete in the same default experience.
- The featured image is prominent, but the information hierarchy below it is not aggressively curated by mode.
- The supporting rail behaves like always-on history instead of optional secondary exploration.

## 6. Accessibility and interaction safety

### Current status
**Mostly compliant, but incomplete**

### What is working
- explicit buttons/links
- team dialog semantics
- Escape and outside-click dismissal
- focus-visible treatment
- touch targets
- reduced-motion handling for existing motion

### Where it fails
- The missing details/history disclosure controls are also missing keyboard/touch-safe reveal patterns.
- Compact-state usability depends too much on vertical scrolling rather than explicit, low-friction reveal choices.

## 7. Maintainability and implementation discipline

### Current status
**Good structural base, incomplete behavior model**

### What is working
- thin consumer
- shared surface ownership
- centralized CSS module
- story file exists
- data/normalization/presentation are separated

### Where it fails
- the surface is still monolithic relative to the required next step
- there is no mode table or visibility matrix encoded in code
- content completeness is normalized but not used as a real presentation decision input
- documentation and closure proof do not yet express the missing compact/minimal contract

## Final doctrine assessment

### Preserve
- thin-consumer/shared-surface architecture
- editorial image-led identity
- team-strip disclosure precedent
- single-column host-fit direction

### Correct immediately
- add explicit layout modes
- make details optional in compact/minimal states
- make history optional in compact/minimal states
- shift from viewport-only styling to practical usable space logic
- validate and document the new contract
