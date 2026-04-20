# Plan Summary

The audit proved four source-level blockers and one secondary hosted-verification branch.

## Blockers to correct

1. `tablet-landscape` still denies first-lane pairing
2. the row recipes still deny `tablet-landscape`
3. paired shell-fit thresholds block the rows at the target widths
4. CSS paired-grid activation starts too late

## Order of execution

1. realign breakpoint + recipe policy
2. realign shell-fit thresholds against the locked row target
3. lower CSS activation to the same target states
4. capture runtime proof locally
5. rebuild and verify the homepage package
6. capture hosted proof on the real SharePoint page

## Important instruction for the code agent

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
