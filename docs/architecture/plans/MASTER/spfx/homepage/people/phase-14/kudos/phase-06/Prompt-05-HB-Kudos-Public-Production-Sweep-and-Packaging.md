# Prompt-05 — HB Kudos Public Production Sweep and Packaging

```md
Objective

Conduct the final production-readiness sweep for the updated public HB Kudos webpart, perform any truly necessary last-mile fixes, and generate a fresh packaged deliverable with an honest readiness verdict.

Primary intent

This is the release-gate pass for the public Kudos surface.

It should validate the work from Prompts 01–04, close any remaining small-to-medium production blockers, and prove package freshness/alignment.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict UI-first focus on the public HB Kudos webpart and its directly supporting public-surface dependencies.
- Be rigorous, skeptical, and evidence-based.
- Maintain strict compliance with `@hbc/ui-kit`, homepage doctrine, and SPFx packaging discipline.
- Do not claim readiness unless both the rendered product and the package state support that conclusion.
- Do not treat clean compilation as sufficient.

What this prompt must do

1. Audit the final public HB Kudos rendered product after Prompts 01–04.
2. Verify that the featured surface, archive, composer, and host-aware footer behavior now credibly clear the intended product bar.
3. Identify and fix any remaining small-to-medium issues that still materially weaken release readiness.
4. Validate manifest/export/mount/package wiring required for the public webpart to ship correctly.
5. Run the fresh build/package flow for the updated application package.
6. Produce a concise but rigorous final audit-and-packaging report.

Required audit dimensions

Audit the final public Kudos state for:
- featured recognition integrity
- public-surface compositional quality
- archive quality and subordination
- host-aware composer/footer resilience
- focus and interaction polish
- accessibility confidence
- theme/manifest posture
- local/shared/ui-kit governance correctness
- mount/export correctness
- package freshness
- packaged inclusion correctness

Required deliverables

1. Implement any final last-mile fixes that are genuinely needed.
2. Build/package the updated deliverable fresh.
3. Produce a final audit report covering:
   - what was checked
   - what was fixed in the sweep
   - what remains, if anything
4. Produce a packaging report covering:
   - commands run
   - outputs produced
   - whether the resulting package appears fresh and aligned with repo truth
5. Issue a final readiness assessment using:
   - Ready
   - Ready with Minor Reservations
   - Not Ready
6. State plainly whether the public HB Kudos surface now credibly clears the intended production bar.

Acceptance standard

This prompt is successful only if the agent completes a credible final-sweep audit, generates a fresh package, and issues an honest final verdict on whether the updated public HB Kudos webpart is actually production ready.
```
