Use this in a fresh local code-agent session.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Critical operating instruction:
Do not re-read files that are already in your current context or memory unless needed to resolve uncertainty or verify drift.

Execution standard:
This prompt is part of a multi-prompt package. Stay tightly scoped to this prompt, but do whatever is required inside scope to reach a real finished state. Do not defer required work. If a boundary, diagnostic, or validation item is necessary for this prompt to be complete, address it now.

Objective:
Prove or complete the **actual flagship homepage page-canvas cutover** so the embedded rail is the authoritative homepage action layer and the page no longer risks duplicate action surfaces.

Absolute scope lock:
- This prompt is only about homepage page-canvas truth and cutover/proof.
- Do not widen into unrelated homepage redesign.
- Do not redesign Project Spotlight or other unrelated modules.

Inspect first:
- `docs/architecture/plans/MASTER/spfx/home-wrapper/phase-06/wave-01a/01-Prompt-Establish-Authoritative-Cutover-Mechanism.md`
- `docs/architecture/plans/MASTER/spfx/homepage/phase-01/Homepage-Per-Webpart-Contract-Reference.md`
- `docs/how-to/administrator/sharepoint-page-authoring-guide.md`
- `tools/pnp-runner-local/**`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRailWebPart.manifest.json`
- `apps/hb-webparts/src/mount.tsx`
- any existing homepage page-provisioning / extraction / page-inspection seams that are actually relevant

Current issue:
After embedding the rail inside `HbHomepage`, the work is not complete unless the real homepage page canvas is proved to be in the correct state.

Failure modes to prevent:
- wrapper-owned embedded rail + separate standalone rail both present
- wrapper-owned embedded rail + OOB Quick Links still present as the de facto action layer
- page ordering not actually matching intended top-to-bottom sequence
- docs with no executable proof path

Intended future state:
There is one authoritative, repo-native mechanism that can:
- inspect the flagship homepage page canvas
- identify OOB Quick Links if present
- identify standalone `PriorityActionsRail` if present
- distinguish “already cut over” from “requires cutover”
- mutate the page canvas if required
- support device-login-authenticated execution where tenant-connected work is needed

Required implementation:
1. Use the existing repo-native cutover/proof mechanism if it already exists.
2. If it exists but is incomplete, extend it now.
3. If it does not exist, create the narrowest correct new seam now.
4. Lock the chosen seam in documentation as the authoritative homepage cutover/proof mechanism.
5. Ensure the final implementation or proof is rerunnable and ideally idempotent.

Acceptance criteria:
- executable inspection path exists
- executable mutation path exists if needed
- the mechanism can distinguish:
  - OOB Quick Links
  - standalone rail webpart
  - target authoritative state
- homepage order can be proved
- the final report states whether the homepage was already cut over or needed cutover

Validation required:
- prove the seam can inspect the homepage page canvas
- prove it can detect the target action-layer state
- run relevant tests / validation for touched tooling
- document exact commands

What done looks like:
There is no ambiguity left about how homepage page-canvas truth is inspected or corrected, and the flagship homepage can be proved free of duplicate or legacy action layers.
```