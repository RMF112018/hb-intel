# 07 — Validation and Closure Standards

## Closure principle

This work is closed only when the hosted SharePoint result matches the intended architectural and visual end state.

## Required proof categories

### 1. Repo / code proof
- file list changed
- architectural rationale for each major seam changed
- confirmation that wrapper-owned placement remains intact

### 2. Build proof
- local build succeeds
- relevant package or webpart packaging steps succeed
- no new unresolved warnings that materially affect the surface

### 3. Test proof
- relevant tests updated or added
- breakpoint / presentation / overflow behavior covered where feasible
- no broken prior coverage in related seams

### 4. Hosted SharePoint proof
Capture at minimum:
- view mode
- edit mode
- standard desktop width
- higher zoom (125% or 150%)
- narrower tablet-like width
- overflow open state
- first shell lane visible on first load

### 5. Console proof
- browser console reviewed in hosted state
- no uncaught runtime errors
- no new repeated warnings tied to the remediated surfaces

### 6. Accessibility proof
- keyboard traversal works
- focus-visible remains credible
- Escape closes governed overflow where applicable
- reduced-motion behavior remains intact
- compact and overflow controls remain pointer-safe

## Visual pass/fail criteria

### Pass indicators
- the rail reads as a deliberate command band
- action scan-speed is immediate
- hero -> actions -> shell feels like one intentional entry stack
- width is used confidently without awkward empty canvas
- overflow looks productized, not improvised

### Fail indicators
- the rail still reads as a bordered card inside a larger blank region
- primary actions feel visually subordinate to the wrapper around them
- overflow feels like a generic accordion despite “menu” or “sheet” intent
- the first shell lane is pushed below first view in major states
- zoom/constrained states hide critical actions or break tap/focus credibility

## Documentation closure standard

After hosted validation, update any scorecards / READMEs / closure notes so they match the actual proven outcome.
