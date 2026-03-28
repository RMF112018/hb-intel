# Financial SoR / Entity / Action-Boundary Completion — Prompt 02
## Objective
Complete the second source-of-truth / entity / action-boundary workstream for the Financial module by defining and normalizing action boundaries, mutation ownership, cross-tool write/read rules, and invalidation behavior across the Financial operating model.

## Context
Prompt 01 should already be complete.
Use the updated SoR / entity control surface as the primary coordination point for this pass.

This is still a doctrine and control-boundary pass, not a broad runtime implementation pass.

## Critical Guardrails
- Stay grounded in repo truth and actual plan language.
- Do not silently preserve contradictions; resolve them explicitly where repo truth allows, and flag them where it does not.
- Do not overclaim live implementation maturity.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make service-layer, repository, route, or UI implementation changes in this prompt unless a tiny documentation-adjacent cleanup is absolutely required.
- Do not blur read access, mutation authority, and publication authority into one ownership concept. Keep them distinct.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### SoR / entity control surfaces
- the SoR / entity control doc created or updated in Prompt 01
- Financial source-of-truth / action-boundary files
- Financial runtime model / aggregate files

### Tool-specific doctrine
- budget import governance
- forecast summary / checklist governance
- GC-GR governance
- cash flow governance
- buyout governance
- review / PER governance
- publication / export governance
- history / audit governance

### Related shared doctrine
- lane / cross-lane doctrine that affects mutation authority
- route/context doctrine where period / version / artifact context influences allowable actions
- acceptance/readiness files that mention review gates, stale state, publication eligibility, or operational ownership

## Required Actions
1. Identify the canonical action boundaries for each major Financial capability.
   - For each tool or capability, determine:
     - who can read
     - who can edit
     - who can confirm / submit / lock
     - who can review / return
     - who can approve / publish / release
     - what actions are blocked by state, role, period, version, or upstream changes

2. Normalize mutation ownership and write/read separation.
   - Make explicit the difference between:
     - authoritative source mutation
     - operational working-state mutation
     - derived recalculation
     - review-state transition
     - publication / export action
     - audit-only append behavior

3. Define cross-tool action rules.
   - Make explicit how actions in one capability affect others, including where applicable:
     - budget import invalidating forecast readiness
     - forecast changes impacting cash flow / publication candidates
     - checklist state blocking confirmation or publication
     - buyout impacts on forecasting or review posture
     - review / PER actions affecting version or publication status
     - publication actions creating immutable audit artifacts

4. Define stale-state, invalidation, and reopening rules.
   - Clarify what events cause:
     - stale working state
     - readiness invalidation
     - re-review requirements
     - blocked publication
     - reopening or rework
   - Ensure these rules are attached to specific boundaries, not left conceptual.

5. Tighten the doctrine package so a future implementer can answer:
   - what actions are allowed for each role in each state,
   - what boundaries separate draft / working / review / confirmed / published states,
   - which actions mutate canonical working state versus create derived artifacts,
   - and what downstream invalidation or audit consequences each action has.

6. Create or revise one focused control surface for action boundaries if needed.
   - Prefer updating the strongest existing file if it already serves this purpose.
   - If needed, create a concise file with a name like:
     - `Financial-Action-Boundary-and-Mutation-Control.md`
   - This must remain decision-oriented and implementation-safe, not narrative.

7. Update cross-references.
   - Ensure the Financial doctrine control index and SoR / entity control files point to the canonical action-boundary rules.
   - Ensure related route/lane/readiness docs reference these rules where they depend on them.

## Deliverables
1. Revised action-boundary doctrine.
2. Revised cross-tool mutation / invalidation doctrine where needed.
3. Updated SoR / entity control references.
4. A contradiction-resolution summary.
5. A clear list of any remaining unresolved action-boundary issues.

## Definition of Done
This prompt is complete only when:
- action boundaries are explicit across all major Financial capabilities,
- mutation authority, read authority, and publication authority are clearly distinguished,
- cross-tool invalidation and stale-state rules are implementation-safe,
- and the doctrine package gives downstream implementers clear permission and transition rules instead of conceptual guidance.

## Output Format
Return:
1. objective completed
2. files changed
3. action-boundary findings
4. mutation-ownership findings
5. contradiction resolutions made
6. unresolved issues / follow-ups
