# Prompt-03 — Lock proof, regression guard, and operator runbook

Use this in a fresh local code-agent session after Prompt-02 is complete.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Lock the homepage page-canvas cutover into a durable proof-and-regression posture so the repo can repeatedly prove that the live homepage uses PriorityActionsRail instead of OOB Quick Links.

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Absolute scope lock:
- Do not address Project Spotlight.
- Do not widen into unrelated homepage enhancements.
- Do not redesign the page.

Primary task:
Convert the completed homepage cutover work into a stable operational guardrail.

Required work:
1. Add or refine a rerunnable proof command that inspects the homepage page canvas and fails loudly when any of the following are true:
   - OOB Quick Links is present in the target action layer
   - PriorityActionsRail is absent from the target action layer
   - the hero / action layer / hbHomepage order is incorrect
2. Ensure the proof command is documented for normal operators.
3. Ensure the proof output is crisp enough that a future regression is obvious.
4. Add any targeted tests feasible for the automation seam so repo drift is caught earlier.
5. Update docs/runbooks/README material so a future operator knows exactly how to:
   - inspect the homepage
   - re-apply the cutover if needed
   - verify completion

Preferred outcome:
- a single clear operator command for proof
- a single clear operator command for cutover/re-apply
- a concise runbook showing expected success output

Do not accept these weak outcomes:
- proof depends on manual portal clicks only
- proof is embedded only in a long narrative doc
- regression detection depends on visual memory
- commands exist but are undocumented

Verification required:
- run the proof command after implementation and show it succeeds against the intended state
- if feasible, intentionally exercise a narrow non-destructive validation path so the failure messaging is trustworthy
- run typecheck/tests for touched code

Required final deliverables in your response:
1. exact proof command
2. exact re-apply command
3. short operator runbook summary
4. file-by-file change list
5. verification performed and results
6. explicit statement that Project Spotlight scope was not touched
```
