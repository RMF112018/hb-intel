# Architecture and Ownership Audit Result — HB Kudos People Picker

## Mandatory Findings

### 1. Query input behavior

**Current owner:** `packages/ui-kit/src/HbcKudosComposer/index.tsx` — `HbcKudosComposerPeopleBucket` (lines 492–750). Local `query` state, `handleInputChange`, and the `<input>` combobox are all owned here.

**Parallel implementation:** `packages/ui-kit/src/HbcPeoplePicker/index.tsx` (lines 211–451). Independent `query` state and `<input>` combobox with identical role/aria pattern.

### 2. Search dispatch

**Current owner (invocation):** `HbcKudosComposerPeopleBucket` — debounced `useEffect` at line 522 calls `searchPeople(trimmedQuery)` after 300ms.

**Current owner (adapter):** `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` — `searchSharePointPeople()` dispatches `ClientPeoplePickerSearchUser` POST.

**Parallel implementation:** `packages/ui-kit/src/HbcPeoplePicker/index.tsx` — independent debounced `useEffect` at line 236 calls `searchPeople(query.trim())` after 300ms.

**Graph adapter:** `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts` — `useGraphPeopleSearch()` queries Graph `/users` endpoint. Not currently used by HB Kudos.

### 3. Response parsing

**Current owner (SharePoint):** `useSharePointPeopleSearch.ts` — `extractPrincipalPayload()` handles three SP response shapes, then maps `ClientPeoplePickerResult` to `PersonEntry { upn, displayName, jobTitle?, department? }`.

**Current owner (Graph):** `useGraphPeopleSearch.ts` — maps Graph `/users` response `value[]` to the same `PersonEntry` shape.

### 4. Ranking/filtering

**Current owner:** Both picker implementations apply identical selected-item filtering (exclude already-selected UPNs). No explicit human-name-first ranking layer exists in either path. Result ordering depends entirely on the backend response.

### 5. Result rendering

**Current owner (Kudos):** `HbcKudosComposerPeopleBucket` lines 725–741 — renders `pickerOption` divs with `pickerOptionName` (displayName) and `pickerOptionMeta` (upn + jobTitle). No avatar/photo rendering.

**Parallel implementation:** `HbcPeoplePicker/index.tsx` lines 427–448 — renders `option` divs with `optionName` (displayName) and `optionMeta` (upn + jobTitle). No avatar/photo rendering.

### 6. Chip/token selection

**Current owner (Kudos):** `HbcKudosComposerPeopleBucket` lines 677–694 — renders `bucketChip` spans keyed by UPN string, with display name from a local `nameCache` Map. Remove button per chip.

**Parallel implementation:** `HbcPeoplePicker/index.tsx` lines 370–390 — renders `chip` spans keyed by `person.upn`, showing `person.displayName`. Remove button per chip.

### 7. Avatar rendering

**Current owner:** Neither picker implementation renders photo/avatar in search results or selection chips. Avatar display is absent from the picker path entirely.

### 8. Kudos-specific vs. durable reusable UI

**Kudos-specific concerns (must remain local):**
- SPFx site URL resolution and request digest acquisition (`useSharePointPeopleSearch.ts`)
- Kudos draft shape bridging (`individualEmails: string[]` stored as UPN strings)
- Webpart orchestration, submit flow, and state management (`HbKudos.tsx`)
- Typed recipient bucket taxonomy (teams, departments, projects) — non-picker text entry

**Durable reusable UI (must become shared):**
- Search input behavior (query state, combobox, aria pattern)
- Debounced search dispatch invocation
- Selected-item filtering
- Keyboard navigation (ArrowUp/Down, Enter, Escape, Backspace)
- Result row rendering (name + metadata)
- Selection chip rendering and removal
- Loading/empty/error status messages
- Outside-click dismiss
- Avatar/photo display in results (not yet implemented anywhere)

### 9. Correct durable package boundary

**Decision:** `packages/ui-kit/src/HbcPeoplePicker/` is the correct shared lane. It already exists, already owns types (`PersonEntry`, `PeopleSearchFn`), already has a Graph adapter, and already has a component implementation with the same architectural shape. Creating a second shared picker would violate the locked invariant.

### 10. Correct export boundary for homepage/SPFx consumers

**Current state:** `packages/ui-kit/src/homepage.ts` exports `PersonEntry` (type), `PeopleSearchFn` (type), and `createStaticPeopleSearch` (function) from the `HbcPeoplePicker` lane. It does **not** export `HbcPeoplePicker` (component) or `useGraphPeopleSearch` (hook).

**Decision:** The homepage entrypoint must also export `HbcPeoplePicker` and `useGraphPeopleSearch` so that HB Kudos and other homepage consumers can consume the shared picker through the governed `@hbc/ui-kit/homepage` surface.

---

## Decision Locks

| Decision | Lock Status | Justification |
|---|---|---|
| Durable reusable picker UI must not remain inside `HbcKudosComposer` | **LOCKED** | `HbcKudosComposerPeopleBucket` (lines 492–750) is a full duplicate of shared picker behavior. It must be removed and replaced by consumption of the shared picker. |
| Durable reusable picker UI must not be implemented under `apps/hb-webparts` | **LOCKED** | `useSharePointPeopleSearch.ts` is correctly an environment-specific adapter, not a UI component. No picker UI should live in apps. |
| `packages/ui-kit/src/HbcPeoplePicker/` is the target shared lane | **LOCKED** | Already exists with types, component, and Graph adapter. No stronger alternative found. |
| Homepage consumers must use governed `@hbc/ui-kit/homepage` export surface | **LOCKED** | Consistent with `HBC_HOMEPAGE_IMPORT_GUARDRAILS.allowedEntrypoint`. |
| Agent must not create a second shared picker implementation | **LOCKED** | One shared lane exists. Consolidate, do not duplicate. |

