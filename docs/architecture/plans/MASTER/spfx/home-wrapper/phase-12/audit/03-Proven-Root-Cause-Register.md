# 03 — Proven Root-Cause Register

## RC-01 — `tablet-landscape` still encodes single-column behavior

- **Seam:** `shell/breakpointPolicy.ts`
- **Type:** source-level
- **Status:** proven
- **Evidence:** `tablet-landscape` still declares `firstLaneColumns: 1` and `firstLanePairingAllowed: false`
- **Why this is a root cause:** the prompt's locked target explicitly requires pairing on `tablet-landscape`
- **Classification:** intentional current logic

## RC-02 — Row recipes still deny `tablet-landscape`

- **Seam:** `shell/bandRecipes.ts`
- **Type:** source-level
- **Status:** proven
- **Evidence:** `feature-pair` and `asymmetric-two-up` remain eligible only in `ultrawide-desktop` and `standard-laptop`
- **Why this is a root cause:** even if breakpoint policy changed, these recipes would still reject the three locked rows in `tablet-landscape`
- **Classification:** intentional current logic

## RC-03 — Shell-fit contracts make the locked target impossible across most or all standard-laptop widths

- **Seam:** `shell/slotComfortResolver.ts` + `shell/occupantRegistry.ts`
- **Type:** source-level
- **Status:** proven
- **Evidence:** paired slot widths are resolved at `2/3` and `1/3` of usable shell width; `hb-kudos` and `safety-field-excellence` need `520px` in the minor slot; `people-culture-public` needs `720px`
- **Why this is a root cause:** Row 1 and Row 2 only pair at about `>=1560px`; Row 3 only pairs at about `>=2160px`
- **Classification:** accidental target mismatch caused by downstream fit contracts

## RC-04 — CSS paired-grid activation starts too late for `tablet-landscape`

- **Seam:** `HbHomepageShell.module.css`
- **Type:** source-level / styling-layer
- **Status:** proven
- **Evidence:** paired orientation templates and major/minor grid placement only activate at `@container ... (min-width: 1180px)`
- **Why this is a root cause:** `tablet-landscape` never reaches the visual paired-grid branch
- **Classification:** intentional current logic

## RC-05 — Hosted ultrawide full-stack behavior still requires deployment/page-authoring verification

- **Seam:** `.sppkg` cutover and SharePoint page composition
- **Type:** deployment/runtime
- **Status:** plausible but not proven from repo source alone
- **Evidence:** repo contains a dedicated verification runbook and full-width requirement for the homepage webpart
- **Why this matters:** if a full-width ultrawide page still stacks Rows 1–3, the hosted page is probably stale or narrower than assumed
- **Classification:** secondary investigation branch
