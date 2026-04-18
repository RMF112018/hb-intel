# Prompt-02 — Prove or complete the homepage page-canvas cutover

Use this in a fresh local code-agent session after Prompt-01 is complete.

```text
You are working in the live local HB Intel repo.

Primary repo:
https://github.com/RMF112018/hb-intel.git

Objective:
Using the authoritative mechanism established in Prompt-01, prove or complete the HBCentral homepage page-canvas cutover so the middle action layer uses PriorityActionsRail instead of OOB Quick Links.

Critical operating instruction:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Absolute scope lock:
- Do not address Project Spotlight.
- Do not widen into unrelated homepage cleanup.
- Do not redesign the shell.
- Do not stop at packaging proof.

Target tenant/page posture:
- Site: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`
- Target page: the live homepage canvas (typically `Home.aspx` unless repo-truth proves another canonical homepage page)
- Desired order:
  1. full-width HB Signature Hero
  2. standard/flexible section containing PriorityActionsRail
  3. full-width section containing hbHomepage

Primary task:
Interrogate the live homepage page canvas and take exactly one of these two paths:

Path A — Already cut over:
- Prove OOB Quick Links is not present in the action layer.
- Prove PriorityActionsRail is present in the correct page position.
- Prove the page is in the intended top-to-bottom order.
- Emit in-repo evidence and completion notes.

Path B — Not yet cut over:
- Backup/export the current homepage page-canvas state in the narrowest useful form.
- Remove the OOB Quick Links instance from the action layer.
- Add or position PriorityActionsRail in the correct action-layer section.
- Preserve or restore the intended order relative to hero and hbHomepage.
- Publish the page.
- Re-read the page canvas and prove the final state.
- Emit in-repo evidence and completion notes.

Implementation requirements:
- use device login for tenant-connected execution
- use repo-native automation; do not perform an undocumented one-off tenant mutation
- if the homepage has not been edited/published before and page-canvas contents are incomplete on first read, handle that condition correctly and continue until the actual canvas state can be inspected
- prefer deterministic matching of controls by component/instance identity over fuzzy display labels whenever available
- if multiple Quick Links instances exist, identify the one occupying the homepage action layer and remove only the incorrect control(s)
- if PriorityActionsRail already exists but is in the wrong position, reposition it rather than duplicating it
- avoid duplicate PriorityActionsRail instances unless repo-truth explicitly proves duplicates are intended

Explicitly forbidden shortcuts:
- claiming success because the webpart manifest exists
- claiming success because the package builds
- claiming success from a screenshot alone
- leaving OOB Quick Links on the page and calling it transitional
- saying the page authoring step should be done manually later

Required evidence to generate in the repo:
- before-state record of homepage controls/sections/orders
- after-state record of homepage controls/sections/orders
- explicit proof that Quick Links is absent from the target action layer after completion
- explicit proof that PriorityActionsRail is present in the target action layer after completion
- explicit proof that the page was published after mutation, if mutation occurred

Documentation updates required:
- update the relevant homepage/page-authoring/runbook docs so the cutover mechanism and expected canvas order are clearly documented
- state plainly that package/build proof is not sufficient for homepage cutover completion

Verification required:
- run the exact tenant-connected cutover/proof command end to end
- run any relevant targeted tests for touched automation seams
- run typecheck for the touched package(s) if code changed
- confirm the final homepage state in a rerunnable proof command, not just in the mutation command

Required final deliverables in your response:
1. which path was taken: already cut over or cutover completed
2. exact homepage before/after state in plain language
3. exact commands executed
4. file-by-file change list
5. validation performed and results
6. remaining risks, if any, strictly limited to this cutover seam
```
