# Plan Summary — Wave 01 (Enhanced)

## Objective

Improve the Publisher where the live repo still suppresses adoption: first-draft speed, confidence before publish, queue momentum, and truthfulness about the product’s current runtime scope.

## Repo-truth enhancement decisions

1. **Keep Prompt 01 and strengthen it**
   - The project-binding truth gap is real and still open.
   - The search contract, helper copy, and selected-state identity all need tighter closure requirements.

2. **Keep the guided-authoring theme, but rewrite it as first-pass compose closure**
   - The repo already has progressive disclosure.
   - Wave 01 now needs a cleaner first-pass compose path, not a vague new mode for its own sake.

3. **Split preview/readiness into two prompts**
   - Preview truth and readiness diagnostics are related, but not the same closure unit.
   - The repo already separates them across different seams.

4. **Keep story-authoring work, but narrow it to the remaining real ergonomic gaps**
   - Rich text is already live.
   - The remaining work is about quality, coaching, flow, and accessible affordance refinement.

5. **Split team and media refinement**
   - They are distinct composer systems with distinct invariants and regression surfaces.

6. **Add a queue-momentum prompt**
   - The attached audit correctly identifies queue behavior as a Wave 01 issue.
   - The prior Wave 01 package omitted a dedicated closure prompt for it.

7. **Strengthen current-scope identity and destination truth**
   - The live product is broader in name than it is in current runtime support.
   - Wave 01 must leave that truth clean.

8. **Add a final proof prompt**
   - The prior package relied too heavily on per-prompt validation without a final end-to-end closure pass.

## Recommended prompt order

1. `Prompt-01-Close-project-binding-truthfulness-and-picker-search.md`
2. `Prompt-02-Recompose-the-first-pass-authoring-path.md`
3. `Prompt-03-Close-preview-source-of-truth-and-working-copy-confidence.md`
4. `Prompt-04-Strengthen-readiness-publish-diagnostics-and-next-action-clarity.md`
5. `Prompt-05-Upgrade-story-authoring-ergonomics-within-the-governed-schema.md`
6. `Prompt-06-Refine-team-composition-flow.md`
7. `Prompt-07-Refine-media-composition-flow.md`
8. `Prompt-08-Upgrade-the-queue-from-inventory-rail-to-momentum-tool.md`
9. `Prompt-09-Clean-up-current-scope-product-identity-and-destination-truth.md`
10. `Prompt-10-Prove-wave-01-closure-end-to-end.md`

## Why this sequence is correct

- **Prompt 01 first** because the project-binding step is foundational and still contains a real trust defect.
- **Prompt 02 second** because once binding is truthful, the default compose path can be simplified without building on a broken first step.
- **Prompt 03 before Prompt 04** because readiness language cannot be made fully truthful until preview source-of-truth is made explicit.
- **Prompt 04 after Prompt 03** because diagnostics and next-action language should narrate the final preview truth, not the pre-fix ambiguity.
- **Prompt 05 after preview/readiness** because body-authoring ergonomics should be improved against the clarified preview/trust loop.
- **Prompts 06 and 07 after the core compose loop** because team/media are secondary authoring flows and should refine, not destabilize, the primary path.
- **Prompt 08 after the core flow work** because queue momentum should reflect the improved workflow and next-action semantics, not an earlier state.
- **Prompt 09 near the end** because current-scope truth should reflect the actual post-remediation runtime, not the pre-remediation state.
- **Prompt 10 last** because Wave 01 closure must be proven across the integrated result.

## Cross-prompt dependencies that must be respected

- Prompt 02 must preserve section anchors, validation finding mapping, and readiness jumps used by Prompts 03 and 04.
- Prompt 03 must preserve the shared preview/publish composition logic; it must not fork publish rules.
- Prompt 04 must preserve save-state truth and must not narrate unsaved preview parity if Prompt 03 leaves preview saved-state-based.
- Prompt 05 must preserve the governed schema, paste sanitization, and existing safe formatting contract unless a change is explicitly validated.
- Prompt 06 must preserve teammate featured-state and sort-order invariants.
- Prompt 07 must preserve gallery featured-state and sort-order invariants and alt-text gating.
- Prompt 08 must preserve keyboard navigation, persisted collapsed-state/search state, and selection handoff.
- Prompt 09 must preserve the stable deployment GUID and current unsupported-destination runtime safeguards.

## Out of scope for this wave

- broad premium-stack adoption across all Publisher seams
- generalized iconography replacement unrelated to Wave 01 friction
- large CSS/token refactors that do not materially reduce author friction
- broad multi-destination implementation beyond what is necessary to leave the current release truthful
- packaging/publish pipeline refactors beyond what Prompt 10 needs for proof-of-closure
