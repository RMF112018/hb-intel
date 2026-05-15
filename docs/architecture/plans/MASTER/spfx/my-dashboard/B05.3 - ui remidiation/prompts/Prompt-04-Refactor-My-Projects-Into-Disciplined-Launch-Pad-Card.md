# Prompt 04 — Refactor My Projects into Disciplined Launch-Pad Card

```markdown
# Objective

Refactor `My Projects` from a full-width, low-density module block into a disciplined launch-pad card that preserves launch utility while compressing empty/unavailable states and complying with the locked target information architecture.

# Repo-truth context

Start from Prompts 01–03.

Primary seams to inspect and likely change:
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.tsx`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.module.css`
- `apps/my-dashboard/src/modules/myProjects/MyProjectsHomeCard.test.tsx`
- `apps/my-dashboard/src/surfaces/home/MyWorkHomeSurface.tsx`
- `apps/my-dashboard/src/layout/myWorkFootprints.ts`
- `apps/my-dashboard/src/layout/MyWorkCard.tsx` only if current card APIs need a safe span/UX extension.

Relevant target authorities:
- `docs/02-Decision-Lock-And-Closed-Target-Posture.md`
- `docs/05-Target-Module-State-Matrices.md`
- `docs/06-Target-Copy-Library.md`

Do not reread files that are already in your active context unless they changed, context is stale, or scope expanded.

# Architectural guardrails

1. My Projects remains one card.
2. It must not consume the full desktop row in the final target posture.
3. Preserve project launch actions and source-of-record handoff to SharePoint/Procore.
4. Do not invent new row data, URLs, or assignment logic.
5. Do not turn empty/unavailable states into oversized report-like regions.

# Implementation instructions

Implement the My Projects card according to the closed target.

## Required identity
- Eyebrow: `My Work`
- Title: `My Projects`
- Support copy:
  `Open the projects you are assigned to in SharePoint or Procore.`

## Required metrics behavior
Retain the current summary metrics concept but compress it:
- display when usable records exist or data is partially populated;
- hide when there are no usable rows and the card is empty/unavailable/principal-unresolved;
- do not show four zero-value metric tiles merely because the data structure exists.

Metrics retained:
- Assigned Projects
- Dual Launch Ready
- SharePoint Ready
- Procore Ready

## Required project-row behavior
- Show top 5 rows by default.
- Preserve:
  - source badge;
  - project number;
  - project name;
  - project stage if available;
  - role chips with overflow;
  - SharePoint action;
  - Procore action.
- Disclosure labels:
  - `View all My Projects`
  - `Show fewer`

## Required state behavior
Follow exact copy/state treatment from:
- `docs/05-Target-Module-State-Matrices.md`
- `docs/06-Target-Copy-Library.md`

States:
- loading;
- available + zero assigned projects;
- populated;
- partial source / partially verified destinations;
- principal unresolved;
- source unavailable;
- backend unavailable.

## Required footprint posture
Do not hard-code `footprint="full"` as the final desktop behavior. Prepare the card to honor Prompt 05's locked bento choreography.

# Why the current implementation is insufficient

The current card reserves excessive page width and internal structure even when it has no actionable project rows. That visually overweights a low-density state and suppresses the dashboard rhythm.

# Required implementation outcome

After this prompt:
- My Projects is internally dense and launch-pad oriented;
- empty/unavailable states compress cleanly;
- populated state remains useful and direct;
- row disclosure count is 5;
- metric strip no longer inflates empty/failure states.

# What done really looks like

The card reads like a daily launch panel. When projects exist, it helps the user open them immediately. When none exist or source state is degraded, the card remains truthful without consuming disproportionate visual attention.

# Verification

Run:
```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
```

Update/add tests for:
- loading state;
- empty state compression;
- unavailable state compression;
- populated row count default = 5;
- disclosure behavior;
- metrics hidden when no usable rows exist.

# Documentation updates

No full README refresh yet.  
Reconcile inline comments/test descriptions that still justify full-width flagship posture as current target behavior.

# Deliverables / exit criteria

Return:

1. **Implementation Decision:** PASS / PARTIAL / BLOCKED
2. **Files inspected**
3. **Files changed**
4. **Final My Projects state handling**
5. **Metric/display compression summary**
6. **Row/disclosure behavior summary**
7. **Validation commands/results**
```
