# 02 — Package-vs-Repo Gap Assessment

## Audit method
This assessment compares the attached package claims against the current live seams, not against prior summaries.

## What the attached audit package judged correctly
### Correct judgment 01 — preserve the ownership model
The attached audit package is right to preserve the wrapper/shell boundary. The live code supports that choice.

### Correct judgment 02 — preserve the shell logic seams
The attached package is right that the shell’s orchestration seams are worth keeping. `breakpointPolicy.ts`, `slotComfortResolver.ts`, `firstLaneResolver.ts`, and `shellConformance.ts` are directionally strong and should not be thrown away.

### Correct judgment 03 — current proof is inadequate
The attached package is right that wrapper-order proof is not enough. The current proof surface is too narrow for a host-fit closure claim.

## Where the attached audit package is too weak or too absolute
### Weakness 01 — it treats box-model leakage as more proven than it is
The attached package correctly notices that the wrapper and shell roots declare `width: 100%` and add padding in nearby seams. It is weaker where it treats “missing local `border-box`” as if that alone fully proves the hosted failure.

Repo-truth correction:
- it is fair to say these seams do not currently declare a **local** border-box guarantee
- it is not strong enough to say that alone explains the entire defect
- the stronger repo-truth statement is that the current fit model is too dependent on shell-root sizing details, which is exactly the kind of pattern that makes hosted drift hard to reason about

### Weakness 02 — it does not separate outer envelope authority from inner inset policy cleanly enough
The current repo comments explicitly justify a narrower actions-strip inset than the shell modules below it. The attached package pushes toward unification, but it does not say clearly enough that:
- the **outer fit contract** should be singular, while
- **inner insets** may still differ deliberately by region

That missing distinction makes the existing prompts somewhat brittle.

### Weakness 03 — it underplays the measurement seam
The attached package mentions `useShellContainer.ts`, but the upgraded package needs to treat it as one of the most important closure seams because that width value drives:
- entry-state resolution
- short-height posture
- pairing vs stacking
- conformance outputs

### Weakness 04 — it is not strict enough about inspectable width truth
The attached package asks for proof, but it does not force the code agent to surface enough inspectable state to prove:
- outer envelope width
- usable width after insets
- entry-state selection reason
- whether a given layout state came from authoritative width or a shell-self-measurement artifact

### Weakness 05 — prompt count is too conservative
The four-prompt structure is neat, but it is probably too compressed for clean closure. The live repo needs clearer separation between:
- outer envelope correction
- inner inset policy clarification
- measurement rebasing
- actions-region containment
- inspectable diagnostics
- unit/integration proof
- hosted validation evidence

## What the attached prompt package did well
- It uses assertive language.
- It generally targets the right seams.
- It protects the shell-only scope boundary.
- It avoids child-surface redesign drift.

## What the attached prompt package did not do strongly enough
- It did not force a clear conceptual model for outer envelope vs inner gutter policy.
- It did not explicitly require the code agent to define “what is the single authoritative width source now?”
- It did not force richer diagnostics.
- It did not require a sufficiently explicit hosted validation matrix.
- It did not require a closure report strong enough to reject fake completion.

## Upgrade decision
The replacement package should keep the original direction but tighten the closure model substantially.
