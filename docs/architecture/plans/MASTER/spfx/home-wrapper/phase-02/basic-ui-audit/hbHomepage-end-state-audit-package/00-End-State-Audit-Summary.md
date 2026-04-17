# 00 — End-State Audit Summary

## Objective

Audit the current `hbHomepage` implementation in `main` and determine what still must change for it to become a benchmark-grade, flagship SharePoint homepage shell for HB Central.

## Framing

### Live repo source of truth
- `apps/hb-webparts/src/webparts/hbHomepage/`
- `apps/hb-webparts/src/webparts/companyPulse/`
- `apps/hb-webparts/src/webparts/leadershipMessage/`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/`
- `apps/hb-webparts/src/webparts/peopleCulturePublic/`
- `apps/hb-webparts/src/webparts/hbKudos/`
- `apps/hb-webparts/src/homepage/`
- `packages/ui-kit/src/`
- `docs/reference/ui-kit/doctrine/`
- `docs/architecture/plans/MASTER/spfx/benchmark/`

### Governing doctrine
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

### Benchmark package
- `docs/architecture/plans/MASTER/spfx/benchmark/README.md`
- `00-Plan-Summary.md`
- `01-Homepage-Webpart-Conformance-Standard.md`
- `03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`
- `04-Conformance-Scoring-Matrix.md`
- `06-Closure-Checklist.md`
- `07-Persona-and-Design-Symmetry-Rule.md`

## Executive verdict

`hbHomepage` is **not yet close enough to its intended end state to be treated as flagship-complete**.

It has several strong ingredients:
- a clean homepage orchestrator entrypoint
- a deliberate zone model
- mature shared surface families for newsroom, editorial, portfolio spotlight, and recognition
- explicit list-first fallback behavior in Project Spotlight
- a broad move toward `@hbc/ui-kit/homepage` as the primary presentation lane

But those strengths do **not** add up to a benchmark-grade homepage shell yet.

## What is already strong enough and should be preserved

### 1. Thin consumer posture in several zones
The Company Pulse, Leadership Message, and Project Portfolio Spotlight webparts have largely moved durable presentation grammar into shared homepage surface families. That is the right systems direction.

### 2. Benchmark-quality depth in HB Kudos
HB Kudos still appears to be the most mature homepage-grade implementation in this footprint. Its orchestration depth, host-safe handling, and richer interaction completeness should remain the quality reference.

### 3. Read seam discipline in Project Spotlight
Project Spotlight’s list-first operating model with manifest-config fallback is explicit and useful for SharePoint reality, local development, and packaging.

### 4. Import-governance intent exists
The homepage entrypoint in `packages/ui-kit/src/homepage.ts` clearly tries to centralize the governed homepage primitives and re-export the premium stack.

## What is directionally correct but still insufficient

### 1. The shell/zone split
The shell is clean, but it is too thin to provide real flagship compositional authority. Today it mostly sequences zones vertically.

### 2. The manifest
The manifest has `supportsFullBleed: true`, which is correct for a flagship homepage surface, but the current rendered shell structure does not capitalize on that capability.

### 3. Shared surface maturity
The shared newsroom, editorial, and project spotlight surfaces are materially stronger than the shell that composes them. The system has premium parts, but the homepage root does not yet turn them into one commanding homepage experience.

## What remains weak or missing

### 1. No flagship top-band exists
The homepage overlay expects a single flagship top-band object. The current shell does not render one.

### 2. Silent zone failures
`ZoneErrorBoundary` logs and returns `null`. That is not a benchmark-grade or author-safe error posture.

### 3. Weak shell-level state model
The shell has no explicit composition registry, no shell-level fallback strategy, no shell-visible error treatment, and no codified priority model for how zones relate to each other.

### 4. People & Culture governance drift
`PeopleCulturePublicSurface.tsx` is a large inline-style island with raw values, a local max-width cap, and no governed shared homepage surface family. Its local split-runtime rationale is understandable, but the result is still governance drift.

### 5. Hero primitive drift
A shared `HbcSignatureHeroSurface` exists, but it is still built around pre-Phase-18 assumptions: gradient wash background treatment plus extra editorial/CTA/context/metadata slots. That does not line up cleanly with the overlay’s locked hero content and background rules.

### 6. No proof-based closure posture
No hosted screenshots, scorecard evidence, or explicit closure artifacts proving benchmark-grade `hbHomepage` quality were available in this session.

## Target classification

The correct target remains:

- flagship homepage shell
- premium page-canvas orchestration surface
- multi-zone authored composition
- benchmark-grade maturity without cloned zone identity

The current implementation is **mid-transition**, not end-state.

## Recommended correction direction

### Structural redesign required
- flagship top-band
- shell composition authority
- zone registry / priority model
- shell-level failure and state handling
- shared hero primitive realignment
- shared People & Culture public surface promotion

### Targeted refinement required
- contract cleanup in shell props vs actual zone consumption
- spacing and width governance
- hosted validation and scorecard proof
