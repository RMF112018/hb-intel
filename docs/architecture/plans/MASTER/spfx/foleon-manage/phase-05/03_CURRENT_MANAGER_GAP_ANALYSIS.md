# 03 — Current Manager Gap Analysis

## Summary

The current Manager is a functional management shell, not yet the full administrative and marketing-facing control surface required by the product objective.

## Current Strengths

- Route-driven Manager exists.
- Backend route contract exists for content, placements, sync, validation, provisioning, and config.
- Foleon content/placement schemas are defined.
- Origin allowlist and preview URL concepts exist.
- Manifest has distinct preconfigured toolbox entries for:
  - Highlights
  - Project Spotlight Reader
  - Company Pulse Reader
  - Leadership Message Reader
  - Foleon Manager
- Runtime binding proof exists and redacts sensitive values.
- The homepage lane host reports occupant content state to the shell.

## Gaps Against Requirement

### UX Gaps

Missing dedicated two-tab structure:

- `Homepage Foleon Content`
- `Config`

Missing lane-first marketing workflow:

- Lane status overview.
- Project Spotlight lane card.
- Company Pulse lane card.
- Leadership Message lane card.
- Active edition controls per lane.
- Preview/live/blocked indicator per lane.
- Publish readiness checklist.
- Clear marketing/admin separation.

### Config Gaps

The Manager does not currently provide a Config tab that shows:

- runtime readiness;
- SharePoint list bindings;
- backend API URL;
- API resource;
- accepted origins;
- package and manifest governance;
- environment label;
- registry source;
- validation results;
- admin-only diagnostics;
- editable vs read-only vs derived vs secret-reference fields.

### Error Handling Gap

The Manager currently blocks the whole surface when backend write readiness is missing. The message says writes are disabled, but the state prevents loading the Manager altogether. That is too blunt for production administration. A better posture is:

- Always show Config tab if the app can initialize.
- Show read-only runtime proof even if write endpoints are unavailable.
- Disable write actions with reason-specific readiness cards.
- Allow administrators to see and fix the missing property/registry value.

### Configuration Authority Gap

The current setup depends heavily on page/webpart properties plus Azure Functions app settings. This produces drift risk across:

- standalone Foleon Manager;
- homepage Foleon embedded lanes;
- Foleon reader pages;
- safety app;
- Kudos app;
- homepage shell;
- backend function app settings.

## Values Stuck in Webpart Properties

Current page-instance properties include tenant/platform values that should not remain solely page-instance scoped:

- list GUIDs;
- accepted origins;
- expected manifest ID;
- expected package version;
- backend API base URL;
- API resource/audience;
- production preview policy.

## Values That Should Remain Page/Webpart-Specific

- route selection (`foleonRoute`);
- pinned `foleonDocId` for a reader page, if used;
- reader page path when intentionally page-specific;
- display-only overrides;
- temporary diagnostics flag;
- emergency fallback mode if used at page level.

## Values That Should Move to Central Registry

- application key;
- environment key;
- HBCentral hub site URL;
- Marketing-New host page URL;
- content registry list GUID;
- homepage placements list GUID;
- interaction events list GUID;
- sync runs list GUID;
- backend function app URL;
- API resource/audience;
- accepted Foleon origins;
- expected Foleon manifest ID;
- expected Foleon package version;
- expected homepage package version;
- production-only viewer URLs flag;
- preview/admin review behavior;
- validation rules;
- owner group;
- active/inactive and effective dates.

## Values That Must Be Secrets or Secret References

- Foleon API client secret.
- Foleon API client ID if the organization treats it as sensitive.
- backend Graph app credential secrets.
- function host keys.
- service principal client secrets.
- Key Vault URIs can be stored as references; raw values cannot.

## Acceptance Criteria for Closing This Gap

- Manager opens on the Marketing-New host page.
- Manager shows a Config tab even if write readiness is incomplete.
- Runtime readiness explains exactly what is missing.
- Marketing users can manage active content per lane without raw SharePoint list editing.
- Admins can validate the list/API/token configuration from the UI.
- The homepage lanes and Manager consume the same canonical config source, or a clearly documented bridge until registry migration is complete.
