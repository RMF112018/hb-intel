# Doctrine and Benchmark Assessment

## Governing references applied

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`
- attached checklist and attached scorecard

## 1. Compliant or directionally compliant areas

### Host respect — mostly compliant

The Spotlight does **not** create fake shell chrome or fight SharePoint host chrome.

Good:

- it owns only the page-canvas region
- it is embedded through a homepage zone seam
- it stays inside the shell preset
- it does not try to impersonate a larger app shell

### Thin-shell architecture — compliant

The webpart consumer boundary is consistent with the doctrine’s preference for structural clarity.

Good:

- fetch local
- normalization local
- presentation shared
- loading / empty / error local
- row placement decided by the shell

### Accessibility posture — broadly compliant

Good:

- button-driven disclosures
- explicit regions
- focus-visible styling
- reduced-motion handling
- team panel dialog semantics
- no hover-only critical information

### Breakpoint governance — directionally compliant

Good:

- explicit layout modes
- container-aware measurement
- vertical-pressure step-down
- narrowest stable mode is declared

This is better than most homepage modules.

## 2. Partial compliance only

### Premium stack adoption — partial

The surface uses:

- `motion`
- `lucide-react`
- `clsx`

But it still underuses or bypasses stronger governed primitives where they are relevant:

- no meaningful `@floating-ui/react` use for the team panel / anchored overlay seam
- no `@radix-ui/react-separator` despite benchmark preference
- no visible `class-variance-authority`-driven variant system for the surface family
- overlay and panel behavior remain fairly manual

This is not a total failure, but it is **below benchmark seriousness**.

### Homepage integration quality — partial

The shell pairing is correct in principle, but the Spotlight does not convert its dominant slot into dominant user value.

The doctrine requires:

- strong first-view value
- no buried first shell lane
- positive dynamic adaptation

The current runtime falls short because the surface still wastes its dominant slot on empty visual mass.

## 3. Clear violations or materially weak areas

### Anti-empty-slab rule — violated in runtime effect

The doctrine explicitly prohibits large empty hero slabs. That is functionally what the hosted screenshots show when image truth fails.

This is the single clearest doctrine miss.

### Token discipline — materially weak

The benchmark expects governed values, CSS variable bridges, or at minimum a documented local token seam for flagship exceptions.

The Spotlight family currently uses direct literals throughout the CSS module.

That is materially below the benchmark set by HB Kudos.

### Design-safety-zone escape — incomplete

The surface does not collapse into a generic Fluent card, which is good.

But it still does not fully escape the “large premium card with passive interior logic” outcome. The runtime feels more decorated than decisive.

### Packaged / hosted result parity — not closed

The doctrine says structural intent must survive packaging and hosting.

The hosted screenshots prove that the current result is not matching the intended flagship posture.

That is a hard stop against calling the surface closed.

## 4. Benchmark comparison against HB Kudos

### Where Spotlight is behind HB Kudos

HB Kudos, in the provided screenshots, wins on:

- immediate first-view value
- denser task clarity
- stronger action posture
- clearer hierarchy inside the available slot
- less dead space
- better conversion of slot area into useful information

Spotlight wins in architectural cleanliness, but loses in lived homepage effectiveness.

### What “benchmark-grade” would mean here

Benchmark-grade does **not** mean turning Spotlight into a dark Kudos card.

It means:

- equally decisive first-view value
- equally serious token discipline
- equally strong runtime proof
- equally clear action and disclosure logic
- equally credible host-fit under real section constraints

The current Spotlight is not there.
