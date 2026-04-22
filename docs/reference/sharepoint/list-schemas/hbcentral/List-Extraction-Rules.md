# List Extraction Rules

## 1. Objective
- Define repeatable, tenant-truth extraction discipline for HBCentral list schemas.

## 2. Canonical Location
- Canonical location: `/Users/bobbyfetting/hb-intel/docs/reference/sharepoint/list-schemas/hbcentral/`.
- This folder is the authoritative in-repo reference package for HBCentral list schemas.

## 3. Extraction Method Rules
- Prefer existing repo scripts/tools before creating new tooling.
- Modify existing scripts only when necessary for missing metadata depth.
- Never invent schema details; pull directly from tenant truth.
- Capture internal names and implementation metadata, not display names only.
- Separate business lists, system/hidden lists, and document libraries explicitly.
- Record limitations/access gaps explicitly.

## 4. Output Requirements
- One report per included list under `lists/`.
- `README.md` must be updated when inventory/report scope changes.
- `List-Map.md` must be updated on every material extraction refresh.
- Extraction method/assumptions in README must remain current.
- New implementation-relevant lists must be added to inventory and mapped.

## 5. Refresh Triggers
- New app work depends on HBCentral list schema.
- Provisioning or migration changes affect lists/fields/content types/forms.
- Schema drift is suspected.
- New fields/content types/forms/relationships are introduced.
- Audits require fresh tenant truth.

## 6. Maintenance Rules
- README updates are mandatory after each material extraction/update.
- List-Map updates are mandatory after each material extraction/update.
- Per-list reports must be updated where schema changed.
- Any changed extraction scripts/helpers must be documented in README.
- Stale reports must be flagged or refreshed; do not leave unmarked drift.

## 7. Agent Usage Rules
- Treat these reports as reference artifacts, not a substitute for tenant re-check when drift is possible.
- Consult `List-Map.md` before wiring new list relationships.
- When uncertain, re-extract instead of assuming.
