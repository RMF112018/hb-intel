# 00 — Safety App Audit Summary

## Executive conclusion
The current Safety app is not merely under-polished. It is structurally miscomposed for flagship use.

The live repo shows a real domain workflow, a real repository layer, and a real route tree, but the UI layer is still behaving like a thin implementation scaffold. The result visible in the screenshots is not an isolated styling mistake; it is the predictable outcome of several deeper seams:

1. the app inherits a platform theme model without constraining whether this hosted surface should ever enter field/dark mode,
2. the route shell injects a raw button strip instead of a governed navigation surface,
3. page implementations bypass major portions of the `WorkspacePageShell` contract,
4. list and dashboard pages do not use the governed layout systems deeply enough,
5. loading / empty / error / no-result states are collapsed into the same weak visual posture,
6. raw tables and fixed four-column stat grids replace responsive product primitives,
7. the incidents route is deliberately a placeholder yet still ships in active navigation.

## Core architectural insight
The dark result is not just “bad styling.” `apps/safety/src/App.tsx` wraps the entire app in `HbcThemeProvider`, and the repo’s field-mode architecture explicitly states that every app root, including `apps/safety`, inherits the shared theme mode infrastructure. None of the Safety pages set `supportedModes`, so the Safety app is not constraining whether it should present in office-only or field-capable mode. That means the wrong theme can arrive as a platform-level inheritance outcome, not only as local CSS drift.

## What is genuinely strong
- Real route model exists for upload, periods, project-week detail, inspections, review, and incidents.
- Feature package is serious and domain-specific.
- Cross-site data model and ingestion state machine are explicit.
- The app does use `WorkspacePageShell`, query hooks, repositories, and typed domain seams rather than collapsing everything into a single file.
- The product intent is coherent: upload-first ingestion, review queue, inspection visibility, and project-week rollups.

## What is most damaging right now
- The visible shell feels like a dark simplified admin surface, not a premium safety workspace.
- Navigation is custom-rendered and visually primitive.
- Pages are using `WorkspacePageShell` only as a title wrapper instead of as the full governing page contract.
- Empty and loading semantics are weak or missing.
- Responsive behavior is mostly accidental because raw HTML tables and fixed grids bypass governed responsive primitives.
- The active scope includes a non-productized Incidents placeholder.

## Bottom line
The Safety app can be salvaged, but the fix is not “tighten spacing and lighten colors.” It requires:
- shell/navigation reconstruction,
- page-contract compliance with `WorkspacePageShell`,
- responsive table/list/detail rebuilds,
- state-model hardening,
- an explicit decision on supported theme/mode posture,
- and removal or completion of placeholder functionality.
