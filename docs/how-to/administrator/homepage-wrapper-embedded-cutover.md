# Homepage Wrapper-Embedded Cutover (Phase-07)

Authoritative runbook for proving or completing the Phase-07 flagship
homepage page-canvas cutover. Supersedes the Phase-06 target state
(hero → PriorityActionsRail → hbHomepage) with the Phase-07 target
(hero → hbHomepage, with the rail composed inside the HbHomepage
wrapper).

See also:
- Phase-06 runbook: `homepage-action-layer-cutover.md` (intermediate
  topology; still useful for tenants not yet migrated to the wrapper
  runtime).
- Regression guard: `homepage-action-layer-regression-guard.md`.

## Target end state (Phase-07)

The HBCentral flagship homepage canvas must contain exactly:

1. **HB Signature Hero** (top full-width section)
2. **HbHomepage** (next full-width section — owns the wrapper-embedded
   `PriorityActionsRail` surface internally)

The final state must also satisfy all of:

- no OOB SharePoint Quick Links webpart on the homepage canvas
- no **standalone** `PriorityActionsRail` webpart on the homepage
  canvas (the rail is composed inside HbHomepage's wrapper; a separate
  webpart would produce a duplicate action layer)
- page order `hero < hbHomepage`
- the page is published after cutover
- a repeatable proof path exists in the repo

## Authoritative mechanism (seam)

Both proof and cutover live in `@hbc/pnp-runner-local`:

| Purpose | Canonical action key | Alias |
|---|---|---|
| Read-only proof (Phase-07 target) | `sharepoint-control:proof:homepage-wrapper-embedded` | `sharepoint:pnp:homepage-wrapper-embedded-proof` |
| Idempotent cutover (remove legacy webparts) | `sharepoint-control:provisioning:flagship-homepage-wrapper-cutover` | `sharepoint:pnp:flagship-homepage-wrapper-cutover` |

The Phase-06 actions
(`sharepoint-control:proof:homepage-action-layer`,
`sharepoint-control:provisioning:flagship-action-layer-cutover`)
remain registered for intermediate-state diagnosis and are NOT the
Phase-07 target authority.

## State model (wrapperEmbeddedState)

The proof returns one of:

- `wrapper-embedded-target` — hero + HbHomepage present in correct
  order, no Quick Links, no standalone rail. Proof passes.
- `requires-cutover-quick-links` — OOB Quick Links still on page.
- `requires-cutover-standalone-rail` — standalone `PriorityActionsRail`
  webpart still on page (intermediate Phase-06 topology).
- `wrapper-present-wrong-order` — hero and HbHomepage present but
  ordered incorrectly.
- `ambiguous` — hero or hbHomepage missing; cannot classify.
- `page-missing` — target page not found.

## Cutover behavior

`sharepoint-control:provisioning:flagship-homepage-wrapper-cutover`:

- Removes every OOB Quick Links instance (webpart id
  `c70391ea-0b10-4ee9-b2b4-006d3fcad0cd`).
- Removes every standalone `PriorityActionsRail` instance (webpart id
  `b3f07190-79cf-437d-a1d6-ecbf3f77e616`).
- Does **not** add any webpart. HbHomepage must already be authored on
  the page; the wrapper-embedded rail renders from there. If HbHomepage
  is absent, the post-cutover state will be `ambiguous` and the proof
  will fail until an author places HbHomepage.
- Publishes the page.
- Idempotent: a clean page produces an empty removal set.

## Operator workflow

1. Prove current state:
   - Run `sharepoint-control:proof:homepage-wrapper-embedded` against
     the HBCentral site.
   - If `wrapperEmbeddedState === 'wrapper-embedded-target'` and
     `passed === true`, no further work required.
2. If proof fails:
   - Run
     `sharepoint-control:provisioning:flagship-homepage-wrapper-cutover`
     against the HBCentral site.
   - Re-run the proof to confirm `wrapper-embedded-target`.
3. If the proof still fails because HbHomepage is absent or out of
   order, the page needs an authoring step in SharePoint to place
   HbHomepage below the hero. Then re-run the proof.
4. Capture proof output under the phase-07 evidence folder (or the
   wave-01a evidence folder, whichever is active for the current
   tenant engagement).

## Runner invocation

All tenant-connected work runs through `@hbc/pnp-runner-local` with
the operator's device-login auth context. The runner dispatches
through `scripts/invoke-pnp-extraction.ps1`; no other mechanism is
considered authoritative for flagship page-canvas truth.
