# 10 — State Machines and Degraded States

## Setting definition
`draft -> active -> deprecated -> retired`

## Setting value
`inherited`, `override-active`, `override-expired`, `pending-review`, `approved`, `rejected`, `blocked-by-policy`, `invalid`, `stale`, `drift-detected`, `source-unavailable`, `backend-unavailable`.

## Change request
`draft`, `submitted`, `routed`, `pending-approval`, `approved`, `rejected`, `admin-verification-required`, `execution-pending`, `completed`, `cancelled`, `superseded`.

## Validation
`not-validated`, `valid`, `warning`, `blocked`, `stale`, `source-unavailable`, `backend-unavailable`, `unauthorized`, `forbidden`.

## Degraded states
Backend unavailable, source unavailable, missing config, unauthorized, forbidden, stale, drift detected, pending request, redacted.
