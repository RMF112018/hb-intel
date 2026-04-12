# 04 — Playwright Activation Prompt

You are working in the live repo for `RMF112018/hb-intel`.

Your task is to convert the current HB Kudos Playwright lane from **structurally present** to **actually executable**.

## Mandatory directive

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Objective

Activate the existing browser suite by removing `test.fixme` guards only where the harness and locator prerequisites are genuinely satisfied, then execute the suite in tiers.

## Repo areas to inspect and update

At minimum:

- `e2e/webparts/kudos/public/**`
- `e2e/webparts/kudos/companion/**`
- `e2e/webparts/kudos/shared/**`
- `e2e/webparts/kudos/hosted/**`
- `e2e/webparts/kudos/helpers/**`
- `e2e/webparts/kudos/fixtures/**`
- `playwright.webparts.config.ts`

## Required outcomes

### 1. Remove `test.fixme` honestly

Drop `test.fixme` only after the exact dependency it references is truly implemented.

Do not mass-delete `test.fixme` first.
Do not swap to `test.skip` and pretend progress.

### 2. Activate in tiers

Run in this order:

- shared smoke / drift guard
- public P0
- companion P0
- hosted P0
- then broader P1
- then remaining P2

### 3. Produce real evidence

For the active runnable subset, generate:

- actual Playwright execution output
- HTML report
- traces on failure
- curated proof screenshots for critical public and companion flows

### 4. Prove key cases, not just discovery

At minimum ensure runnable proof exists for:

#### Public
- main surface render
- Give Kudos open
- dirty draft + discard
- validation failure
- people-search success
- people-search empty/error
- submit success
- View All feed
- archive open
- public detail boundary
- celebrate main/detail path

#### Companion
- access gating
- queue tabs and filters
- admin detail + audit timeline
- approve / reject / request revision
- pin / feature + collision denial
- claim / reassign
- bulk approve
- failure paths
- stale-after-action invalidation proof

#### Shared / hosted
- workflow drift guard
- cache invalidation probe
- chrome overlap
- keyboard/focus
- dead-control sweep

## Required hardening during activation

As failures appear, fix only legitimate closure blockers such as:

- wrong locator assumptions
- missing harness seeds
- timing/actionability issues
- state reset leakage between tests
- artifact naming/path issues

Do not weaken assertions just to get green.

## Required output

Create a short activation report in the repo that clearly states:

- which specs are now runnable
- which still remain intentionally deferred and why
- what failures were found and fixed
- whether the P0 set is now CI-ready

## Prohibited shortcuts

- no discovery-only closure language
- no replacing proof assertions with smoke-only assertions
- no silent downgrading of scenario coverage
