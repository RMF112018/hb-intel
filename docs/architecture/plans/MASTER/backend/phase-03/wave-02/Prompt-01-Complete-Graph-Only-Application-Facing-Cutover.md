# Prompt-01-Complete-Graph-Only-Application-Facing-Cutover

## Objective

Finish the Graph-only cutover for the application-facing Safety backend and prevent regression into SharePoint REST/PnP on ingest/preview/replay hot paths.

## Governing authorities

- current graph-native Safety application service / repository / data plane
- cutover guard tests
- any remaining SharePoint/PnP seams in backend/functions and packages/features/safety

## Required work

1. Inventory every remaining Safety-related REST/PnP seam in the repo.
2. Classify each seam as:
   - active hot path
   - isolated provisioning/control-plane seam
   - dead/retired
3. Remove or quarantine anything that could re-enter ingest/preview/replay hot paths.
4. Strengthen guard tests so regression is obvious.

## Required outcome

- Safety application-facing backend direction is explicitly Graph-only
- residual non-Graph seams are isolated and documented, not ambiguous

## Proof of closure required

- inventory table
- exact files changed
- tests proving no REST/PnP re-entry on ingest/preview/replay paths

## Prohibitions

- no vague architectural notes without code/test closure
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
