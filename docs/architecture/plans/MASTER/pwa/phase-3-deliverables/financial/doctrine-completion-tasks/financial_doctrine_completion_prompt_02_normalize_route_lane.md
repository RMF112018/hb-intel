# Financial Doctrine Completion — Prompt 02
## Objective
Complete the second doctrine-completion workstream for the Financial module by normalizing Financial route doctrine and lane doctrine so they are coherent across the Financial package, Project Hub doctrine, and cross-lane governance.

## Context
Prompt 01 should already be completed.
Use the newly created or updated Financial doctrine control index as the primary coordination point for this pass.

This prompt is still a doctrine pass, not a runtime implementation pass.

## Critical Guardrails
- Stay grounded in repo truth and actual plan language.
- Do not silently preserve contradictions; resolve them explicitly where repo truth allows, and flag them where it does not.
- Do not overclaim live implementation maturity.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not make route-code or shell-code implementation changes in this prompt unless a tiny non-functional doc-adjacent change is absolutely required.
- Do not blur PWA and SPFx into a generic “both” answer. Be explicit.

## Files to Inspect First
Inspect the repo directly and ground this pass in actual file content, especially:

### Financial doctrine
- the Financial doctrine control index created or updated in Prompt 01
- Financial route/context contract files
- Financial module posture / classification files
- Financial source-of-truth / action-boundary files
- Financial acceptance/readiness files that mention route or lane expectations

### Related Project Hub / lane doctrine
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- relevant project-context continuity / switching doctrine
- relevant route and shell contract files
- lane capability matrix files
- cross-lane handoff / navigation files
- lane-specific acceptance files
- any acceptance/readiness checklist files that encode route or lane posture

## Required Actions
1. Identify all Financial route doctrine currently in the repo.
   - Determine:
     - canonical project-scoped route family
     - canonical sub-routes for Financial tools
     - whether period / version / artifact context is route-safe
     - whether deep-link durability is sufficiently defined
     - whether return / resume / re-entry behavior is defined
     - whether project switching and draft safety are explicitly governed

2. Identify all Financial lane doctrine currently in the repo.
   - Determine, tool by tool where applicable:
     - canonical PWA ownership
     - canonical SPFx ownership
     - launch-to-PWA behavior
     - native in-lane behavior
     - read-only summary behavior
     - route / shell expectations by lane
     - lane-specific acceptance posture

3. Reconcile contradictions.
   - Normalize conflicts between:
     - Financial route doctrine
     - Project Hub route/context doctrine
     - lane capability doctrine
     - cross-lane navigation doctrine
     - acceptance/readiness doctrine
   - Where contradictions cannot be safely resolved, document them explicitly instead of hiding them.

4. Update the doctrine package so route and lane rules are implementation-safe.
   - Tighten wording so a future implementer can answer:
     - what the canonical Financial routes are
     - what route state must be durable
     - what happens on deep-link entry
     - what happens on project switch
     - which Financial workflows are PWA-native
     - which are SPFx-native
     - which are launch-to-PWA only
     - what evidence is required for lane-specific acceptance

5. Add explicit cross-references.
   - Make sure the Financial doctrine control index points to the canonical route and lane doctrine files.
   - Make sure route and lane files reference each other where needed.

6. If needed, create one narrowly scoped reconciliation doc.
   - Only do this if the existing files cannot be made coherent without a dedicated decision surface.
   - If created, prefer a name like:
     - `Financial-Route-and-Lane-Reconciliation.md`
   - This must not become a dumping ground; it must be concise and decision-oriented.

## Deliverables
1. Revised route doctrine.
2. Revised lane doctrine / cross-lane doctrine where needed.
3. Updated Financial doctrine control index references.
4. A contradiction-resolution summary.
5. A clear list of any remaining unresolved route/lane issues.

## Definition of Done
This prompt is complete only when:
- there is a clear canonical Financial route posture,
- there is a clear canonical Financial lane posture,
- route/context rules and lane rules no longer contradict each other materially,
- the doctrine package is implementation-safe for downstream route and lane work,
- and unresolved contradictions, if any, are explicit and bounded.

## Output Format
Return:
1. objective completed
2. files changed
3. route-doctrine findings
4. lane-doctrine findings
5. contradiction resolutions made
6. unresolved issues / follow-ups
