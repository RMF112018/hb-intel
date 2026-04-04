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

## Prompt-04 Closure Artifacts

- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.tsx`
- `apps/hb-webparts/src/webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeaderWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBanner.tsx`
- `apps/hb-webparts/src/webparts/hbHeroBanner/HbHeroBannerWebPart.manifest.json`
- `apps/hb-webparts/src/homepage/shared/HomepageTopBandPair.tsx`
- `apps/hb-webparts/src/homepage/helpers/welcomeMessage.ts`
- `apps/hb-webparts/src/homepage/helpers/topBandConfig.ts`
- `apps/hb-webparts/src/homepage/__tests__/topBandWebparts.test.tsx`
- `04A_Welcome_Header_Contract_and_Behavior_Matrix.md`
- `04B_Hero_Banner_Authoring_and_Config_Contract.md`
- `04C_Top_Band_Test_Usage_and_Handoff.md`

## Resolved Decisions Register (Prompt 04)

| Decision ID | Decision                                                                                                     | Status    |
| ----------- | ------------------------------------------------------------------------------------------------------------ | --------- | ----------------------- | ------ |
| D4-01       | Greeting format is fixed to `Good morning                                                                    | afternoon | evening, {First Name}.` | Closed |
| D4-02       | First-name fallback order is preferred name, display name, email local-part token, then `there`              | Closed    |
| D4-03       | Welcome alert rendering remains optional and severity-governed (`none`, `info`, `warning`, `critical`)       | Closed    |
| D4-04       | Hero banner authored mode requires a headline; non-authored mode renders empty-state guidance                | Closed    |
| D4-05       | Top-band pairing is standardized through shared `HomepageTopBandPair` composition helper                     | Closed    |
| D4-06       | Prompt-04 applies manifest patch bump from `001.000.001` to `001.000.002` for `hb-webparts` solution/feature | Closed    |

## Prompt-04 Handoff

- Top-band welcome and hero contracts are now implementation-ready and test-covered in `hb-webparts`.
- Prompt-05 should consume these contracts without redefining greeting, alert, hero authoring, or top-band layout policies.
