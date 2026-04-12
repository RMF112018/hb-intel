# Homepage Webpart Benchmark — HB Kudos Reference Standard

**Purpose:** concise conformance checklist for new HB Central
homepage webparts. Distilled from the Phase-23 HB Kudos closure
(`docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/kudos/phase-23/99-Closure-Report.md`).
**Authority:** `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
and `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`.
The doctrine is the source of truth; this document is the worked
example of what "compliant" looks like in the current codebase.

## How to use this document

1. Read the two doctrine files first.
2. Use the checklist below as a pass/fail gate for review.
3. Where HB Kudos is cited as the reference, go read that file —
   don't copy surface layout wholesale.

## Conformance checklist

### Import discipline
- [ ] UI imports route through `@hbc/ui-kit/homepage` (overlay §3.2).
      Broad `@hbc/ui-kit` and `@hbc/ui-kit/app-shell` are prohibited.
- [ ] Supplementary imports from `@hbc/ui-kit/theme` and
      `@hbc/ui-kit/icons` are fine when the homepage entry point
      doesn't export what you need.

### Token discipline (overlay §3.6)
- [ ] Zero hardcoded hex / rgba / raw px in webpart CSS modules
      for color, spacing, radius, elevation, or transition values.
      The sole escape is authored governance constants declared in
      a single `tokens.ts` co-located with the surface family, with
      an inline `// §6.1 …` governance comment.
- [ ] Values flow from governed `theme/tokens.ts`, `grid.ts`,
      `radii.ts`, `elevation.ts`, `animations.ts` via one
      CSS-custom-property bridge (`kudosComposerCSSVars()` inside
      `@hbc/ui-kit`; `kudosCSSVars()` in `apps/hb-webparts`).
- [ ] One local CSS-var prefix per webpart family (`--hbk-*` for
      kudos; `--hbc-kudos-*` inside the `@hbc/ui-kit` composer).
      No parallel prefixes expressing the same values.

### Premium stack (governing §5, overlay §4.2)
- [ ] `class-variance-authority` governs real variant systems
      (chip kind, button role, orientation, state). No
      string-concatenated class lookups.
- [ ] `@radix-ui/react-separator` for dividers, not raw `<hr>`.
- [ ] `@radix-ui/react-scroll-area` for flyout bodies with
      meaningful overflow.
- [ ] `@radix-ui/react-tooltip` for micro-help on secondary
      controls; `aria-label` stays on the button for screen readers.
- [ ] `motion` choreography respects `prefers-reduced-motion`.
- [ ] `lucide-react` as the icon system (overlay §5.3: no Unicode
      glyphs or text-initial pseudo-icons).

### Structural quality (governing §4.3)
- [ ] Shared presentation primitives live in a cohesive
      directory with `index.tsx` as a barrel, `types.ts`,
      `tokens.ts`, `variants.ts`, per-component files, an
      `internal/` helpers layer, and surface-scoped CSS modules.
- [ ] Webpart entry file is a thin orchestrator that composes
      smaller surface / panel / hook modules. No monolithic files.
- [ ] Inline `style={{…}}` is limited to
      (a) the CSS-var token bridge record, or
      (b) runtime-measured values that cannot be static
      (host-chrome offset, safe-zone sentinel size).
- [ ] No runtime-injected `<style>{…}</style>` blocks.

### Flyout interaction contract
Any slide-in panel MUST consume the shared
`HbcKudosComposerFlyout` shell from `@hbc/ui-kit/homepage`. The
shell owns:
- [ ] open / close + ESC-to-close
- [ ] focus trap during open
- [ ] explicit trigger-focus restoration on close
- [ ] scroll lock (host-aware, SPFx-compatible)
- [ ] scroll-area overflow
- [ ] host-chrome safe-zone offset + safe-area-inset-bottom
- [ ] motion choreography (reduced-motion aware)
- [ ] primary / secondary action footer

