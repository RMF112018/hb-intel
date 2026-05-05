# 05 — Test and Validation Plan

## Objective

Define required test and validation gates for Wave B.

## Baseline Commands

Run before changes and after each implementation prompt where appropriate:

```bash
git status --short
md5 pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center build
```

For docs-only changes:

```bash
pnpm exec prettier --check <changed markdown files>
```

## Focused Test Coverage to Add or Update

| Area | Required Assertions |
| --- | --- |
| Shell frame | Shell renders compact header/context/nav/canvas; markers remain stable; no duplicate active panel. |
| Project context | Context band renders on every active surface; includes project identity, active surface, source confidence. |
| Navigation grouping | Groups render in target order; surfaces remain in target order within groups; all eight routes reachable. |
| Active nav | Active item has `aria-current="page"`; visual state marker is present; status/risk cue is not color-only. |
| Keyboard | Arrow keys move focus within grouped nav; Home/End work; Enter/Space activates; focus does not trigger route changes. |
| Responsive nav | Expanded/icon/top-strip/narrow modes all preserve navigation access. Phone mode must not hide navigation without an accessible disclosure/alternative. |
| Search/command | Retained command control is properly disabled/read-only with accessible label/reason; no misleading primary path. |
| Host fit | Add static checks only where practical; visual/tenant evidence remains primary. |
| Cross-surface routing | Project Home, Team & Access, Documents, Project Readiness, Approvals, External Systems, Control Center Settings, Site Health route/render inside the updated shell. |

## Suggested Existing Test Areas to Inspect

```text
apps/project-control-center/src/PccApp.test.tsx
apps/project-control-center/src/tests/PccBentoGrid.footprints.test.tsx
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.states.test.tsx
apps/project-control-center/src/tests/PccTeamAccessSurface.test.tsx
apps/project-control-center/src/tests/PccDocumentsSurface.test.tsx
apps/project-control-center/src/tests/PccProjectReadinessSurface.test.tsx
apps/project-control-center/src/tests/PccApprovalsSurface.test.tsx
apps/project-control-center/src/tests/PccExternalSystemsSurface.test.tsx
apps/project-control-center/src/tests/PccSiteHealthSurface.test.tsx
```

## Required Evidence Before Wave B Closeout

- Passing typecheck.
- Passing PCC test suite.
- Passing build.
- Prettier check on changed docs.
- Screenshot index completed or tenant evidence gap logged.
- Hard-stop checklist completed.
- Scorecard categories updated with Wave B impact only.

## Prohibited Validation Claims

- Do not claim 56/56.
- Do not claim tenant readiness without tenant screenshots or a documented tenant-run result.
- Do not accept source-only host-fit closure.
