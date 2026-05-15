# 03 — Closed Decision Register

## Decision 01 — one card only

**Locked:** Adobe Sign remains a single dashboard card.

**Rejected:** introducing a second Adobe Sign card for completed records.

## Decision 02 — header-level toggle location

**Locked:** Replace the current static `Action Queue` card title with a two-state dynamic header toggle:

```text
Action Queue    Completed
```

The control sits in the title/sub-head slot, not in a body tab bar.

## Decision 03 — default view

**Locked:** `Action Queue` is selected by default on every page load.

## Decision 04 — visual treatment

**Locked:**

- active view label = larger, stronger, primary sub-head;
- inactive view label = smaller but pronounced, adjacent, clearly interactive;
- selected label changes when the user switches views.

## Decision 05 — view labels

**Locked header labels:**

```text
Action Queue
Completed
```

**Locked body semantics:**

```text
Completed = recently completed agreements in the last 30 days.
```

## Decision 06 — card title rename

**Rejected:** rename the card to `Agreements`.

**Locked:** Preserve `Adobe Sign` eyebrow and convert the existing title position into the toggle.

## Decision 07 — completed lane architecture

**Locked:** same card, separate read-model lanes.

- pending lane remains intact;
- completed lane gets new DTOs, route, adapter, telemetry, client method, UI panel.

## Decision 08 — completed endpoint

**Locked backend route:**

```http
GET /api/my-work/me/adobe-sign/recent-completions
```

**Locked route registry key:**

```ts
'adobe-sign-recent-completions'
```

## Decision 09 — completed view definition

**Locked:** completed terminal-state agreements visible to the authenticated Adobe principal, last 30 days, most-recent first.

## Decision 10 — home envelope

**Locked:** Do not add completed data to `MyWorkHomeReadModel`.

The home read model remains pending-first and single-call.

## Decision 11 — fetch timing

**Locked:** lazy-load completed data only after the first user selection of `Completed`.

## Decision 12 — in-memory retention

**Locked:** retain completed results in-memory for the current page session. Do not persist to localStorage/sessionStorage.

## Decision 13 — metrics

**Locked:**

- Action Queue view preserves current three pending metrics.
- Completed view shows one compact populated-state metric:
  - `Completed in last 30 days`
- Hide completed metric when zero completed rows exist.

## Decision 14 — row copy

**Locked completed rows show:**

- agreement name;
- completion/update date truthfully;
- sender if available;
- `Open in Adobe Sign` only when backend-approved `sourceOpenUrl` exists.

## Decision 15 — no overclaiming

**Locked:** never imply the current user personally completed, signed, approved, or caused completion unless the provider contract directly proves that fact. The MVP does not make that claim.

## Decision 16 — source-open-url posture

**Locked:** reuse existing backend URL-policy evaluation. SPFx must not synthesize Adobe URLs.

## Decision 17 — telemetry

**Locked additions:**

- query intent discriminator:
  - `action-queue`
  - `recent-completions`
- new runtime result event:
  - `adobeSign.read.recentCompletions.result`

## Decision 18 — request syntax gate

**Locked:** Prompt 01 must verify the exact current Adobe completed-search request syntax before implementation.

## Decision 19 — fail-closed query behavior

**Locked:** Do not ship an unbounded adapter-side post-filter scan if provider-side completed/date query syntax is not confirmed.

## Decision 20 — prohibited scope

**Locked:** no live tenant mutation, deployment, manifests, lockfile changes, package dependency edits, CI workflow edits, or unrelated module work.
