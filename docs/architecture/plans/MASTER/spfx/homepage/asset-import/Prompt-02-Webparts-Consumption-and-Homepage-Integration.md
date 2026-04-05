# Prompt-02 — Webparts Consumption and Homepage Integration

## Objective

Update the live `apps/hb-webparts` package to consume the shared brand assets from `@hbc/ui-kit` and integrate them into the homepage runtime surfaces in a restrained, premium way.

Do not re-read files that are already in your current context or memory.

---

## Strategic intent

The goal is to strengthen HB Central’s top-band identity using **shared kit-owned brand assets**, not to clutter the homepage or duplicate asset ownership.

Use the shared branding exports to reinforce:
- the first impression
- the welcome/top-band identity
- the hero composition
- the overall HB Central premium feel

Treat the GRIT logo as secondary unless there is a compelling, clearly justified use in a culture-oriented surface.

---

## Repo-truth focus areas

Audit and update the live repo truth in these areas as needed:

- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/`
- `apps/hb-webparts/src/webparts/hbHeroBanner/`
- any local homepage shared primitives/tokens that need minimal adjustment
- imports that should now consume `@hbc/ui-kit/branding`

---

## Required work

### 1. Audit current top-band composition
Evaluate the current state of:
- `PersonalizedWelcomeHeader.tsx`
- `HbHeroBanner.tsx`
- any local homepage composition helpers/tokens involved in those surfaces

Determine the cleanest branded integration points without damaging hierarchy.

### 2. Consume the primary HB logo from the kit
Use the shared `hedrickLogo` asset from the new branding entry point as the primary horizontal brand lockup.

Integrate it in the most compositionally appropriate way, likely one of:
- a restrained brand row inside the welcome header
- a subtle pre-heading brand lockup
- a composed hero-brand region that supports but does not dominate the greeting/message hierarchy

Use judgment. Favor editorial restraint.

### 3. Use a compact HB mark only if justified
Consume either:
- `hbIconBlueBg`
- or `hbLogoIcon`

only if a compact mark genuinely improves the top-band composition.

Do not force both.

### 4. Keep GRIT secondary
Do not make GRIT the primary homepage shell identity.

If a GRIT use is introduced at all, keep it secondary and deliberate, or simply keep it available through the shared branding registry for future culture/values surfaces.

### 5. Remove local ownership assumptions
Do not create or preserve a competing app-local canonical brand asset lane for the same logos in `apps/hb-webparts`.

The consuming app should reference the shared kit entry point.

### 6. Preserve authoring and runtime safety
Do not break existing empty-state, authoring-state, or config-partial behavior.
Keep the logo integration safe, static, and non-fragile.

---

## Hard gates

- Do not clutter the top band.
- Do not degrade the premium/editorial hierarchy.
- Do not make logos overpower the greeting or hero message.
- Do not duplicate brand asset ownership locally in `apps/hb-webparts`.
- Do not re-read files already in your current context or memory.

---

## Deliverables

- updated homepage runtime components consuming `@hbc/ui-kit/branding`
- any minimal token/composition adjustments needed
- concise final notes describing:
  - where the branding was integrated
  - which shared asset(s) were used
  - whether the compact mark was used
  - how hierarchy was preserved

---

## Acceptance criteria

- `apps/hb-webparts` consumes shared brand assets from the UI kit
- homepage branding feels more distinctly HB without becoming noisy
- greeting and hero hierarchy remain dominant
- no duplicated canonical logo ownership remains in the consuming app
- authoring/runtime safety remains intact