---

## Current-State Ownership Matrix

| Concern | Current Owner | File | Lines |
|---|---|---|---|
| Query input behavior | `HbcKudosComposerPeopleBucket` | `packages/ui-kit/src/HbcKudosComposer/index.tsx` | 492–750 |
| Search dispatch (invocation) | `HbcKudosComposerPeopleBucket` | `packages/ui-kit/src/HbcKudosComposer/index.tsx` | 522–611 |
| Search dispatch (SP adapter) | `useSharePointPeopleSearch` | `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` | 125–265 |
| Search dispatch (Graph adapter) | `useGraphPeopleSearch` | `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts` | 26–73 |
| Response parsing (SP) | `searchSharePointPeople` | `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` | 86–265 |
| Response parsing (Graph) | `useGraphPeopleSearch` | `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts` | 52–69 |
| Ranking/filtering | Both picker impls (selected-item filter only) | Both `index.tsx` files | — |
| Result rendering | `HbcKudosComposerPeopleBucket` | `packages/ui-kit/src/HbcKudosComposer/index.tsx` | 725–741 |
| Chip/token selection | `HbcKudosComposerPeopleBucket` | `packages/ui-kit/src/HbcKudosComposer/index.tsx` | 677–694 |
| Avatar rendering | **None** | — | — |

## Target-State Ownership Matrix

| Concern | Target Owner | File |
|---|---|---|
| Query input behavior | `HbcPeoplePicker` | `packages/ui-kit/src/HbcPeoplePicker/index.tsx` |
| Debounced search dispatch | `HbcPeoplePicker` | `packages/ui-kit/src/HbcPeoplePicker/index.tsx` |
| Search adapter (SP) | `useSharePointPeopleSearch` (local adapter) | `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` |
| Search adapter (Graph) | `useGraphPeopleSearch` | `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts` |
| Response parsing | Adapter-specific (unchanged per adapter) | Respective adapter files |
| Ranking/filtering | `HbcPeoplePicker` (selected-item filter) | `packages/ui-kit/src/HbcPeoplePicker/index.tsx` |
| Result rendering (with avatar) | `HbcPeoplePicker` | `packages/ui-kit/src/HbcPeoplePicker/index.tsx` |
| Chip/token selection (with avatar) | `HbcPeoplePicker` | `packages/ui-kit/src/HbcPeoplePicker/index.tsx` |
| Avatar/photo retrieval | New separate hook/utility | `packages/ui-kit/src/HbcPeoplePicker/` (new file) |
| Initials fallback | `HbcPeoplePicker` | `packages/ui-kit/src/HbcPeoplePicker/index.tsx` |
| Kudos draft bridge (`string[]` → `PersonEntry[]`) | Thin local adapter | `packages/ui-kit/src/HbcKudosComposer/index.tsx` or `apps/hb-webparts/` |
| Webpart orchestration | `HbKudos` | `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` |

---

## Locked Package Destination

**`packages/ui-kit/src/HbcPeoplePicker/`**

All durable reusable picker UI — input, debounce, keyboard nav, result rendering, chip selection, avatar display, and initials fallback — lives here.

## Locked Homepage Export Decision

**`packages/ui-kit/src/homepage.ts`** must add:

- `HbcPeoplePicker` (component)
- `HbcPeoplePickerProps` (type)
- `useGraphPeopleSearch` (hook)

Existing exports (`PersonEntry`, `PeopleSearchFn`, `createStaticPeopleSearch`) remain.

---

## Migration Seam for HB Kudos

The migration seam is at the `HbcKudosComposerTypedRecipients` → `HbcKudosComposerPeopleBucket` boundary:

1. `HbcKudosComposerPeopleBucket` (lines 492–750) is the component to **remove**.
2. Replace its callsite (line 418) with `<HbcPeoplePicker>` from the shared lane.
3. The bridge concern is `values: string[]` (UPN strings) ↔ `PersonEntry[]`. The shared picker's `onChange` returns `PersonEntry[]`; the Kudos composer stores `individualEmails: string[]`. A thin mapping adapter at the callsite converts between these.
4. The `nameCache` local state in the current `HbcKudosComposerPeopleBucket` becomes unnecessary once the shared picker manages `PersonEntry[]` natively.

---

## Files to Be Modified in Later Prompts

### Shared picker lane (expand contract + rendering)

- `packages/ui-kit/src/HbcPeoplePicker/types.ts` — expand `PersonEntry` with `id`, `givenName`, `surname`, `mail`, photo state fields
- `packages/ui-kit/src/HbcPeoplePicker/index.tsx` — add avatar/photo rendering in results and chips, initials fallback, updated result row layout
- `packages/ui-kit/src/HbcPeoplePicker/useGraphPeopleSearch.ts` — expand Graph `$select` and mapping to include `id`, `givenName`, `surname`
- `packages/ui-kit/src/HbcPeoplePicker/` — new file for photo/avatar retrieval hook (separate from user search)

### Homepage export surface

- `packages/ui-kit/src/homepage.ts` — add `HbcPeoplePicker`, `HbcPeoplePickerProps`, `useGraphPeopleSearch` exports

### Kudos composer (remove duplicate, consume shared)

- `packages/ui-kit/src/HbcKudosComposer/index.tsx` — remove `HbcKudosComposerPeopleBucket` (~260 lines), replace callsite with shared `HbcPeoplePicker`, add thin `PersonEntry[]` ↔ `string[]` bridge

### Webpart (no structural change expected)

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx` — may need import path update if the shared picker is consumed directly; otherwise unchanged because `searchPeople` is already injected via props
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` — may need minor type update if `PersonEntry` expands, but the SP adapter can continue returning the subset it knows about
