# 00 — Enhanced Audit Summary

## Phase 1 — Framing

### What the attached package is
The attached `wave-01` package is a starting hypothesis, not implementation authority.

It contains three prompts that point at real problem areas:
1. broken admin identity / reorder trust
2. incomplete admin authoring workflow and permission states
3. underpowered shared priority-rail surface family

Those prompts are directionally correct, but they are not sufficient as the final execution package.

### What the live repo is
The live `main` branch is the implementation source of truth.

The repo already contains much more infrastructure than the attached package implies:
- typed contracts
- list descriptors
- list read seams
- write seams
- normalization pipeline
- public/admin webparts
- shared `HbcPriorityRail` surface family
- validation and draft-state modules
- closure documents that claim code-side completion

This means the enhancement audit is not about inventing the subsystem from scratch.
It is about closing the remaining behavioral, architectural, UX, and proof gaps that still prevent truthful end-state closure.

### Narrowed objective
This package focuses only on the Priority Actions command-band workstream.

It does not broaden into unrelated homepage work except where a dependency is genuinely required to close the wave correctly.

### Research posture
This audit incorporated external guidance relevant to:
- menu-button / disclosure / button accessibility patterns
- responsive component behavior and container-aware layout
- React state identity and reset behavior
- SharePoint web-part accessibility and keyboard expectations

The research materially affects the rewritten prompts, especially around overflow behavior, keyboard semantics, preview fidelity, and authoring-state correctness.

### No-deferral posture
The enhanced package does not preserve “pending hosted validation” or “non-blocking later” language for in-scope gaps.

If a gap materially affects correctness, UX trust, doctrine compliance, accessibility, or closure proof, it is pulled into this package now.

---

## Top-line conclusion

### What the attached package got right
The original package correctly identified the three most visible load-bearing problem clusters:
- admin identity / reorder trust
- admin authoring incompleteness
- weak public/shared command-band expression

### What the attached package got wrong
It under-scoped the work in four important ways:

1. **It treated the repo like it still needed core architecture work.**
   That is no longer true. The architecture is largely present; the remaining failures are in how those seams are used and proven.

2. **It failed to add a dedicated contract / validation hardening prompt.**
   Repo truth shows that several contract fields and validation cases are declared but not truly enforced.

3. **It failed to add a public-runtime / preview alignment prompt.**
   The current public webpart and admin preview do not honestly express the full authored config model.

4. **It failed to add a token-discipline / hosted-proof closure prompt.**
   The code still contains hardcoded styling and the closure docs overstate completion relative to actual behavior.

### Most important repo-truth findings
- `PriorityActionsRailAdmin` still maps persisted IDs to draft array index during save, which is unsafe after reorder/add/remove.
- The dedicated reorder write seam exists, but the admin save flow does not use it.
- Archive behavior is immediate and outside a coherent save/discard lifecycle.
- The permission model exists in the data layer but is not integrated into runtime UX.
- The config contract supports `segmented`, `hybrid`, and `sheet-trigger` modes, but the public surface and preview do not honestly implement that breadth.
- The surface family type layer exposes grouping concepts, but the surface API is still effectively flat.
- CSS in both the shared surface family and admin surface still contains hardcoded values and “tinted card” treatments that weaken doctrine compliance.
- Closure docs mark code-side closure as passed while hosted proof is still missing and material behavioral gaps remain.

### Package decision
The final package should **rewrite all three original prompts** and **add three more**.
Three prompts are not enough.
