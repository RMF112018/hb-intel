# 02 — Closed Decisions and Target Posture

This file is the **decision register in prose form**. The implementation package is decision-closed. Do not reopen these decisions during execution unless repo truth makes one impossible.

## D-01 — Module Role

The Adobe Sign card is a:

> **compact, high-utility operational companion module**

It is not:

- a miniature Adobe Sign application;
- a replacement for Adobe’s full UI;
- a sibling equal in page authority to My Projects.

## D-02 — Relationship to My Projects

- **My Projects remains the dominant left-side module.**
- **Adobe Sign remains the secondary right-side operational module.**
- The existing My Projects / Adobe Sign row-sharing scheme remains in place.
- The Adobe card must **not** stretch to match My Projects height.

## D-03 — Card Naming

- Eyebrow: `Adobe Sign`
- Card title: `Agreement Activity`

The title is stable across views and states.

## D-04 — View Switch Naming

The two views remain:

- `Action Queue`
- `Completed`

## D-05 — View Switch Position

The view switch is:

- separate from the semantic card heading;
- placed below the title/status row;
- presented as a premium segmented/tabs-style switch.

## D-06 — View Switch Semantics

Use a manual-activation accessibility pattern:

- container: `role="tablist"`
- buttons: `role="tab"`
- panels: `role="tabpanel"`
- `aria-selected`
- roving `tabIndex`
- ArrowLeft / ArrowRight / Home / End move focus
- Enter / Space activate the focused tab

Manual activation is required so moving focus does not unintentionally trigger the lazy Completed fetch.

## D-07 — Card Status/Freshness Rail

A visible status/freshness rail must render.

### Active-view status chip

The chip reflects the active view's current state.

#### Action Queue mappings

| Queue State | Status Chip |
|---|---|
| loading | `Loading` |
| available-empty | `Ready` |
| available-items | `Ready` |
| partial | `Partial data` |
| authorization-required | `Connect required` |
| configuration-required | `Configuration required` |
| principal-unresolved | `Account needs attention` |
| source-unavailable | `Temporarily unavailable` |
| backend-unavailable | `Temporarily unavailable` |

#### Completed mappings

| Completed Panel State | Status Chip |
|---|---|
| idle | `Ready` |
| loading | `Loading history` |
| available-empty | `Ready` |
| available-items | `Ready` |
| partial | `Partial data` |
| authorization-required | `Authorization required` |
| configuration-required | `Configuration required` |
| principal-unresolved | `Account needs attention` |
| source-unavailable | `Temporarily unavailable` |
| backend-unavailable | `Temporarily unavailable` |

### Freshness label

Render freshness when a valid generated timestamp exists:

```text
Last refreshed {formatted UTC timestamp}
```

If no valid timestamp exists, suppress the freshness label rather than rendering a misleading placeholder.

## D-08 — Grid Height Posture

The Adobe card must be top-aligned and content-authored.

- Do not preserve row-height equalization if it causes a sparse Adobe card.
- Do not fill the card with decorative filler simply to occupy space.
- Fix the layout system so the card height reflects card content.

## D-09 — Current Span Overrides Stay Intact

Preserve the existing `MyWorkHomeSurface` span overrides during this effort:

### My Projects

```ts
phone: 1
tabletPortrait: 2
tabletLandscape: 6
smallLaptop: 8
standardLaptop: 6
largeLaptop: 7
desktop: 7
ultrawide: 7
```

### Adobe Sign

```ts
phone: 1
tabletPortrait: 2
tabletLandscape: 6
smallLaptop: 8
standardLaptop: 4
largeLaptop: 5
desktop: 5
ultrawide: 5
```

If Prompt 06 proves these spans are no longer viable after content hardening, stop and report rather than changing them silently.

## D-10 — `MyWorkCard.titleContent` Is Removed

Because `titleContent` exists only to embed the current Adobe switch in the heading, this remediation:

- removes `titleContent` from `MyWorkCard`;
- removes the related shared-card test;
- moves all Adobe header interactivity into the Adobe module itself.

## D-11 — Adobe-Specific Visual Grammar Is Local

Create module-local presentation primitives and CSS under the Adobe module. Do not pollute shared My Work card CSS with Adobe-specific selectors.

## D-12 — Row Interaction Model

Rows are not whole-row click targets.

Each row must have:

- clear title;
- clear metadata;
- explicit row action link when `sourceOpenUrl` exists.

Use an explicit textual action such as:

```text
Open
```

paired with an external-link icon only if the icon is available through existing governed exports.

## D-13 — No Synthesized Adobe URLs

Do not create or infer URLs. Preserve the existing rule:

- render row action only when backend/view-model provides `sourceOpenUrl`.

## D-14 — No Generic Card Footer Destination Is Added

Do not add a general `View all in Adobe Sign` footer unless a truthful existing card-level destination already exists in repo truth. This package assumes no such trusted general URL is currently available.

## D-15 — Preview-Limit Context Is Required

When total count exceeds visible preview count, render explicit preview context.

### Action Queue

```text
Showing {displayedCount} of {totalCount} agreements requiring action.
```

### Completed

```text
Showing latest {displayedCount} of {totalCount} completed agreements.
```

When visible count equals total count, suppress this line.

## D-16 — Completed Missing Metadata Treatment

Do **not** render repeated:

```text
Updated date unavailable
```

Use this deterministic fallback order:

1. If date exists, render date.
2. If date is absent but sender exists, render sender only.
3. If both date and sender are absent, render:

```text
Completion metadata not reported.
```

in a subdued secondary metadata style.

## D-17 — Action Queue Metadata Treatment

For action items:

- always render required action label;
- render sender only when present;
- render expiration only when present;
- do not emit empty separators;
- keep the Open action separate from metadata.

## D-18 — Completed Local Retry Is Required

The card owns the lazy Completed fetch. Therefore the Completed panel error/degraded fetch state must include a local:

```text
Retry
```

control that reattempts the completed read-model request.

This requires a hook-level retry/reset capability.

## D-19 — No Backend Contract Changes in This Package

This effort is UI/UX and card-owned interaction remediation.

Do not:

- edit Azure Functions;
- edit backend Adobe Sign parsers;
- revise backend route contracts;
- change live provider semantics.

If the UI exposes a backend-quality concern, document it as follow-up in the closeout report.

## D-20 — Copy Must Be Production-Ready

The copy deck in `docs/07_Copy_Deck_And_Content_Rules.md` is authoritative. Do not replace it with casual developer copy.

## D-21 — Dependency Scope

Do not add new direct dependencies to My Dashboard.

Use:

- existing app dependencies;
- existing `@hbc/ui-kit` exports where repo truth proves an export exists;
- native semantic HTML/CSS where no governed export is already available.

Do not alter:

- `package.json`;
- `pnpm-lock.yaml`;
- workspace dependency topology.

## D-22 — Flagship Acceptance Target

The final implementation targets:

```text
48+ / 56
```

with the preferred re-audit goal:

```text
50 / 56
```

No flagship claim is valid without validation/evidence closure.
