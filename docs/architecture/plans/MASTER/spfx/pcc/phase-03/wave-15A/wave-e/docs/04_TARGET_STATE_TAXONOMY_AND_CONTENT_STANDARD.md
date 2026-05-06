# 04 — Target State Taxonomy and Content Standard

## Purpose

Define the Wave E target taxonomy and the minimum content fields required for product-grade state messaging.

## State Taxonomy

| Target kind | Meaning | Severity | Required fields | Approved primary language pattern | Forbidden pattern |
|---|---|---|---|---|---|
| `live` | Connected data and permitted actions are available. | success/info | `title`, `summary`, `source`, `lastUpdated`, `actions` | "Live project data is available. Actions are enabled for your role." | "Connected fixture" |
| `preview` | Sample/reference data demonstrates intended workflow without live updates. | info | `title`, `summary`, `whatIsDisabled`, `why`, `nextAction` | "This view demonstrates the intended workflow using sample project data. Live updates are not being made." | "Fixture-driven" / "mock-only" |
| `readOnly` | Information can be reviewed but edits/execution are disabled. | info | `title`, `whatIsAvailable`, `whatIsDisabled`, `why`, `nextAction` | "You can review this information. Updates are disabled for this view." | "No workflow execution enabled" |
| `unavailable` | Source or capability is not available for current project/context. | neutral/warning | `title`, `whatIsAvailable`, `whatIsDisabled`, `why`, `owner`, `nextAction` | "This source is not connected for the selected project." | "Preview content not available" |
| `setupRequired` | Configuration, mapping, permission, or source setup is missing. | warning | `title`, `why`, `owner`, `nextAction` | "Configuration is required before this control can be activated." | "No fixture content available" |
| `degraded` | Data is visible but incomplete, stale, partial, or lower-confidence. | warning | `title`, `summary`, `why`, `lastUpdated`, `source`, `nextAction` | "Data is available, but source confidence is reduced. Review the warning before relying on this result." | "Envelope confidence warning" |
| `blocked` | Workflow cannot proceed until a required issue is resolved. | warning/error | `title`, `why`, `owner`, `nextAction`, `actions` | "This process is blocked until the listed issue is resolved." | "Not yet implemented" when the issue is operational |
| `error` | App/source failed unexpectedly. | error | `title`, `summary`, `why`, `nextAction`, `owner` | "This information could not be loaded. Retry or contact the listed owner if the issue continues." | Stack traces or backend identifiers in primary UI |
| `empty` | Valid source/view has no records. | neutral | `title`, `summary`, optional `nextAction` | "No items match this view." | Using empty to hide missing configuration |
| `loading` | Data is being loaded. | neutral | `title`, `summary` | "Loading the latest information." | Skeletons with no accessible busy state |

## Required State Object Fields

A normalized state object should support at least:

```ts
type PccOperationalStateKind =
  | 'live'
  | 'preview'
  | 'readOnly'
  | 'unavailable'
  | 'setupRequired'
  | 'degraded'
  | 'blocked'
  | 'error'
  | 'empty'
  | 'loading';

interface PccOperationalStateContent {
  kind: PccOperationalStateKind;
  severity: 'success' | 'info' | 'neutral' | 'warning' | 'error';
  title: string;
  summary: string;
  whatIsAvailable?: string;
  whatIsDisabled?: string;
  why?: string;
  nextAction?: string;
  owner?: string;
  source?: string;
  lastUpdated?: string;
  diagnosticDetail?: string;
}
```

The local agent may implement this as a wrapper, alias map, const catalog, or narrow extension of existing `PccPreviewState`. Do not force a disruptive rename if the current state primitive is already broadly used and tested.

## Current-to-Target Mapping Recommendation

| Current `PccPreviewStateKind` | Target alias |
|---|---|
| `preview` | `preview` / `readOnly` depending surface context |
| `empty` | `empty` |
| `loading` | `loading` |
| `error` | `error` |
| `missing-config` | `setupRequired` |
| `unavailable-fixture` | `unavailable` |
| `unauthorized-persona` | `blocked` / authorization constraint |
| `not-yet-implemented-operation` | `readOnly` or `blocked` depending action |

## Forbidden Primary User-Facing Language

Do not use the following in primary user-facing UI:

- Fixture-driven
- Fixture default
- No live data
- Mock-only
- Preview content not available
- No fixture content available
- Read-model summary only
- Read-model available
- Runtime envelope timestamp
- Envelope confidence
- Pending envelope
- Not connected in this prompt
- Wave 2 / Wave 15A / Prompt 05
- Preview-safe
- Inert preview
- Implementation placeholder
- Route coverage
- Shell frame

Allowed locations for these terms:

- tests;
- developer docs;
- admin-only diagnostics;
- source comments;
- closeout files;
- intentionally hidden instrumentation data, provided it is not visible to users or screenshot evidence.

## Copy Requirements

Every non-live state must answer, where relevant:

1. What is visible or available.
2. What is disabled or unavailable.
3. Why it is disabled/unavailable/degraded.
4. What happens next.
5. Who owns resolution.

## Accessibility Requirements

- `loading` state must expose `aria-busy` or equivalent.
- `error` state should expose `role="alert"` only where the error is significant and user-actionable.
- Disabled controls must expose visible reason text and accessible relation through `aria-describedby` or equivalent.
- State help must not be hover-only.
- State content must remain readable at SharePoint-constrained widths.
