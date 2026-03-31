# Prompt 03 — Update docs, architecture maps, and separation doctrine

You are continuing the rename effort in:

`https://github.com/RMF112018/hb-intel.git`

## Objective

Update the documentation and architecture materials so the current Project Setup Requests SPFx app is no longer defined as the Estimating SPFx app, and the repo clearly reflects the separation between:

- Project Setup Requests app
- future Estimating app
- Accounting app
- Admin app
- shared provisioning/saga backbone

## Critical instructions

- Treat repo truth as authoritative.
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Update docs comprehensively, not selectively.
- Remove outdated language that implies Project Setup Requests is still the Estimating SPFx app.
- Architecture maps and current-state docs must explicitly reflect the new separation.
- Where a future Estimating app does not yet exist, document it as future/planned rather than pretending it already exists.

## Required working scope

1. Update all docs that currently define or imply the Project Setup app as the Estimating SPFx app.
2. Update architecture maps / current-state maps / blueprint docs / phase plans to show:
   - Project Setup Requests as its own app/surface
   - Estimating app as separate future or separate app as appropriate
   - Accounting and Admin as separate apps consuming the same provisioning/saga data
   - shared provisioning backbone as the cross-app system of record
3. Remove or rewrite any text that says bids/templates/project requests are all part of the same Estimating SPFx app when that is no longer true.
4. Update naming in release-readiness docs, acceptance docs, handoff docs, and README-style docs where relevant.
5. Add a concise explanatory note where helpful describing why this separation exists.

## Required output

1. Implement the doc/map changes.
2. Summarize all changed docs grouped by:
   - architecture/current-state
   - phase plans / handoffs
   - release/readiness docs
   - package/readme docs
3. Highlight any remaining docs that still intentionally reference the old framing and explain why.
4. Confirm that the repo’s documented architecture now clearly separates Project Setup Requests from the future Estimating app.
