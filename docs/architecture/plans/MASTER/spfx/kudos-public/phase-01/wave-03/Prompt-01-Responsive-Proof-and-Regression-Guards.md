# Prompt-01-Responsive-Proof-and-Regression-Guards

## Objective
Add proof and regression guards for the public hbKudos responsive behavior after redesign.

## Inspect exactly
- existing hbKudos tests under `apps/hb-webparts/src/homepage/__tests__/`
- any dev harness or screenshot validation seams already used for homepage surfaces
- hbKudos public runtime files changed in Wave 1 and Wave 2

## Current problem
Doctrine guards currently protect structural invariants better than visual breakpoint quality. The mobile failure seen in the audit could drift back in without a meaningful test failure.

## Required implementation outcome
Add regression protection for:
- phone portrait
- tablet portrait
- standard laptop
- large desktop

These do not need to be pixel-perfect snapshot goldens if that is brittle, but they must make layout regressions observable and hard to ignore.

## Proof of closure
Describe the new guard strategy and show it being executed.
