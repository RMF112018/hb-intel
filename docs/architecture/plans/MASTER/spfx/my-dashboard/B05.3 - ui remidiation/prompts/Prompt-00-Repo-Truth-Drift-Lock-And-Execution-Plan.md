# Prompt 00 — Repo-Truth Drift Lock and Execution Plan

```markdown
# Objective

Conduct the mandatory repo-truth drift lock for the My Dashboard UI posture reset before runtime edits begin. Confirm the current implementation still materially matches the package's baseline audit, identify any drift since package generation, and produce the exact execution map for Prompts 01–07 without reopening the locked product decisions.

# Repo-truth context

Target repository:
- `RMF112018/hb-intel`
- Work against current `main` unless the user explicitly directs otherwise.

Primary package authorities to read first:
- `PACKAGE_MANIFEST.md`
- `README.md`
- `docs/02-Decision-Lock-And-Closed-Target-Posture.md`
- `docs/03-Comprehensive-Target-UI-Posture.md`
- `reference/Implementation-Guardrails.md`
- `reference/Repo-Truth-Inspection-Seams.md`

Primary repo seams to inspect:
- `apps/my-dashboard/src/MyDashboardApp.tsx`
- `apps/my-dashboard/src/shell/MyWorkShell.tsx`
- `apps/my-dashboard/src/shell/MyWorkPrimaryNavigation.tsx`
- `apps/my-dashboard/src/shell/MyWorkSurfaceRouter.tsx`
- `apps/my-dashboard/src/shell/MyWorkHeroBand.tsx`
- `apps/my-dashboard/src/state/myWorkHeroViewModel.ts`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/modules/adobeSign/`
- `apps/my-dashboard/src/modules/myProjects/`
- `apps/my-dashboard/src/layout/`
- `apps/my-dashboard/src/state/myWorkCardViewModel.ts`
- `apps/my-dashboard/README.md`

Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

# Architectural guardrails

1. This is a drift-lock and execution-map prompt, not the first implementation prompt.
2. Do not reopen any decision locked in `docs/02-Decision-Lock-And-Closed-Target-Posture.md`.
3. Do not modify runtime code in this prompt unless the user explicitly authorizes a tiny documentation-only note or unless a package instruction file itself is being updated outside repo code.
4. Do not mutate external systems, tenant configuration, OAuth settings, or backend data.

# Implementation instructions

Perform the following in order:

1. Record:
   - branch;
   - HEAD;
   - working tree cleanliness;
   - whether current `main` contains the expected My Dashboard shell/navigation/header/module structure.

2. Inspect the seams listed above and confirm whether the following baseline assertions remain materially true:
   - visible tab/dropdown product model exists;
   - focused Adobe route exists;
   - hero telemetry pattern exists;
   - home surface still branches ready/non-ready into fragmented cards;
   - Adobe remains split across home card / queue state / connection guidance / focused surface;
   - My Projects still uses full-width footprint or equivalent dominant full-row behavior;
   - app README is stale or outdated relative to current runtime.

3. Produce a drift ledger:
   - `No material drift`
   - or `Material drift detected`
   - list exact differences that alter prompt execution.

4. Produce a prompt-by-prompt execution map for Prompts 01–07:
   - likely files to change;
   - files to inspect but not necessarily change;
   - dependencies;
   - implementation risks;
   - validation to run after each prompt.

5. Identify any repo-truth seam that must be added to the later prompt scope because it was not present in the package baseline.

6. Do not generate new product decisions. Preserve the closed target posture.

# Verification

Run non-mutating inspection commands appropriate to the repo. At minimum report:
- branch/HEAD;
- whether the working tree is clean;
- whether package-target files exist;
- whether tests appear to cover the soon-to-be-rejected architecture.

You may run typecheck/test commands only if needed to determine current baseline health, but do not require full validation in this prompt.

# Documentation updates

No repo documentation update is required in this prompt. Output a structured drift-lock report in the chat only, unless the user explicitly asks for a file.

# Deliverables / exit criteria

Return:

1. **Validation Decision:** `PASS` or `PASS WITH DRIFT NOTES` or `BLOCKED`
2. **Branch / HEAD**
3. **Repo-truth checks performed**
4. **Material drift ledger**
5. **Prompt 01–07 execution map**
6. **Any additional seams the later prompts must inspect**
7. **Confirmation that no locked product decision was reopened**
```
