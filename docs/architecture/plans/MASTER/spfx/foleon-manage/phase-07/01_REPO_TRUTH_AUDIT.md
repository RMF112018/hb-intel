# 01 — Repo-Truth Audit

## Executive Finding

The Manager is technically real, typed, packaged, and security-aware. It is not yet a world-class content operations console. The hosted screenshot confirms the dominant experience remains card-heavy, diagnostics-forward, form-forward, and too abstract for a marketing content manager.

## What Works

- The app has a credible orchestration layer with explicit loading, blocked, error, and ready states.
- The Function App API seam is typed and routed through bearer-token authorization.
- Backend routes are action-scoped across view, edit, publish, place, sync, and admin operations.
- Package metadata includes the delegated API request for `HB SharePoint Creator / access_as_user`.
- The app preserves redacted diagnostics and readiness gates.
- It already uses parts of the premium stack: `motion`, `lucide-react`, Radix tooltip/separator/scroll-area, CVA, and `clsx`.
- Disabled write/sync states generally explain why they are blocked.

## What Is Confusing

- The first impression answers “is the backend configured?” before “what content needs attention?”
- “Content library” is below the fold and secondary; it should be the primary content inbox/queue.
- The lane model appears as a narrow rail rather than a real control board.
- The right rail combines readiness, metrics, placement management, and blocked form controls.
- The selected lane center panel contains large blank space when no content exists.
- Labels such as reader key, homepage slot, archive group, placement key, sync health, and registry status leak internal implementation into the primary workflow.
- The app looks structurally similar to an admin dashboard and not like a marketing-friendly content operations tool.

## User Workflow Breakdown

### Current Implied Workflow

1. Select a homepage lane from the left rail.
2. Read status cards in the middle.
3. Use a placement form in the right rail.
4. Scroll to the content library to search content.
5. Select a content record.
6. Use a long metadata form to edit/validate/publish.
7. Open diagnostics when something breaks.

### Required Workflow

1. Review available Foleon content in an inbox.
2. Identify new, unassigned, staged, blocked, and live records.
3. Select content.
4. Review readiness.
5. Assign it to a homepage lane.
6. Confirm placement and display timing.
7. Validate.
8. Preview employee-facing result.
9. Publish/activate.

## Visual Hierarchy Assessment

The current hierarchy is technically ordered but weak for the task:

- Header is oversized relative to the value it delivers.
- Lanes are small cards in a left rail; they should be the editorial operating model.
- Readiness score is visible but divorced from the next decision.
- Content discovery is visually subordinate.
- Empty states create excessive blank canvas.
- The composition still reads as a thin-border, white-card grid with brand tint.

## Interaction Assessment

- Lane selection works conceptually.
- Keyboard affordances exist in the lane rail.
- Disabled actions show reasons, which should be preserved.
- The main interaction is still form editing rather than workflow progression.
- Preview is not central.
- Publish/placement confirmation is not treated as a serious editorial control.
- Sync is exposed as a backend command, not a content operations action.

## State-Model Assessment

Strong technical coverage exists, but state language and presentation are not sufficiently user-centered.

Professional states needed:

- New content available.
- Ready to place.
- Needs review.
- Blocked by Foleon source issue.
- Blocked by HB Central placement issue.
- Blocked by backend/admin issue.
- OAuth missing but lane model usable.
- Graph/list ready but no Foleon content synced.
- Staged next.
- Live now.
- Scheduled.
- Sync in progress.
- Sync failed with recovery path.

## Accessibility Assessment

Positive:

- Semantic buttons and ARIA labels exist in several areas.
- Lane rail supports arrow-key movement.
- Disabled actions use explanatory text.

Gaps:

- The future preview/drawer workflow needs formal focus trapping and restore-focus behavior.
- Disabled-looking controls must never become dead CTAs.
- Hidden/compact regions must not contain focusable descendants.
- Keyboard flow needs explicit acceptance tests across content inbox, lane board, placement workflow, and preview.
- `prefers-reduced-motion` coverage must be verified for all `motion` usage.

## Breakpoint / Shell-Fit Assessment

- Current breakpoint logic is viewport-based.
- It does not appear container-aware enough for SPFx nesting.
- The wide three-column grid can produce strained panels, excess whitespace, and weak focal order.
- The current screenshot at 33% zoom shows the entire surface but also exposes composition weakness: large inactive center space, small controls, and insufficient editorial focus.

## Backend / Data-Contract Assessment

Strong foundation:

- Typed frontend DTOs exist for content, placements, sync status, validation, and errors.
- The Function App owns backend Graph/list operations.
- The backend uses OAuth for Foleon sync and Microsoft Graph for SharePoint list persistence.
- Authorization routes are scoped by action and role family.
- Safe-config and readiness gates are preserved.

Gap:

- The UI needs additional typed view models that translate DTOs into content-operations concepts:
  - inbox status,
  - lane fit,
  - readiness reason,
  - recommended action,
  - preview availability,
  - placement conflict,
  - display-window state.

## Hosted / Runtime Risk Assessment

- The uploaded package shows the expected Foleon SPFx package identity and delegated permission request.
- The hosted screenshot confirms the source changes are shipping, but not solving the product problem.
- Hosted validation must include package asset proof, runtime proof, and visual screenshot proof across states and breakpoints.
