# Wave 01 — Publisher shell cohesion closure

**Scope:** phase-12 / Prompt-01 — refine the editorial workspace shell and
cross-region cohesion so the Publisher no longer reads as three adjacent
admin cards but as one authored editorial workspace.

**Status:** closed.

## Shell structure preserved

The pre-existing three-region architecture and its seams were preserved
exactly:

- Left queue rail — `workspace/QueueRail.tsx` + `draftQueue/DraftQueue.tsx`
  (groups, error + reload, empty state, new-draft affordance).
- Center authoring canvas — sectioned panels: Identity, Hero, Story, Media,
  Team, Promotion, Destination binding, Preview. Anchor links and section
  IDs (`#section-*`) retained, `scroll-margin-top` updated for the sticky
  section navigator.
- Right readiness rail — readiness summary, binding signal, save-readiness
  block, blocking issues, warnings, `PublishReadinessDiagnostics`, primary
  actions (`PublisherButton`), workflow transitions, destructive-action
  zone, and `StatusBanner`. All capabilities retained.
- Controller ownership unchanged: `useDraftWorkspace`, `useDraftLifecycle`,
  `usePreviewController`, `useReadinessController`, `useStatusChannel`.

## Visual / compositional weaknesses corrected

Changes were limited to `article-publisher.module.css` (shell, canvas,
rails, section rhythm, breakpoints). Class names were not added, renamed,
or removed — the `.module.css.d.ts` surface and test surface are stable.

- **Three cards → one surface.** The canvas remains the white focal plane
  (now carrying `--hb-elevation-1` and softer `--hb-border-subtle`), while
  the left and right rails lose their card borders and radii. Rails now
  read as **aprons** to the canvas via single hairline dividers (rail-side
  border against the canvas), not as peer cards floating on a grey
  gutter.
- **Authored hierarchy in the center.** Canvas header title promoted to
  28px with tighter tracking; kicker ("Project Spotlight article") now
  uses `--hb-color-presentation-blue` for editorial voice; header padding
  widened so the masthead reads as an opening, not a thin divider.
- **Section navigator, not a chip strip.** `.sectionIndex` is now sticky
  within the canvas with pill-shaped anchor links; section dividers
  converted from faint `#f0f0f3` trailing rules to a single hairline
  *above* each section header with generous top padding — section
  transitions feel authored instead of merely separated.
- **Readiness as a continuous column.** Readiness blocks lost their pill
  backgrounds and inner borders; they now flow as a vertically divided
  column matching the canvas rhythm, which preserves legibility of
  blocking/warning signals without the "stack of little cards" posture.
- **Token adoption at the shell level.** Shell surfaces, borders, spacing,
  radii, elevation, and motion consume the existing
  `sharedChrome/tokens.module.css` variables (`--hb-surface-*`,
  `--hb-border-subtle`, `--hb-space-*`, `--hb-elevation-1`,
  `--hb-transition-fast`, etc.). Deep-panel hex retained intentionally;
  full tokenization migration is scoped to Prompt-02.

## Breakpoint ladder exercised

Intentional degradation rather than generic stacking:

| Range | Behavior |
| --- | --- |
| ≥1280px | Full three-column layout with generous canvas margins and editorial breathing room. |
| 1080–1279px | Columns compress (rails narrow, canvas margins tighten); three-region posture preserved. |
| 720–1079px | Readiness rail reflows under the two-column shell as a sticky, elevated bottom panel (`--hb-elevation-2`) pinned against the canvas — capability preserved, posture authored rather than grafted. |
| <720px | Single-column stack: queue rail (capped to 32vh with a lower divider) → canvas → readiness. Canvas keeps its masthead and sticky section navigator. |

Five shell states covered by the preserved controllers and confirmed against
the preserved class surface:

- no selected draft (canvas empty state, readiness empty state),
- selected draft (canvas masthead, section navigator, section rhythm),
- validation blockers (`canvasNoticeBlocking`, readiness blocking block),
- warnings (`canvasNotice`, readiness warning block),
- healthy publish-ready state (primary + transition actions, destructive
  zone preserved).

## Why this reads more editorial and less admin-like

The prior composition communicated "three utility panels beside each
other on a grey canvas." The revised composition communicates "one
editorial workspace with a central authored canvas, supporting queue and
readiness aprons." The canvas now carries elevation and the brand
editorial blue in its kicker; the rails recede and frame the work;
section transitions feel like editorial breaks, not generic admin
dividers. No SharePoint-shell mimicry, no new global chrome, and no
capability regression in either rail.

## Follow-up handed to later phase-12 prompts

- Prompt-02 — finish tokenization and delete stale hex debt in deep
  panels (field, chooser, preview, project-picker subsystems still carry
  literal hex).
- Prompt-03 — replace pseudo-iconography and harden toolbar/avatar
  microinteractions.
- Prompt-04 — close the preview/readiness trust loop internals.
