# Prompt 07 — Produce Hosted Validation Evidence and a Real Closure Report

## Objective
Finish the remediation with hosted validation evidence and a structured closure report that is strong enough to reject superficial completion.

## Why this work exists
The attached packages ask for proof, but not strongly enough. A local code agent can sound finished without actually proving closure.

This prompt removes that ambiguity.

## Governing authority
Use:
- `07-Proof-Plan-and-Hosted-Validation-Matrix.md` from this package
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

## Required hosted validation cases
At minimum, validate and report:
- standard laptop baseline
- ultrawide desktop
- tablet landscape
- tablet portrait
- phone portrait or equivalent narrow-width state
- short-height constrained state if supported by the available harness/tooling

## Required closure report structure
Your final report must include these exact sections:
1. **Outer Envelope Authority**
2. **Inner Inset Policy**
3. **Measurement Model**
4. **Wrapper-Owned Actions Region Boundary**
5. **Diagnostics Added or Changed**
6. **Tests Added or Updated**
7. **Hosted Validation Evidence**
8. **Residual Risks**
9. **Final Closure Statement**

## What the final closure statement must say
It must explicitly state whether the original defect class — a visible screenshot-class right-edge host-fit failure — is still reproducible after the changes.

If it is still reproducible, do not claim closure.

## Done means
Done means:
- the code is changed
- the tests are changed
- hosted cases were validated
- the closure report is complete
- residual risks are honest and bounded
- the defect class is either closed or clearly declared still open

## Prohibitions
- Do not provide a vague completion summary.
- Do not omit hosted evidence.
- Do not bury residual risks.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
