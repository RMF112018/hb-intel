# Narrow Remediation Package — Cumulative Loader-Contract Regression

## Objective

This package is for a **narrow remediation phase** focused on the regression introduced when `hb-webparts` moved from the two successful single-target proof cases to the cumulative all-webparts package.

The goal is **not** to continue rollout work.
The goal is **not** to refactor homepage components.
The goal is **not** to redesign the product architecture broadly.

The goal is to identify and fix the **cumulative loader-contract regression layer** so the cumulative package can render again in tenant.

## Current situation

The first two proof cases worked in tenant:

- `HbHeroBannerWebPart`
- `PriorityActionsRailWebPart`

After the build changed to the cumulative all-webparts package, the SharePoint render failure returned.

That means the likely defect layer is the cumulative packaging/runtime path introduced by the latest phase, not the React component trees for the first two webparts.

## Package contents

- `Phase-Summary-Cumulative-Loader-Regression.md`
- `Prompt-01-Forensic-Audit-Cumulative-Regression.md`
- `Prompt-02-Implement-Narrow-Cumulative-Loader-Remediation.md`
- `Prompt-03-Build-Inspect-and-Tenant-Revalidate.md`
- `Prompt-04-Closure-and-Decision-Handoff.md`

## Required posture

Treat the first two successful proof cases as **known-good baselines**.

Treat the cumulative all-webparts package as the new failing state.

The job in this package is to isolate the exact cumulative loader-contract difference that reintroduced the tenant failure, then remediate that defect layer with the smallest correct change.

## Hard constraints

- Do not broaden into component-level UI cleanup unless the regression evidence proves a specific component is the blocker.
- Do not assume AMD shims are correct merely because they package successfully.
- Do not assume the regression is “just cache.”
- Do not continue rollout work until the cumulative package is healthy in tenant.
- Do not re-read files already in active context unless needed for verification.
