# 01 — Package-to-Repo Mapping

## Mapping method

Each attached prompt was mapped to the actual live seams in `main`, then evaluated for:

- mapping accuracy
- present-tense validity
- depth
- sequencing
- missing dependencies
- whether the prompt should be preserved, rewritten, split, merged, or replaced

## Mapping table

| Attached file | Intended repo seams | Mapping accuracy | Still valid in `main`? | Assessment | Action |
|---|---|---|---|---|---|
| `Plan-Summary.md` | command-band phase planning, wave sequencing, dependency posture | Partial | Partially | Correct that styling/validation/hosted proof remain open. Incorrect to assume all structural preconditions are already closed. | Rewrite completely. Remove the “wave-01 already done” dependency assumption and absorb unresolved structural work into the new package. |
| `Prompt-01-Tokenize-and-Premiumize-Priority-Rail-Styling.md` | `packages/ui-kit/src/HbcPriorityRail/priority-rail.module.css`, `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/priority-actions-rail-admin.module.css`, related token aliases | Accurate but narrow | Yes | The styling gap is real, but the prompt is too thin and is sequenced too early if used alone. It cannot close styling truth while the shared surface and admin model still trail the spec. | Preserve intent, split scope. Fold surface-behavior rebuild into Prompt 03 and retain styling closure as Prompt 05. |
| `Prompt-02-Harden-Validation-and-Config-Runtime-Coherence.md` | `priorityActionsValidation.ts`, `priorityActionsNormalization.ts`, `priorityActionsContracts.ts`, `packages/ui-kit/src/HbcPriorityRail/types.ts`, icon/helper seams | Accurate but materially under-scoped | Yes | Correct theme, but too shallow. It does not capture structural write-trust, preview parity, config query drift, layout-mode truth, grouping, icon execution, or silent normalization loss. | Split and expand into Prompt 01 and Prompt 04. |
| `Prompt-03-Hosted-Validation-and-Closure-Proof.md` | manifests, runtime entry seams, proof-case seams, closure docs | Accurate | Yes | Hosted proof remains mandatory. However the prompt is under-scoped because repo docs already claim closure, so truthful hosted-proof work must include correcting stale closure docs and verifying manifest/runtime drift. | Preserve intent, rewrite as Prompt 06. |

## Additional prompt coverage that the attached package omitted

The attached package omitted entire closure units that are still required in `main`:

### A. Structural write trust
Repo truth shows the admin still saves items by array position against `resolvedItems[i]?.id`, while a dedicated reorder writer exists but is not used. This is not safe enough for clean closure.

### B. Admin maintainer-product uplift
The spec requires a maintainer-grade authoring workflow. The live admin is still a largely monolithic form/editor and does not integrate its permission model or a fully structured authoring IA.

### C. Shared/public surface fidelity
The shared surface family still does not implement the spec-grade breakpoint, grouping, or overflow model. This cannot be hand-waved as mere validation work.

### D. Preview/runtime parity
The admin preview is not driven by the same full resolution pipeline as the public runtime.

### E. Closure-doc correction
The repo already contains closure artifacts that read as if phase-02 is essentially complete. Those docs are now part of the problem because they can mislead future work unless corrected.

## Mapping conclusion

The attached package correctly identified three real themes, but it under-modeled the number of closure units required to execute them truthfully.

The improved package therefore:

- preserves the themes
- expands the prompt count
- corrects the sequence
- adds missing closure units
