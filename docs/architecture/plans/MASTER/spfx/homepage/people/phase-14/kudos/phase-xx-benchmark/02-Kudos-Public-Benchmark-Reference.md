# 02 — Kudos Public Benchmark Reference

## Benchmark role

The HB Kudos public-facing webpart is the homepage benchmark because it demonstrates a comparatively mature combination of:

- premium public surface design
- deliberate composer lifecycle management
- explicit contract and predicate usage
- SharePoint-aware search and write seams
- photo/identity handling
- archive and feed behavior
- detail panel behavior
- public/internal boundary awareness
- stateful success, error, and discard flows
- host-aware interaction sophistication

## Benchmark qualities to replicate in principle

### 1. Complete interaction model
The Kudos webpart does not stop at a flat display surface.
It includes:
- primary surface
- composer flow
- preview state
- success state
- error state
- discard guard
- archive browse
- view-all feed
- detail panel
- reaction path
- submitter follow-up actions

Other homepage webparts should achieve similar completeness relative to their purpose.

### 2. Thin UI backed by explicit seams
The Kudos public surface is not merely a dense component.
It is backed by explicit adapters, predicates, hooks, and data seams.

This is the model:
- surface composition remains readable
- transport and normalization logic live in explicit helpers/hooks
- workflow predicates are named and testable
- write actions route through disciplined writer seams

### 3. Purpose-fit sophistication
Kudos feels considered because it handles nuance:
- public versus associated visibility
- archive eligibility
- age-off behavior
- recipient/media hydration
- different panel contexts
- submitter-only follow-up actions

Other webparts must aim for equivalent nuance in their own domain.

### 4. No false simplicity
Kudos does not hide complexity by ignoring it.
It organizes complexity into explicit seams.

That is the correct model for other homepage webparts.

## Benchmark translation rule

When comparing another homepage webpart to Kudos, ask:

- what is the equivalent of its full user journey?
- what are its equivalent state classes?
- what are its equivalent backend/data risks?
- what are its equivalent host/runtime constraints?
- what are its equivalent validation expectations?

Do **not** ask whether the webpart visually resembles Kudos.
Ask whether it is built with the same seriousness.

## Benchmark categories to score against

1. Surface hierarchy and polish
2. Detail depth and multi-state behavior
3. Data and contract discipline
4. Runtime seam quality
5. State-machine credibility
6. Error/loading/empty-state completeness
7. Media/identity correctness where applicable
8. Accessibility and keyboard credibility
9. SharePoint-hosted proof quality
10. Evidence-backed closure

## Enforcement rule

If a target homepage webpart materially underperforms Kudos in one or more benchmark categories, that gap must be explicitly identified and either:

- remediated, or
- formally accepted as a deliberate exception with written rationale

No silent downgrade is allowed.
