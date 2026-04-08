# Wave 04 — Premium Surface Architecture Remediation for CompanyPulse

## Objective

Remediate the current `CompanyPulse` UI architecture so it becomes a **truly premium, top-of-class newsroom webpart** rather than a structurally improved but still inline-style-heavy editorial module.

This is **not** a new concept exploration.
This is **not** a low-effort polish pass.
This is **not** permission to keep the current architecture merely because it renders.

The current repo state already contains a Wave 03 newsroom rebuild. That rebuild improved the hierarchy, but the implementation still reads too much like an AI-generated composition driven by large inline style objects and light presentational wrappers.

Your job is to replace that ceiling with a real premium surface architecture.

---

## Critical operating instructions

- Work from **repo truth** in the live repo.
- Do **not** re-read files already in your active context or memory unless you need to verify drift or resolve uncertainty.
- Keep this wave **narrowly focused** on the `CompanyPulse` surface and the minimum adjacent files required to complete the remediation coherently.
- Do **not** reopen earlier product-direction decisions.
- Do **not** preserve the current visual language just because it compiles.
- Do **not** deliver another in-line-style-driven layout with improved copy.
- Do **not** settle for “good enough for SharePoint.”
- Do **not** introduce fake SharePoint shell chrome.
- Do **not** produce a stock enterprise card wall with a brand tint.

---

## Primary target files

- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/companyPulse/index.ts`

### Supporting files only if required
- newsroom primitives under `apps/hb-webparts/src/homepage/shared/newsroom/`
- company pulse normalization/contracts if directly necessary
- narrowly scoped `@hbc/ui-kit/homepage` exports if a small shared elevation is justified

---

## Repo-truth problem statement

The current `CompanyPulse` rebuild already has the correct broad hierarchy:
- lead story
- secondary headline stack
- tertiary support / archive behavior

That is **not** the main problem.

The problem is that the surface still appears to be authored primarily through:
- large inline style constants
- `getXStyle()` helper functions returning raw style objects
- local wrappers that control presentation without creating a serious premium surface system
- a composition that feels “assembled” rather than “designed”

The result is still materially short of a flagship newsroom webpart.

This wave must correct that.

---

## Required end state

The remediated `CompanyPulse` surface must:

- look like a **flagship newsroom module**
- feel materially more premium than the current implementation
- go beyond lightweight in-line styling and create a real surface language
- read as **authoritative, editorial, current, and high-confidence**
- stay visibly aligned with HB brand language
- be clearly superior to a stock SharePoint news list or generic card grid
- preserve the lead/secondary/tertiary newsroom hierarchy
- look excellent at typical SharePoint homepage zoomed-out viewing
- remain host-aware and production-safe in SharePoint

---

## Design direction to implement

### 1. Replace the inline-style ceiling with a real premium surface architecture
The current module should be refactored away from a style-object-dominated implementation and toward a more deliberate premium surface system.

This means:
- stronger surface primitives
- better compositional depth
- more credible editorial rhythm
- more deliberate spacing and edge treatment
- more systematic typography and metadata treatment
- more premium CTA integration
- more polished responsive behavior

If a small number of newsroom-specific shared primitives or style shells are warranted, create them.
Do not keep everything trapped inside `CompanyPulse.tsx` as ad hoc style maps.

### 2. Tune the emotional register for newsroom content
Use the surface-quality lessons from the People & Culture remediation benchmark, but retune appropriately for editorial/news content.

Relative to People & Culture, `CompanyPulse` should be:
- more authoritative
- more composed
- more current
- more information-dense
- more editorial
- less playful
- less celebratory
- more publication-like

But it still must remain:
- premium
- branded
- modern
- visually expressive
- non-generic
- production-safe

### 3. Strengthen the lead story so it behaves like a true newsroom anchor
The primary lead story must feel substantial and worthy of attention.

Improve:
- media treatment
- headline treatment
- byline / freshness rhythm
- supporting summary cadence
- CTA placement
- container depth
- edge treatment
- interaction polish

The lead story should feel closer to a premium newsroom spotlight than to a dressed-up article card.

### 4. Make the secondary story rail feel editorial, not generic
The secondary area should not read as a list of card fragments.

It should feel like a serious supporting headline rail:
- cleaner hierarchy
- disciplined density
- strong scanability
- subordinate but premium
- better metadata rhythm
- better hover/focus posture
- better alignment with the lead story

### 5. Make tertiary content useful and intentional
The tertiary area must not feel decorative or leftover.

If the tertiary zone remains category/archive-oriented, it should:
- look integrated
- support quick scanning
- not devolve into random chips floating at the bottom
- preserve the premium newsroom feel

### 6. Fix sparse-state design failure without reducing ambition
The webpart must still look credible when content is thin.

Sparse cases must remain premium under combinations like:
- lead only
- no lead, but 2 headlines
- 1 lead + 1 secondary + no tertiary
- limited media availability

Do not allow the module to collapse into blank space and weak separators.

### 7. Move beyond “AI inline styling”
This is explicit and binding for this wave:

The implementation must go well beyond the current inline-style posture.
Do not merely rename style constants or split the same style objects into more files.
Create a more credible premium implementation model.

That can include, where justified:
- extracted newsroom surface primitives
- proper variant systems
- better compositional wrappers
- more serious motion treatment
- more disciplined style orchestration

It must **not** remain a pile of inline presentation objects with slightly nicer values.

---

## Specific implementation guidance

### A. Surface system
Create a root surface that feels deliberate, premium, and newsroom-grade:
- stronger shell
- clearer sectional depth
- better material hierarchy
- better editorial framing
- more refined internal contrast

### B. Typography and metadata
Upgrade the typographic system:
- clearer headline dominance
- better subheadline / summary cadence
- stronger byline and date treatment
- metadata that feels editorial, not utility-only

### C. Interaction quality
Use restrained but premium motion and interaction behavior.
Respect reduced motion.
Do not add gratuitous animation.
Hover/focus states should feel polished and intentional.

### D. Layout authority
The module should use width confidently and behave well in its real SharePoint placement.
Do not allow it to feel narrow, timid, or over-separated.
Do not depend on unrealistic full-width assumptions.

### E. File discipline
Keep changes tight.
Do not broaden this into a generic redesign of unrelated homepage surfaces.
Only touch adjacent files when they materially improve the `CompanyPulse` result.

---

## Manifest / dev-state requirement

Update the manifest seed data only as much as required to support a representative premium newsroom render in dev/demo conditions.

The surface should visibly demonstrate:
- a meaningful lead story
- supporting headlines
- enough tertiary support to judge the full composition

Do not create a giant fake dataset.
Use enough realistic data to prove the design.

---

## Validation requirements

### Visual validation
- The webpart is visibly premium and newsroom-grade.
- It no longer looks like an inline-style-heavy AI composition.
- The lead story is materially dominant.
- The secondary rail is clearly subordinate but still premium.
- The tertiary zone feels intentional.
- The result is clearly superior to a stock SharePoint news module.

### Structural validation
- The surface hierarchy is strong and coherent.
- The composition works under sparse content.
- CTA placement supports the editorial hierarchy.
- The module looks designed, not assembled.

### Runtime validation
- Loading, empty, invalid, and sparse states still render safely.
- Reduced-motion behavior remains respected.
- The component still compiles cleanly.

### SharePoint realism validation
- The module behaves correctly in the actual homepage placement style.
- The result does not rely on fake shell assumptions.

---

## Completion deliverables

When complete, provide:

1. a concise change summary
2. the list of changed files
3. a short explanation of how the surface moved beyond the previous inline-style ceiling
4. any remaining limitations or recommended follow-up
5. confirmation of build readiness for Wave 05

---

## Final reminder

This wave is not about incremental polish.
It is about replacing the current implementation ceiling with a truly premium newsroom surface architecture.
