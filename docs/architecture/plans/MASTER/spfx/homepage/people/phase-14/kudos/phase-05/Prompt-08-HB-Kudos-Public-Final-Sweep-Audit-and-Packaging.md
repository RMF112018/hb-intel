# Prompt-08 — HB Kudos Public Final Sweep Audit and Packaging

```md
Objective

Conduct a thorough final-sweep audit and packaging pass for the **updated public-facing HB Kudos webpart application**.

Primary Intent

Pressure-test the completed public HB Kudos work as a real SharePoint-hosted product surface, close any final small gaps that block credible release readiness, and produce a fresh packaged deliverable with disciplined evidence that the package reflects current repo truth.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain a strict UI-first focus on the **public HB Kudos webpart** and its directly supporting public-surface dependencies.
- Keep the audit skeptical, explicit, and evidence-based.
- Maintain strict compliance with `@hbc/ui-kit`, `docs/reference/ui-kit/`, homepage doctrine, package-boundary expectations, and current SPFx packaging discipline.
- Do not soften findings to force closure.
- Do not claim strict compliance where only partial closure exists.
- Do not treat successful compilation as proof of product readiness.

Primary Scope

This prompt should perform a final pass across:
- the public-facing HB Kudos webpart
- its directly supporting shared public-surface UI dependencies
- any ui-kit promotions or local/shared boundary changes introduced by Prompts 01–07
- manifests, shell wiring, exports, and packaging paths required for the updated public surface to ship correctly
- fresh build and `.sppkg` generation for the updated application package

What This Prompt Must Do

1. Audit the final state of the public HB Kudos UI implementation as rendered product, not just code structure.
2. Verify that the implementation remains aligned with the intent of the prior remediation work and has not regressed through accumulation, compromise, or packaging drift.
3. Identify and correct any final small-to-medium issues that materially weaken:
   - composition
   - premium hierarchy
   - archive/recent-recognition quality
   - composer flow quality
   - recipient entry quality
   - responsive behavior
   - accessibility polish
   - ui-kit governance compliance
   - package/build integrity
4. Rebuild the relevant package output and ensure the packaged deliverable reflects current repo truth.
5. Produce a concise but rigorous final audit-and-packaging report.

Required Final-Sweep Audit Dimensions

Audit the final updated public HB Kudos surface for:

- rendered compositional authority
- premium presentation-lane quality
- top-band / featured recognition coherence
- archive / browse quality and subordination
- CTA hierarchy and action clarity
- composer flow efficiency and polish
- recipient-selection / recipient-entry quality
- focus, keyboard, and interaction polish
- reduced-motion and responsive resilience where applicable
- zoom resilience for normal SharePoint viewing conditions
- local-vs-shared UI discipline
- appropriateness of any new or moved ui-kit surface/primitives
- manifest correctness
- shell/mount/export correctness
- build freshness
- packaged `.sppkg` freshness and inclusion correctness

Packaging Expectations

The packaging pass must include, as applicable:

- validation that the correct public HB Kudos implementation is still the one wired into the relevant mount/shell path
- validation that required manifests and exports are present and correct
- a fresh rebuild of the appropriate SPFx/webpart package
- confirmation that the resulting package includes the updated public HB Kudos assets and current implementation state
- explicit note of any remaining packaging uncertainty if full proof is not achievable

Required Deliverables

1. Implement any final sweep fixes that are genuinely needed.
2. Build/package the updated application deliverable fresh.
3. Produce a final audit report covering:
   - what was checked
   - what was fixed in the final sweep
   - what remains, if anything
4. Provide a packaging report covering:
   - build/package commands run
   - outputs produced
   - whether the package appears fresh and aligned with repo truth
5. Provide a final readiness assessment using:
   - Ready
   - Ready with Minor Reservations
   - Not Ready
6. State plainly whether the public HB Kudos surface now credibly clears the intended product bar.
7. If anything remains partial, list it directly and do not hide it.

Important Rules

- Be rigorous, not optimistic.
- Prefer explicit findings over vague reassurance.
- Do not treat “looks cleaner” as equivalent to “clears doctrine.”
- Do not declare readiness unless the rendered public surface, packaging, and repo wiring all support that conclusion.
- If ui-kit promotions or shared-surface moves created new architectural debt, call that out.
- If the package is fresh but the UI still underdelivers, say so directly.
- If the UI is strong but packaging proof is weak, say so directly.

Acceptance Standard

This prompt is successful only if the agent completes a credible final-sweep audit, performs any truly necessary last-mile fixes, generates a fresh package, and produces an honest final verdict on whether the updated public HB Kudos webpart is actually ready to ship.
```