# 03 — Future-State Gap Register

| ID | Gap | Severity | Why it matters | Recommended direction | Scale |
|---|---|---|---|---|---|
| G-01 | Manifest / prompt promise host-page Year + `yearOverride`, but live runtime ignores shell config | Critical | Core trust model is broken | Implement explicit year-context contract end-to-end | Structural redesign |
| G-02 | Project Sites mount ignores the shell’s third runtime-config argument | Critical | Dead authoring/runtime seam blocks host-controlled behavior | Extend mount signature and consume config deliberately | Structural redesign |
| G-03 | Shell property pane exposes no Project Sites settings even though the manifest declares `yearOverride` | High | Authoring semantics are misleading | Either expose and honor the setting or remove it | Refinement |
| G-04 | `useProjectSites()` fetches full raw list items with no `$select` | High | Payload, drift, and hidden contract problems remain | Stabilize an explicit repository adapter | Structural refinement |
| G-05 | `All Projects` depends on bounded full-list fetch + client-side search/filter/sort | High | Works today but is not a strong long-term authoritative model | Keep hybrid UX, strengthen repository seam and boundedness rules | Structural refinement |
| G-06 | Launch-state inference is too coarse (`siteUrl` + narrow stage mapping) | Critical | Can mislead users about what is live, archived, or broken | Introduce explicit launch-state model | Structural refinement |
| G-07 | Card identity is too thin for portfolio-scale confident choice | High | Similar projects can remain ambiguous | Expand identity metadata and hierarchy | Refinement |
| G-08 | Malformed / partial-data records are normalized silently | High | Users cannot tell bad data from real lifecycle state | Add explicit data-quality semantics and messaging | Refinement |
| G-09 | No explicit access-confidence treatment | Medium | Users may click into permission failures with no warning | Add non-speculative access cues; do not invent filtering | Refinement |
| G-10 | Breakpoint behavior is viewport-based but not contract-defined | High | Updated doctrine requires explicit practical-usable-space governance | Add breakpoint spec and compact-mode behavior | Refinement |
| G-11 | UPN labels rely on `humanizeUpn()` heuristic | Medium | User labels can look approximate rather than authoritative | Add people display resolution seam where feasible | Refinement |
| G-12 | Closure docs prove prior improvements, but not the future-state standard requested here | Medium | Acceptance evidence is incomplete for this end-state | Capture new host-fit and breakpoint validation after implementation | Refinement |
