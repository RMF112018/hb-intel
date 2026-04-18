# Prompt-01 — Establish the authoritative homepage cutover mechanism

Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Establish the single authoritative mechanism in the repo that will be used to prove or complete the HBCentral homepage page-canvas cutover from OOB Quick Links to PriorityActionsRail.

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Absolute scope lock:
- This prompt is only about homepage page-canvas cutover.
- Do not touch Project Spotlight.
- Do not widen into unrelated homepage work.
- Do not redesign layout rules beyond what is needed to complete or prove the cutover.
- Do not stop at build/package verification.

Repo-truth assumptions to honor:
- PriorityActionsRail already exists as a real homepage webpart.
- The homepage is intentionally composed as separate webparts.
- The missing proof is page-canvas reality, not merely package existence.

Mandatory authority to inspect first:
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/homepage/entryStack/entryStackOrchestration.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRailWebPart.manifest.json`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Per-Webpart-Contract-Reference.md`
- `docs/how-to/administrator/sharepoint-page-authoring-guide.md`
- `tools/pnp-runner-local/scripts/invoke-pnp-extraction.ps1`
- any existing homepage page-provisioning, page-template, XML shell, or Site Pages automation seams you find that are actually relevant

Primary task:
Determine the best repo-native mechanism to own homepage page-canvas cutover and then implement whatever is missing so that mechanism is authoritative and executable now.

Required decisions:
1. Identify whether an existing PnP runner / page automation seam already supports homepage page inspection and mutation.
2. If such a seam exists but is incomplete, extend it now.
3. If no suitable seam exists, create the narrowest correct new seam now.
4. Lock the chosen mechanism in documentation so there is no ambiguity about how homepage cutover is performed or proven.

Required output of this prompt:
- a concrete implementation seam in the repo that can inspect the homepage page canvas
- a concrete implementation seam in the repo that can be used by the next prompt to mutate the homepage page canvas if needed
- documentation stating this is the authoritative cutover/proof mechanism for the homepage action layer

Non-negotiable standards:
- device login must be supported for tenant-connected execution
- the implementation must be rerunnable and idempotent where feasible
- the mechanism must distinguish between “already cut over” and “requires cutover”
- the mechanism must be able to identify OOB Quick Links on the homepage canvas and identify PriorityActionsRail on the homepage canvas
- the mechanism must preserve the intended top-to-bottom homepage order

Do not accept these failure modes:
- “PriorityActionsRail is in the toolbox, so the work is done.”
- “We can visually inspect it later.”
- “The page can be updated manually outside the repo.”
- “The script only partially identifies page controls.”
- “We added docs but no executable proof path.”

Verification required:
- prove the chosen seam can inspect the homepage page canvas
- prove it can distinguish the target action layer state
- run typecheck/lint/tests for touched packages where appropriate
- provide a concise report that names the chosen mechanism and why it is authoritative

Required final deliverables in your response:
1. concise summary of the mechanism selected or created
2. file-by-file change list
3. exact commands available after your changes
4. validation performed and results
5. any narrow residual risks that truly belong only to the next prompt
```
