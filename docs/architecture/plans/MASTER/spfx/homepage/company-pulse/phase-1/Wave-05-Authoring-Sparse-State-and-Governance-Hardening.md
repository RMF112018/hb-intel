# Wave 05 — Authoring, Sparse-State, and Governance Hardening for CompanyPulse

## Objective

Harden the remediated `CompanyPulse` surface so it remains premium, resilient, and production-safe under real SharePoint authoring and imperfect content conditions.

Wave 04 should have already elevated the surface architecture.
Wave 05 must ensure that quality survives:
- sparse data
- partial configuration
- missing media
- imperfect editorial metadata
- authoring movement and edit mode
- realistic homepage placement constraints

This is **not** permission to flatten the surface or reduce ambition.
The objective is to preserve the premium result while making it operationally robust.

---

## Critical operating instructions

- Work from **repo truth** in the live repo.
- Do **not** re-read files already in your active context or memory unless needed to verify drift or resolve uncertainty.
- Keep this wave tightly scoped to `CompanyPulse` and the minimum adjacent files required.
- Do **not** reopen the Wave 04 surface architecture unless it is necessary to harden it.
- Do **not** solve sparse states by making the module bland or generic.
- Do **not** allow authoring safety to collapse the premium hierarchy.

---

## Primary target files

- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json`

### Supporting files only if directly required
- company pulse normalization/contracts
- newsroom shared primitives used by `CompanyPulse`
- authoring/empty/loading helpers already used by homepage webparts

---

## Hardening requirements

### 1. Sparse-state resilience
The module must remain premium when content is thin.

Validate and refine for:
- lead only
- no lead, 1–2 secondary items only
- lead + 1 secondary
- no tertiary items
- missing category or metadata
- no media on lead story
- no media across all stories

Sparse states must still look intentional.

### 2. Partial-configuration professionalism
The module must behave well when editors have configured only part of the content model.

Do not allow:
- awkward gaps
- placeholder-feeling CTA placement
- broken hierarchy
- weak alignment
- strange empty rails

### 3. Empty and invalid states
Retain professional author-safe empty and invalid behavior.

Empty and invalid states should:
- remain clear
- remain premium enough to fit the homepage family
- not visually shock against the surrounding homepage modules
- not overcomplicate the authoring experience

### 4. Edit-mode predictability
Confirm the module remains legible and stable when used in realistic SharePoint authoring flows:
- moved between sections
- opened in edit mode
- minimally configured
- using demo/seed content only

### 5. Governance-safe content behavior
Ensure the render logic remains disciplined:
- no brittle assumptions
- safe fallbacks
- sensible category handling
- safe CTA behavior
- predictable archive behavior
- no premium surface failure when one editorial field is missing

### 6. Reduced-motion and accessibility
Respect reduced-motion behavior.
Confirm focus visibility and CTA usability remain intact after Wave 04 refinements.

---

## Manifest / seed-data requirement

Tune the manifest seed only as needed to show a representative premium newsroom render under:
- standard render
- sparse render
- fallback render

Do not turn the manifest into a fake content library.
Use just enough realistic demo content to make validation credible.

---

## Validation requirements

### Visual validation
- The premium hierarchy survives sparse content.
- The module does not visually collapse under partial data.
- Empty/invalid states remain coherent with the homepage family.

### Structural validation
- Lead, secondary, and tertiary zones do not break under missing inputs.
- CTA posture remains intentional.
- No major empty-space failure remains.

### Runtime validation
- Loading, empty, invalid, sparse, and partial states render safely.
- Reduced-motion behavior remains respected.
- The component still compiles cleanly.

### SharePoint realism validation
- The module remains stable in expected homepage placement contexts.
- It does not require unrealistic layout assumptions.

---

## Completion deliverables

When complete, provide:

1. a concise change summary
2. the list of changed files
3. a short explanation of how sparse-state and authoring resilience were improved without flattening the premium design
4. any remaining limitations or follow-up recommendations
5. confirmation that the code is ready for Wave 06 packaging/proof

---

## Final reminder

Wave 05 is about making the premium newsroom surface operationally trustworthy.
Do not reduce the design ceiling in order to pass sparse-state validation.
