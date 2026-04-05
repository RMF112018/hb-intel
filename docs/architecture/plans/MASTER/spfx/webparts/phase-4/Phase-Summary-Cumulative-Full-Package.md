# Phase Summary — Cumulative Full-Package Rollout

## Objective

Convert `hb-webparts` from the current single-active-proof-case rollout model into a cumulative full-package build that keeps the two validated proof cases in place and restores all remaining homepage webparts into the same package.

## Why this package exists

The current build model still replaces one active proof case with another. That was appropriate while capturing the first two successful build parameters, but it is now the wrong end state. The build must stop excluding previously validated webparts and instead package all homepage webparts through the learned first-class pattern.

## Scope

This prompt package addresses:

- cumulative inclusion of previously validated webparts
- restoration of all remaining homepage webparts into the package
- preservation of the successful proof-case build parameters
- package inspection and tenant validation for the cumulative package
- cleanup and handoff after the cumulative package is proven

## Out of scope

- unrelated SharePoint page console noise
- homepage information architecture redesign
- UI/content changes to the webparts themselves unless required to make packaging work
- broad refactors outside the `hb-webparts` packaging and runtime seam

## Expected end state

- one deployable `hb-webparts.sppkg`
- all intended homepage webparts present in the toolbox/package
- `HbHeroBannerWebPart` retained
- `PriorityActionsRailWebPart` retained
- remaining webparts restored
- first-class loader contract preserved
- no regression to the original `Could not load ... in require` defect