Consumers own:
- [ ] `title` / `subtitle` / `primaryAction` / `secondaryAction`
- [ ] Body wrapped in `KudosFlyoutBody` (or an equivalent
      surface-family wrapper) so padding, gap, reading width,
      and token seam stay one system.
- [ ] Semantic landmark via the `as` prop (`"article"` for a
      reader, `"section"` for a governance detail, plain `"div"`
      for a composer / feed).

### Accessibility (overlay §3.3, WCAG 2.2 AA)
- [ ] Target sizes: primary CTAs 44×44, governance action
      buttons 32 min, toggle chips 32 min, in-chip secondary
      controls 24×24 min.
- [ ] Visible `:focus-visible` indicator on every interactive
      control. Indicator uses `var(--hbk-brand-blue)` (or the
      webpart's equivalent governed blue) at 2px.
- [ ] `prefers-reduced-motion` zeroes transitions and skips
      motion choreography.
- [ ] No hover-only critical information.
- [ ] Light theme first. Dual-theme compatibility is preserved
      through token-driven styling.
- [ ] Dialog semantics: `role="dialog"` + `aria-modal="true"` on
      flyout panels; clear `aria-label` or `aria-labelledby`.

### Authoring safety (overlay §3.4 / §3.5)
- [ ] Webpart renders cleanly at:
      minimally configured / partially configured / moved between
      page sections / SharePoint edit mode / missing or stale data.
- [ ] Empty state, loading state, and error state are all
      implemented and author-safe.

### Split-runtime boundary
- [ ] Public / companion (or equivalent) webparts stay in
      separate webpart folders under `apps/hb-webparts/src/webparts/`.
- [ ] Cross-webpart imports are limited to presentational
      helpers (icons, flyout wrappers, governed tokens). Runtime
      orchestration, data access, and state must not cross.
- [ ] Shared webpart-family code lives under
      `apps/hb-webparts/src/homepage/shared/` and both webparts
      consume from there.

### Manifest + packaging (governing §9, overlay §6.3)
- [ ] Every webpart has the correct adjacent `.manifest.json`
      under its source folder.
- [ ] SharePoint 4-part version (`{00}.{00}.{00}.{00}`) is
      bumped on every material change.
- [ ] `supportsFullBleed: true` declared where the webpart is
      intended to run full-bleed (signature hero, full-width
      company-pulse surfaces, etc.).

### Hosted validation floor
Every reference-grade homepage webpart must ship a hosted Playwright
suite covering at minimum:
- [ ] chrome-overlap + reduced-width CTA reachability
- [ ] dead-control sweep (every interactive testid is real)
- [ ] keyboard + focus-visible + focus-restoration + target-size
- [ ] panel-scroll for any flyout body with overflow
- [ ] zoom + safe-zone regressions
- [ ] responsive desktop-vs-mobile rendering of any shared flyout
- [ ] happy-path interactions (filter, round-trip, counter)
- [ ] workflow actions (if the webpart has governance or mutation
      paths)
- [ ] closure-report emitter that writes a single JSON artifact
      under `test-results/`

See `e2e/webparts/kudos/hosted/` for the ten-spec reference suite.

## Reference citations

- Shared composer family:
  `packages/ui-kit/src/HbcKudosComposer/`
- Public webpart: `apps/hb-webparts/src/webparts/hbKudos/`
- Companion webpart:
  `apps/hb-webparts/src/webparts/hbKudosCompanion/`
- Shared token + primitives:
  `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`,
  `apps/hb-webparts/src/homepage/shared/governance.module.css`
- Hosted suite: `e2e/webparts/kudos/hosted/`
- Closure report: the Phase-23 `99-Closure-Report.md`

## Promotion rule

Do not promote a feature's local primitives into `@hbc/ui-kit`
unless cross-feature reuse pressure actually justifies the
boundary. HB Kudos' local `KudosGovernancePrimitives` family is
deliberately local; promotion becomes a decision for a future phase
when a second governance surface needs the same primitives.
