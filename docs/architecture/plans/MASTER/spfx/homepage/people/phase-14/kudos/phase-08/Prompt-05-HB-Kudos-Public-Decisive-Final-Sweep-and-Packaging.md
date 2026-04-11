# Prompt-05 — HB Kudos Public Decisive Final Sweep and Packaging

```md
Objective

Conduct the final decisive sweep, perform any remaining high-value fixes, generate a fresh package, and issue an honest production-readiness verdict.

Primary intent

This is the release-gate pass.

It should not preserve any remaining weak outcome out of inertia.

Critical Constraints

- Use live repo truth.
- Do not begin by re-reading files already in active context or memory.
- Maintain strict focus on the public Kudos surface and its directly supporting dependencies.
- Be rigorous, skeptical, and evidence-based.
- Maintain strict compliance with `@hbc/ui-kit`, doctrine, and SPFx packaging discipline.
- Do not declare readiness unless the rendered public product is visibly restored and the package is fresh.

Hard directives

1. Audit the final public rendered state.
2. Audit the final open-composer state.
3. Identify and fix any remaining small-to-medium issues that still materially weaken release readiness.
4. Validate final local/shared/ui-kit boundary correctness.
5. Run a fresh build/package flow.
6. Produce a final report that prioritizes visible product outcome over internal neatness.

Required deliverables

1. Any final implementation fixes genuinely needed.
2. Fresh package output.
3. Final audit report covering:
   - what was checked
   - what changed
   - what remains, if anything
4. Packaging report covering:
   - commands run
   - outputs produced
   - whether the package appears fresh and aligned with repo truth
5. Final readiness verdict using:
   - Ready
   - Ready with Minor Reservations
   - Not Ready
6. Plain statement of whether the public HB Kudos surface now visibly and credibly clears the intended production bar.

Acceptance standard

This prompt is successful only if the final rendered product is visibly stronger, the package is fresh, and the readiness verdict is honest.
```
