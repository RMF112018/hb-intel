# 06 — Admin / Companion Stress-Test Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to implement the **governance/companion-side stress suite** for HB Kudos.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Implement browser-level and seam-level stress coverage for the governance companion across:

- queue tabs
- filters
- ownership modes
- bulk approve
- detail panel
- audit timeline
- every meaningful governance action currently supported by repo truth
- refresh / cache invalidation / write integrity
- role/capability boundaries

## Surfaces and seams to cover

At minimum, cover current repo-truth behavior in:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- role/capability helpers
- prominence validation helpers
- admin-review helpers
- detail-panel content seams

## Required test families

### A. Access and role gating

Prove:

- viewer role is blocked from governance surface
- reviewer role sees permitted actions only
- admin role sees admin-only actions
- unknown role / unresolved role behavior is acceptable

### B. Queue tabs and filtering

Prove:

- each queue tab scopes correctly
- search filters correctly
- ownership filter modes behave correctly
- admin-review-only toggle behaves correctly
- scheduled-only toggle behaves correctly
- aging buckets behave correctly
- queue sort direction matches current code intent for review vs resolved lanes

### C. Detail panel and audit timeline

Prove:

- detail opens correctly from queue row
- audit timeline loads and renders in governance detail
- governance-only metadata is visible where intended
- no cross-state mismatch between row and detail panel

### D. Governance actions

Implement explicit coverage for every currently supported action path:

- approve
- reject
- request revision
- reopen
- flag for admin review
- clear admin review
- schedule
- unschedule
- pin
- unpin
- feature
- unfeature
- remove
- restore
- claim
- reassign
- celebrate
- update content
- bulk approve

For each action, prove:

- action affordance availability is correct for role + state
- dialog opens where input is required
- validation behaves correctly
- write seam is invoked with expected behavior
- queue/data refresh occurs after success
- audit-event behavior is correct
- failure path is surfaced cleanly

### E. Prominence and collision behavior

Prove:

- pin limit validation behavior
- feature limit validation behavior
- collision handling / demotion path where current writer supports it
- slot-state-dependent failures surface intelligibly

### F. Ownership / work management

Prove:

- claim behavior
- reassignment behavior
- state-aware reassignment denial path where required
- ownership filters react correctly after mutation

### G. Bulk approve

Prove:

- selectable rows are limited to the intended queue contexts
- bulk selection UI appears only when appropriate
- approve selected mutates what it should mutate
- partial failure reporting behaves sensibly
- selection clears correctly afterward

### H. Failure and drift paths

Cover at least:

- item lookup miss
- patch rejection
- audit write failure after patch success
- authorization denial
- invalid dialog input
- stale row / stale queue refresh issues if reproducible

## Evidence requirements

Produce and save:

- screenshots for each major queue tab
- screenshots for at least one action dialog in each dialog family
- traces for failures
- proof screenshots for:
  - approve
  - reject
  - revision request
  - schedule/unschedule
  - pin/feature
  - remove/restore
  - claim/reassign
  - bulk approve

## Prohibited shortcuts

- do not cover only approve/reject and call it done
- do not skip audit timeline validation
- do not skip role/capability denial checks
- do not skip refresh / stale-after-action checks

## Closure

Commit the companion suite and a concise matrix showing which actions are now proven by automated coverage.
