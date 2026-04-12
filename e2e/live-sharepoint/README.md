# HB Kudos — live SharePoint integration lane (phase-16a/06)

A thin, opt-in reality-check that exercises the real Microsoft 365
contract seams the HB Kudos system depends on. Not a second E2E
framework, not a mandatory CI gate, and **never pointed at a
production list**.

## What this lane proves

1. Request digest fetch (`/_api/contextinfo`) succeeds on the target
   site.
2. `ClientPeoplePickerSearchUser` returns at least one principal for
   a known-safe query string (auth + tenant search wiring).
3. `/_api/web/ensureuser` resolves a known test user's email to a
   numeric SP user id.
4. A draft item can be created on the dedicated non-production
   People Culture Kudos test list via **GUID binding** (never by
   title).
5. `X-HTTP-Method: MERGE` with a live etag patches that item.
6. An audit event writes and reads back from the non-production
   Kudos Audit Events test list.
7. A MERGE with a stale `If-Match` etag returns `412 Precondition
   Failed` — the same conflict path the writer relies on.
8. The test list bound by GUID still resolves and returns its
   current live Title, proving title drift cannot cross-bind the
   writer.

## What this lane intentionally does NOT prove

- Graph photo hydration (optional; the dev-harness covers it).
- `kudosListHostUrl` override behavior (covered in source-level
  tests; not meaningful without a second site).
- End-to-end UI rendering (covered by the dev-harness Playwright
  lane in `e2e/webparts/kudos/**`).
- Role resolution flavor (covered at the source level in
  `apps/hb-webparts/src/homepage/__tests__/kudosRoleResolver.test.ts`).

## Required environment

All vars must be set or the suite skips at `beforeAll` with a clear
reason. None are read from `.env` automatically — pass them on the
command line or export before invoking.

| Variable | Purpose | Example |
|---|---|---|
| `HB_KUDOS_LIVE_SITE_URL` | Site URL that hosts the test lists | `https://hbcdev.sharepoint.com/sites/HBCentralDev` |
| `HB_KUDOS_LIVE_KUDOS_LIST_ID` | GUID of the non-production People Culture Kudos test list | `11111111-2222-3333-4444-555555555555` |
| `HB_KUDOS_LIVE_AUDIT_LIST_ID` | GUID of the non-production Kudos Audit Events test list | `aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee` |
| `HB_KUDOS_LIVE_TEST_USER_EMAIL` | Safe test user to resolve via `ensureUser` | `kudos-test-user@<tenant>.onmicrosoft.com` |
| `HB_KUDOS_LIVE_STORAGE_STATE` | Path to a Playwright `storageState` JSON containing a SharePoint-authenticated session cookie | `.secrets/sp-auth.json` |

Optional:

| Variable | Purpose | Default |
|---|---|---|
| `HB_KUDOS_LIVE_SEARCH_QUERY` | Safe people-search query | `ken` |
| `HB_KUDOS_LIVE_KEEP_SEEDS` | Skip afterAll delete step | unset (cleanup on) |

## Capturing a `storageState` once

```
# Starts a browser pinned to the dev site. Log in via the normal
# corporate SSO flow, then press Enter in the terminal to capture
# cookies to .secrets/sp-auth.json.
pnpm exec playwright codegen "$HB_KUDOS_LIVE_SITE_URL" \
  --save-storage .secrets/sp-auth.json
```

Store the file **outside the repo** (e.g. `~/.config/hbc/sp-auth.json`)
or under a path listed in `.gitignore`. Rotate the captured
session periodically.

## Setup checklist (dev-site owner)

1. Create a dedicated dev site (e.g. `/sites/HBCentralDev`) separate
   from production `HBCentral`.
2. Provision two lists whose field schema mirrors the production
   People Culture Kudos + Kudos Audit Events lists.
3. Record the GUIDs of those lists via `Site Contents → <list> →
   Settings → List information` → the URL ends with the GUID.
4. Create a single dedicated test user account with a stable email
   (`HB_KUDOS_LIVE_TEST_USER_EMAIL`) in the tenant.
5. Share the dev site with that test user.
6. Capture a storageState (see above) using credentials that have
   write permission on the dev site.

## Running

```
# Set env (example)
export HB_KUDOS_LIVE_SITE_URL="https://hbcdev.sharepoint.com/sites/HBCentralDev"
export HB_KUDOS_LIVE_KUDOS_LIST_ID="<guid-of-test-kudos-list>"
export HB_KUDOS_LIVE_AUDIT_LIST_ID="<guid-of-test-audit-list>"
export HB_KUDOS_LIVE_TEST_USER_EMAIL="kudos-test-user@contoso.onmicrosoft.com"
export HB_KUDOS_LIVE_STORAGE_STATE="$HOME/.config/hbc/sp-auth.json"

# Run the lane
pnpm exec playwright test --config=playwright.kudos-live.config.ts

# Keep the created seeds for diagnostics
HB_KUDOS_LIVE_KEEP_SEEDS=true \
  pnpm exec playwright test --config=playwright.kudos-live.config.ts
```

When env vars are missing, the lane self-skips with a clear message
listing the missing keys.

## Safety rules

- **Never** set `HB_KUDOS_LIVE_SITE_URL` to the production
  `/sites/HBCentral` site or the production list GUIDs.
- Writes are confined to the GUIDs provided. The lane does not
  mutate any list other than the two explicitly named.
- The afterAll hook deletes every item the run created. Failed
  deletes are swallowed so the suite does not hang, but
  `HB_KUDOS_LIVE_KEEP_SEEDS=true` is available if a failed run
  needs manual inspection first.

## CI posture

This lane is **not** a mandatory CI gate. Promote only after:
- the dev tenant + test lists are stable,
- a rotating service-account storageState is wired to CI secrets,
- the 8-case suite has had a clean run for a sustained period.

Until then, it's an on-demand local check documented here.
