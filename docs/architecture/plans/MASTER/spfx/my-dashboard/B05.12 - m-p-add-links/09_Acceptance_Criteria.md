# Acceptance Criteria

## 1. SharePoint list provisioning
- `My Projects Custom Links` list can be provisioned deterministically.
- The list schema matches the locked field contract.
- Dry-run and apply commands work.
- Wrong-type drift fails closed.
- Readiness verifier reports accurately.

## 2. Backend command model
- Create/update/delete routes exist.
- Routes are bearer-protected.
- Create validates project entitlement.
- Update/delete require creator ownership.
- Delete is soft-delete only.
- Structured closed-set command results are returned.

## 3. Read model
- `MyProjectLinkItem.customLinks` exists.
- Private links surface only to the creator.
- Project-visible links surface to all entitled project viewers.
- Links join by provenance IDs.
- Custom-link source failure does not erase My Projects items.
- Custom links are sorted project-visible first, private second, title ascending.

## 4. Frontend UI
- Every project tile shows `More Project Resources`.
- Added links render under the collapsed menu/disclosure, not among fixed system launch actions.
- Empty state appears when no links exist.
- `Add project link` CTA is present.
- Add-link modal includes the exact helper text.
- Visibility options and helper copy render.
- Form validation is clear.
- Edit/remove actions appear only when permitted.
- Mobile behavior remains usable.

## 5. Security and policy
- URLs must be absolute HTTPS.
- Title length is enforced.
- Link cap of 20 active links per project is enforced.
- No raw creator UPN/OID leaks to the frontend.
- Frontend never writes directly to SharePoint.

## 6. Non-regression
- Current fixed system launch actions remain intact.
- Current My Projects row/item assignment matching remains intact.
- Current diagnostics/source-status behavior is preserved.
- Existing BuildingConnected and Document Crunch work remains intact.

## 7. Documentation and validation
- Operator runbook exists.
- List schema doc exists.
- Route contract is documented.
- Test matrix passes.
- Final closeout includes exact tests, files changed, and commit guidance.
