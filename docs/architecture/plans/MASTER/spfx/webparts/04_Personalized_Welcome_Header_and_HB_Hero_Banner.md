# 04 — Personalized Welcome Header and HB Hero Banner

**Naming guard**
- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.


## Objective

Implement the top-band homepage experience: the signature personalized greeting webpart and the premium authored hero-banner webpart.

## Required Context

- Live repo: `RMF112018/hb-intel`
- This package’s `00_Implementation_Summary.md`
- This package’s `11_Risk_Exposure.md`
- This package’s `12_Standards_and_Best_Practices.md`
- Relevant current-state docs, ADRs, package READMEs, and live source files in the repo

## Operating Rules

- Use **repo truth first**. Inspect the live code and current authoritative docs before editing.
- Do **not** re-read files that are already in your current context or memory window.
- Do **not** broaden scope beyond the HB Central homepage webpart system.
- Do **not** create placeholder or stubbed production code.
- Prefer updating existing authoritative docs over creating redundant documents.
- Preserve SharePoint-native authoring and page composition.
- Default to lightweight homepage webparts unless this prompt explicitly authorizes an exception.
- Keep imports narrow and homepage-safe.
- Record any doc/code contradiction you find instead of silently choosing one source.
- At the end, provide a concise handoff note with changed files, verification, risks, and next-prompt readiness.

## Implementation Tasks


1. Implement the **Personalized Welcome Header** webpart.
   Requirements:
   - greeting format:
     - `Good morning, {First Name}.`
     - `Good afternoon, {First Name}.`
     - `Good evening, {First Name}.`
   - first name from Microsoft 365 identity or preferred available profile source
   - local-time-aware greeting logic
   - graceful fallback when preferred first name is unavailable
   - concise supporting line support
   - optional date/context line if it improves polish
   - optional high-priority alert state without wrecking hierarchy

2. Treat the greeting as a **hero-signature element**, not a utility label.
   The visual outcome must feel warm, elegant, professional, and premium.

3. Implement the **HB Hero Banner** webpart.
   Requirements:
   - premium editorial layout
   - flexible imagery/background treatment
   - authored headline / message area
   - optional CTA region
   - optional supporting metadata
   - disciplined motion and loading behavior
   - usable in SharePoint without turning into a fragile marketing artifact

4. Ensure both webparts can coexist in the top band without fighting each other.
   They should feel like a coordinated pair, not two unrelated boxes.

5. Add property-pane and content-configuration behavior appropriate for site owners.
   Normal hero updates must not require code changes.

6. Add tests for:
   - greeting logic and fallback behavior
   - semantic heading structure
   - alert rendering states
   - empty/authoring edge cases


## Required Deliverables


- working Personalized Welcome Header webpart
- working HB Hero Banner webpart
- property-pane/config behavior for both
- tests and docs for both
- any shared helper refinements required by the implementation


## Verification


- run typecheck and relevant tests
- verify the greeting logic against multiple times of day and fallback cases
- verify semantic structure, focus behavior, and reduced-motion support
- confirm both webparts remain visually premium and operationally readable in SharePoint-compatible light mode


## Definition of Done


- the top-band experience is implemented and clearly reflects the design brief
- the greeting is a signature experience element
- hero content is site-owner maintainable
- both webparts are ready for real homepage composition
