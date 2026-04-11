# Production Configuration Appendix

## Locked site model

### Admin companion host
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBKudosAdminReview`

### Public host
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

### Canonical list host
- URL: `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral`

### Lists
- `People Culture Kudos`
  - `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/People%20Culture%20Kudos/Compact.aspx`
- `Kudos Audit Events`
  - `https://hedrickbrotherscom.sharepoint.com/sites/HBCentral/Lists/Kudos%20Audit%20Events/AllItems.aspx`

## Locked role model

The agent must treat these as the production role authorities supplied by the user:

- `HB Kudos Admins` — Entra security group already assigned as communication site Admin on `HBKudosAdminReview`
- `HB Kudos Reviewers` — Entra security group already assigned as communication site Owners on `HBKudosAdminReview`

## Canonical permissions authority

This is a final production decision, not a pending recommendation.

Production permissions are not configurable per webpart instance. The sole source of truth for companion access and governance permissions is actual membership in the canonical Entra security groups listed above.

The following are decided and locked:
- `simulatedRole` is retired from production — dev-only, not present in the production property pane
- `kudosAdminsGroup` and `kudosReviewersGroup` editable fields are removed from the production property pane
- the property pane is not a permissions-management surface
- page/webpart configuration does not alter governance access — only Entra group membership changes affect permissions

## Expected production properties / config behavior

The agent must implement the best durable production model, but at minimum:

### Companion webpart
- `heading` may remain configurable if still product-valid
- permission-related property-pane fields must be removed or fully retired from production use
- `simulatedRole` must not remain the live production access path
- if any hidden dev/test override remains in code, it must be clearly isolated from production runtime and unavailable in the ordinary property pane

### Public webpart
- `heading` may remain configurable
- `showArchive` may remain configurable if still product-valid
- no reviewer/admin simulation config should exist on the public webpart
- no permission-related property-pane fields should exist on the public webpart

## Required production configuration decisions

The agent must explicitly decide and implement:

1. how the companion resolves the current user against the canonical security-group model
2. how the companion resolves the canonical list-host site URL
3. whether cross-site list access should be:
   - explicit in code via a canonical site URL constant / config
   - environment-backed and locked for production
4. how any dev-only simulation is removed or isolated from production behavior
5. how the package documents permissions for users/admins without sending them to the property pane

## Required layman-friendly permissions documentation

The final implementation must leave behind clear documentation, written in plain language, that explains:

### What controls access
- Access to the HB Kudos Approval Companion is controlled by membership in:
  - `HB Kudos Admins`
  - `HB Kudos Reviewers`
- The webpart settings panel does not control who has access.

### What each group does
- `HB Kudos Admins` can perform admin-only actions and final governance actions.
- `HB Kudos Reviewers` can perform reviewer actions but not admin-only actions.

### How to change access when needed
The documentation should direct the appropriate administrator to update membership in Microsoft Entra rather than editing webpart settings.

Recommended plain-language flow:
- Open the Microsoft Entra admin center.
- Go to Groups / All groups.
- Open `HB Kudos Admins` or `HB Kudos Reviewers`.
- Add or remove members as needed.
- Wait for membership changes to propagate, then refresh the SharePoint page.

The documentation should avoid deep technical language and should make it clear that group membership changes, not page edits, control access.

## Production permissions authority note

The production permissions authority model for HB Kudos is centralized and final:

- **Authority source:** Entra ID security group membership only
- **Canonical groups:** `HB Kudos Admins` and `HB Kudos Reviewers`
- **Removed from production:** `simulatedRole`, `kudosAdminsGroup`, and `kudosReviewersGroup` property-pane fields
- **Governing lock:** `Decision-Lock-Appendix-Updated.md` — Production Permissions Authority section

No page configuration, webpart property edit, or site-page authoring action can alter who has governance access. Permissions are changed exclusively by updating Entra group membership.

## Implementation closure note

The following production configuration changes have been implemented:

1. **Property-pane permission fields removed** — `simulatedRole`, `kudosAdminsGroup`, and `kudosReviewersGroup` are no longer in the production property pane or manifest preconfigured properties. The property pane retains only product configuration (overdue thresholds, heading).

2. **Security-group-only authority model implemented** — `kudosRoleResolver.ts` hardcodes the canonical Entra group constants (`HB Kudos Admins`, `HB Kudos Reviewers`) and resolves role via `/_api/web/currentuser?$expand=Groups`. Group names are not configurable per instance. `simulatedRole` is isolated to the dev-only path (no `siteUrl`).

3. **Unified capability enforcement** — both UI gating (`HbKudosCompanion.tsx` via `deriveKudosCapabilities`) and writer-level authorization (`kudosGovernanceWriter.ts` via `authorizeKudosPatch`) consume the same capability model derived from the resolved role.

4. **Permissions documentation** — `docs/how-to/administrator/hb-kudos-permissions-guide.md` provides layman-friendly documentation covering what controls access, what each group does, and how to update membership in Entra.

5. **Manifest descriptions updated** — source and release manifests describe the Entra-only permission model. No remaining product copy implies property-pane permission configuration.

## Closure expectation

The final implementation must leave behind a clear, documented production configuration model that another maintainer can understand without reverse-engineering prompt history.
