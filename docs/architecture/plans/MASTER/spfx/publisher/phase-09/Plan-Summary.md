# Plan Summary

## Objective

Close the proven Publisher wiring and workflow defects identified in the repo-truth audit, one issue at a time, in the correct closure order.

## Closure Order

1. Hosted project lookup host binding
2. Republish approval bypass
3. Archive/withdraw fail-open binding lookup
4. Archive/withdraw atomicity and compensation
5. Scheduled-state dead branch
6. Milestone legacy branch contradiction

## Why this order

- item 1 removes a likely hosted-page authoring break
- item 2 closes the most serious live-content control defect
- items 3 and 4 stabilize lifecycle safety before lower-severity legacy branches
- items 5 and 6 resolve the remaining “read-compatible but not operationally trustworthy” branches

## Success Standard

After all prompts are closed:

- hosted project lookup reads the authoritative list host
- republish cannot bypass approval gating
- archive/withdraw fails closed and does not silently leave live pages in circulation
- archive/withdraw does not leave page/binding/history ahead of the master article
- unsupported legacy branches are either fully implemented or explicitly quarantined

