# Phase 04 — Support Action Binding Notes

## 1. Binding Approach

### How help and access-request actions are selected and rendered

Support actions are now pre-derived in the normalization layer via `deriveSupportSummary()` and delivered as part of `LauncherPresentationModel.supportSummary`. The utility rail consumes these pre-derived arrays directly instead of filtering platform arrays at render time.

### Derivation chain

```
LauncherPlatformRecord[]
  → filterByAudience(platforms, activeAudience)
    → deriveSupportSummary(visible)
      → helpActions:     platforms where support.helpUrl exists
      → accessActions:   platforms where support.accessRequestUrl exists
      → supportContacts: platforms where support.supportOwnerName exists
    → LauncherSupportSummary
```

### Data flow

```
deriveToolLauncherPresentation()
  → presentation.supportSummary.helpActions      → NeedHelpSection
  → presentation.supportSummary.accessActions    → RequestAccessSection
  → presentation.supportSummary.supportContacts  → SupportContactsSection
  → presentation.noticesSummary.activeNotices    → NoticesSection
```

### Rendering treatment

| Section | Data source | Link label | Style | Icon |
|---------|-----------|------------|-------|------|
| **Need Help** | `supportSummary.helpActions` | "{name} Help" | CTA (blue, 500 weight) | ExternalLink 11px |
| **Request Access** | `supportSummary.accessActions` | "{name}" | CTA (blue, 500 weight) | ExternalLink 11px |
| **Support Contacts** | `supportSummary.supportContacts` | "{name} · {ownerName}" | Metadata (muted 0.75rem) | None |
| **Notices** | `noticesSummary.activeNotices` | "{name}" + badge | Metadata (status labels) | None |

Help links now include " Help" suffix in the label (e.g., "BambooHR Help") for clearer action context.

### Props simplification

`LauncherUtilityRail` now accepts only `presentation: LauncherPresentationModel` — the `platforms` prop was removed since all section data is pre-derived in the normalization layer.

## 2. Suppression Rules

### Section-level

| Section | Suppresses when |
|---------|----------------|
| Platform Notices | `presentation.noticesSummary.activeNotices.length === 0` |
| Need Help | `presentation.supportSummary.helpActions.length === 0` |
| Request Access | `presentation.supportSummary.accessActions.length === 0` |
| Support Contacts | `presentation.supportSummary.supportContacts.length === 0` |

### Rail-level

The entire rail returns `null` when all four pre-derived arrays are empty. The composition shell body grid collapses from `2fr 1fr` to `1fr`.

### Item-level

Each section renders at most **5 items** via `.slice(0, 5)`. Items beyond this limit are not rendered — no "show more" affordance exists yet (deferred).

### Row-level

Individual support-action rows suppress when their specific data is absent:
- Help row suppressed when `helpUrl` is missing (enforced by derivation)
- Access row suppressed when `accessRequestUrl` is missing (enforced by derivation)
- Contact row without `supportOwnerUrl` renders as plain text (non-navigable) instead of a link

## 3. Data Assumptions

### What the utility rail assumes the presentation model provides

| Field | Type | Source | Required |
|-------|------|--------|----------|
| `supportSummary.helpActions[].platformKey` | `string` | Normalized record | Yes — React key |
| `supportSummary.helpActions[].name` | `string` | Normalized record | Yes — link label |
| `supportSummary.helpActions[].helpUrl` | `string` | `support.helpUrl` | Yes — navigation target |
| `supportSummary.helpActions[].supportOwnerName` | `string?` | `support.supportOwnerName` | No — not currently rendered in help section |
| `supportSummary.accessActions[].platformKey` | `string` | Normalized record | Yes — React key |
| `supportSummary.accessActions[].name` | `string` | Normalized record | Yes — link label |
| `supportSummary.accessActions[].accessRequestUrl` | `string` | `support.accessRequestUrl` | Yes — navigation target |
| `supportSummary.supportContacts[].platformKey` | `string` | Normalized record | Yes — React key |
| `supportSummary.supportContacts[].name` | `string` | Normalized record | Yes — context label |
| `supportSummary.supportContacts[].supportOwnerName` | `string` | `support.supportOwnerName` | Yes — contact name |
| `supportSummary.supportContacts[].supportOwnerUrl` | `string?` | `support.supportOwnerUrl` | No — link vs text treatment |
| `noticesSummary.activeNotices[].notice.tone` | `UtilityBadgeVariant` | Normalized record | Yes — badge color |
| `noticesSummary.activeNotices[].notice.label` | `string` | Normalized record | Yes — badge text |
| `noticesSummary.activeNotices[].notice.details` | `string?` | Normalized record | No — detail line |

### What was added to the normalized seam

`LauncherSupportSummary` type and `deriveSupportSummary()` function added to the normalization layer. The utility rail no longer filters platform arrays directly — all support data is pre-derived alongside featured stage, workflow shelves, platform index, and notices.

## 4. Residual Debt

| Debt | Phase | Description |
|------|-------|-------------|
| "Show more" for sections with >5 items | Future | No overflow affordance exists; items beyond 5 are silently hidden |
| Help link with support-owner context | Future | `supportOwnerName` is available in `helpActions` but not rendered in the help section — could show "Contact: {owner}" |
| Favorites section | Future | Not yet implemented; requires persistence model |
| Recently-used tracking | Future | Not yet implemented; requires launch-event tracking |
| Support chat/ticket integration | Future | Out of scope for launcher utility rail |
| Interactive notice detail overlay | Future | Current inline detail text is sufficient for skeleton |
| Audience context wiring from SPFx | Runtime | `activeAudience` filters platforms before derivation, but the SPFx mount path doesn't yet extract audience from user profile |
