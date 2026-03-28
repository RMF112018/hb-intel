# Financial Lane / Cross-Lane Contract Completion — Prompt 02
## Objective
Complete the second lane-ownership and cross-lane contract workstream for the Financial module by normalizing cross-lane navigation, handoff, launch, resume, and acceptance rules.

## Context
Prompt 01 should already be completed.
Use the updated lane-ownership doctrine and the Financial doctrine control index as the primary coordination points for this pass.

This is still a doctrine and contract pass, not a runtime implementation pass.

## Critical Guardrails
- Stay grounded in repo truth and actual plan language.
- Do not silently preserve contradictions; resolve them explicitly where repo truth allows, and flag them where it does not.
- Do not overclaim live implementation maturity.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make route-code, shell-code, or workflow-code implementation changes in this prompt unless a tiny non-functional doc-adjacent change is absolutely required.
- Do not blur navigation, launch, summary, and deep workflow behavior together. Be explicit.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Financial doctrine
- the Financial doctrine control index
- the updated lane-ownership doctrine from Prompt 01
- Financial route/context contract files
- Financial source-of-truth / action-boundary files
- Financial acceptance/readiness files that mention lane, launch, or handoff behavior

### Related cross-lane doctrine
- lane capability matrix files
- cross-lane navigation / handoff files
- project-context continuity / switching doctrine
- route and shell contract files
- lane-specific acceptance / staging files
- any ADRs or blueprint docs governing dual-lane coexistence

## Required Actions
1. Identify all Financial cross-lane movement patterns currently governed in the repo.
   - Determine:
     - launch-to-PWA rules from SPFx
     - native in-lane continuation rules
     - deep-link entry expectations by lane
     - role-based lane entry patterns
     - return / resume behavior after cross-lane launch
     - project / period / version context durability across lane changes

2. Identify all Financial handoff patterns that need explicit governance.
   - At minimum assess:
     - summary to deep-workflow transition
     - SPFx launch into PWA actionable surface
     - review / approval handoff across lanes if defined
     - publication / export initiation vs completion lane posture
     - history / audit investigative entry from non-primary lane surfaces

3. Normalize cross-lane contract rules.
   - Update the authoritative files so downstream implementers can answer:
     - when a user stays in-lane versus launches cross-lane
     - what context must survive the transition
     - what route state must be preserved
     - whether edit authority changes during the transition
     - whether re-entry must return users to the exact working state
     - what user-facing expectations and acceptance evidence apply

4. Normalize acceptance posture.
   - Tighten wording so acceptance files explicitly distinguish:
     - lane ownership complete
     - cross-lane launch complete
     - context durability complete
     - return / resume behavior complete
     - summary-only parity versus deep-workflow parity

5. Add explicit cross-references.
   - Ensure lane doctrine, route/context doctrine, and acceptance doctrine point to each other where needed.
   - Ensure the Financial doctrine control index clearly identifies the canonical cross-lane contract surfaces.

6. If needed, create one narrowly scoped reconciliation doc.
   - Only do this if the existing files cannot be made coherent without a dedicated decision surface.
   - Prefer a concise name such as:
     - `Financial-Cross-Lane-Handoff-and-Launch-Contract.md`
   - This must be concise, decision-oriented, and implementation-safe.

## Deliverables
1. Revised cross-lane navigation / handoff doctrine.
2. Revised lane-specific acceptance references where needed.
3. Updated Financial doctrine control index references.
4. A contradiction-resolution summary.
5. A clear list of any remaining unresolved cross-lane issues.

## Definition of Done
This prompt is complete only when:
- cross-lane launch and in-lane continuation rules are explicit,
- context durability across lane transitions is clearly governed,
- acceptance posture distinguishes lane parity from launch parity,
- lane doctrine and route/context doctrine no longer materially contradict the cross-lane rules,
- and downstream implementers can wire cross-lane behavior without guessing.

## Output Format
Return:
1. objective completed
2. files changed
3. cross-lane findings
4. handoff / launch rules normalized
5. contradiction resolutions made
6. unresolved issues / follow-ups
