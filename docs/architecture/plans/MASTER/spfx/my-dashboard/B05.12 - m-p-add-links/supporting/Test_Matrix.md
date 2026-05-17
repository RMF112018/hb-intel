# Test Matrix

## A. Provisioning
- list descriptor shape
- field types
- dry-run missing list
- dry-run wrong-type drift
- apply creates list and fields
- verifier ready/unready states

## B. Models
- visibility enum
- custom-link read model
- create/update/delete result unions
- `MyProjectLinkItem.customLinks` fixture validity

## C. Backend repository
- map persisted fields to read-model links
- visibility filtering
- soft delete update payload
- owner validation
- list write field filtering

## D. Entitlement
- create allowed for Projects-only item
- create allowed for merged item
- create allowed for legacy-only item
- create denied for unassigned project
- create denied for malformed provenance

## E. Routes
- 200 create/update/delete success
- 400 invalid input
- 401 authorization-required
- 403 owner/project denied
- 404 not found
- 409 limit reached
- 503 source unavailable

## F. Read-model join
- private link only for creator
- project-visible link for any entitled project user
- no cross-project leak
- mixed IDs join correctly
- links sorted project first/private second/title ascending
- custom link source failure preserves base items

## G. Frontend command client
- create/update/delete calls with bearer token
- fallback or error normalization
- malformed response handling

## H. UI
- `More Project Resources` collapsed state
- expand/collapse ARIA
- empty state
- custom link rows with badges
- create modal helper text exact
- validation errors
- create success refresh/update
- edit/delete controls only for owner
- mobile posture
- view-all/browser tile reuse

## I. Docs
- schema doc
- runbook
- route contract
- UI copy reference
