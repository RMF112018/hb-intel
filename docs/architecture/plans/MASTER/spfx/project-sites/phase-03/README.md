# Combined Project Sites Responsive Audit + Implementation Package

This package consolidates the enhanced **repo-truth audit** and the enhanced **local-code-agent implementation prompts** into one working set.

It is intended to replace the previously separated audit and prompt packages with a single package that can be reviewed, staged, and executed in order.

## Package objective

Use this package to:

1. understand what the prior attached packages got right,
2. understand what they missed, overstated, or left too shallow,
3. use the audit files as the authoritative responsive findings register for the Project Sites surface,
4. execute the implementation prompts in the correct closure order.

The package is grounded in the live `main` branch of `RMF112018/hb-intel` and assumes the current Project Sites implementation already includes:

- a measured-container layout-mode seam,
- a three-mode contract (`wide`, `medium`, `compact`),
- a short-height compact override,
- supporting tests and closure documents.

This means the old framing that Project Sites had **no breakpoint contract at all** is no longer repo-truth. The real remaining work is to make the contract more explicit, more durable, and more product-quality across tablet, compact, sparse-wide, and host-fit conditions.

## Combined structure

### `/Audit`
Authoritative analysis of the current repo state and the deficiencies in the prior attached package set.

Files included:

- `00-Enhanced-Audit-Summary.md`
- `01-Package-Vs-Repo-Truth-Assessment.md`
- `02-Current-Responsive-Architecture-Map.md`
- `03-Expanded-Findings-Register.md`
- `04-Responsive-Enhancement-Strategy.md`
- `05-Implementation-Waves-and-Closure-Order.md`
- `06-Dependencies-Patterns-and-Development-Concepts.md`
- `07-Research-References.md`

### `/Implementation-Prompts`
Execution package for the local code agent.

Files included:

- `Plan-Summary.md`
- `Prompt-01-Refresh-Responsive-Contract-and-Mode-Responsibilities.md`
- `Prompt-02-Stabilize-Container-State-and-Short-Height-Behavior.md`
- `Prompt-03-Recompose-Medium-Tablet-Control-Band.md`
- `Prompt-04-Harden-Compact-Control-Band-and-Filter-Ergonomics.md`
- `Prompt-05-Introduce-Card-Density-Variants.md`
- `Prompt-06-Recompose-Sparse-Wide-and-Ultrawide-Grid-Behavior.md`
- `Prompt-07-Reduce-First-Screen-Overhead-and-Host-Fit-Risk.md`
- `Prompt-08-Refresh-Breakpoint-Evidence-Tests-and-Validation-Matrix.md`

## What changed relative to the earlier split packages

This combined package keeps the same enhanced content, but removes the duplicated package-level READMEs and replaces them with this single operating README.

The substantive posture remains:

- repo truth over prior package authority,
- tighter issue decomposition,
- symbol-level file targeting,
- clearer distinction between refinement and structural redesign,
- stronger proof-of-closure language,
- explicit sequencing for local code-agent execution.

## Most important repo-truth conclusions

1. **The current implementation is not pre-breakpoint-contract.**
   The repo already contains a measured container-state seam and existing breakpoint closure evidence. The current issue is not absence of a contract, but insufficiency and coarseness of the current one.

2. **The remaining gaps are primarily product-quality and layout-behavior gaps.**
   The most important work now is medium-mode control-band composition, compact filter ergonomics, card-density behavior, sparse wide-screen balance, and first-screen host fit.

3. **The old package framing merged too many issues.**
   Several issues that should be independently executable closure units were previously grouped too broadly, leaving too much interpretation burden on the code agent.

4. **Closure needs stronger validation than unit tests alone.**
   The combined package expects code-level validation, responsive-mode evidence, and hosted-behavior proof rather than relying only on “tests passed.”

## Recommended reading order

1. `/Audit/00-Enhanced-Audit-Summary.md`
2. `/Audit/01-Package-Vs-Repo-Truth-Assessment.md`
3. `/Audit/03-Expanded-Findings-Register.md`
4. `/Audit/05-Implementation-Waves-and-Closure-Order.md`
5. `/Implementation-Prompts/Plan-Summary.md`
6. prompts `01` through `08` in order

## Recommended execution order for the local code agent

Execute prompts in this order unless repo drift forces a justified adjustment:

1. `Prompt-01-Refresh-Responsive-Contract-and-Mode-Responsibilities.md`
2. `Prompt-02-Stabilize-Container-State-and-Short-Height-Behavior.md`
3. `Prompt-03-Recompose-Medium-Tablet-Control-Band.md`
4. `Prompt-04-Harden-Compact-Control-Band-and-Filter-Ergonomics.md`
5. `Prompt-05-Introduce-Card-Density-Variants.md`
6. `Prompt-06-Recompose-Sparse-Wide-and-Ultrawide-Grid-Behavior.md`
7. `Prompt-07-Reduce-First-Screen-Overhead-and-Host-Fit-Risk.md`
8. `Prompt-08-Refresh-Breakpoint-Evidence-Tests-and-Validation-Matrix.md`

## Working rules for use with the local code agent

- Use the audit files as the authoritative explanation of the issue model.
- Use the implementation prompts as the execution contract.
- Do not let the code agent drift into backend, auth, provisioning, or list-schema work unless a prompt explicitly names the seam as relevant.
- Do not allow the code agent to treat existing partial responsiveness as sufficient closure.
- Preserve truthful launch-state messaging and current loading / empty / error-state integrity unless a prompt explicitly requires a tightly bounded responsive change.
- Do not re-read files already in active context unless drift, dependency confirmation, or uncertainty requires it.

## Closure standard

This package should be treated as successful only when the resulting Project Sites implementation demonstrates:

- explicit and durable responsive-mode responsibilities,
- stable container-aware behavior across wide, medium, compact, and short-height states,
- improved tablet and compact control usability,
- better card-density adaptation,
- better sparse wide / ultrawide composition,
- reduced first-screen host-fit overhead,
- refreshed evidence and validation artifacts aligned with actual end-state behavior.

## Note on dependencies and concepts

The audit references modern responsive implementation concepts that may be selectively adopted where justified, including:

- stronger container-aware layout responsibility,
- better density-variant discipline,
- more deliberate progressive disclosure for filters and metadata,
- stronger responsive test coverage and validation evidence.

These concepts are included to improve remediation quality, not to encourage casual dependency churn.
