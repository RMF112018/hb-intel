# W0-G4-T05 — Completion Confirmation and Optional Project Hub Handoff

> **Doc Classification:** Canonical Normative Plan — implementation-governing task plan for Wave 0 Group 4, Task 05. Specifies the completion confirmation experience in the Estimating SPFx surface, what is shown when provisioning finishes, what "Open Project Hub" means, how the optional navigation works, and why no forced redirect occurs.

**Version:** 1.0
**Date:** 2026-03-14
**Status:** Active — implementation requires T01 to be locked and G3 acceptance gate satisfied
**Parent Plan:** `W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
**Governed by:** CLAUDE.md v1.6 → `current-state-map.md` → G3 master plan → G4 master plan → this document
**Depends on:** T01 (RequestDetailPage composition, Completed state slot reservation)
**Unlocks:** T07 (handoff failure modes), T08 (completion handoff tests)
**Phase 7 gate:** ADR-0091 must exist on disk before implementation begins

---

## 1. Objective

Define the complete implementation specification for the project setup completion confirmation and optional Project Hub handoff surface. This covers:

- The completion confirmation experience in `RequestDetailPage.tsx` (Estimating SPFx) when `request.state === 'Completed'`
- What is shown when provisioning finishes: provisioned site summary, completion details, and the project workspace orientation
- How "Open Project Hub" is framed and what it navigates to
- Why no forced redirect is implemented
- How Project Hub is understood as the curated destination within the project's SharePoint site (a distinct URL from the Estimating SPFx host)
- How `@hbc/workflow-handoff` is composed for the handoff package
- What `@hbc/ui-kit` components govern the completion and handoff surface

---

## 2. Why This Task Exists

When provisioning completes, the requester and coordinator have reached a meaningful milestone: the project site is now live, the team has access, and the structured workspace is ready. The experience at that moment matters — it should feel like an accomplishment and a clear starting point, not an abrupt end with a redirect they didn't choose.

The current `RequestDetailPage.tsx` does not handle `Completed` state in any way beyond showing the `ProvisioningChecklist` (which displays step results). There is no completion confirmation, no summary of what was created, and no path to Project Hub. T05 adds that experience.

The design decision (G4-D6) is explicit: hybrid confirmation plus optional navigation. No forced redirect. This is not a preference — it is a governing constraint. Users who just completed a project setup may need to stay in Estimating to submit another request, check on other bids, or communicate with colleagues. Taking control away from them at completion destroys trust.

---

## 3. Scope

### 3.1 In Scope

- Completion confirmation surface within `RequestDetailPage.tsx` in `apps/estimating/`
- Provisioned site summary display (what was created, site URL, team structure)
- "Open Project Hub" optional action — link construction, navigation behavior
- `@hbc/workflow-handoff` composition for the handoff package (`HbcHandoffComposer`)
- Post-completion states visible to requester and coordinator
- `@hbc/ui-kit` component assignments for all completion surface elements
- Project Hub landing/onboarding entry point in `apps/project-hub/` (minimal — see §8)

### 3.2 Out of Scope

- The provisioning saga itself (G2/backend scope)
- Project Hub's full dashboard or feature surfaces (those exist already and are not modified by T05)
- Admin or controller completion views (their surfaces already show state via the same provisioning store)
- PWA equivalent completion surface (G5)

---

## 4. Governing Constraints

1. **No forced redirect.** The completion confirmation must not automatically navigate to Project Hub. No redirect-on-mount, no countdown timer, no "you will be redirected in 5 seconds" pattern. The "Open Project Hub" action is exclusively user-initiated.
2. **Project Hub is a different SharePoint site URL.** The navigation is cross-site — not an in-app route change. The link must be constructed from the provisioned site URL.
3. **`@hbc/workflow-handoff` governs the handoff package assembly.** T05 must not implement its own "redirect on completion" mechanism outside the handoff package model.
4. **`@hbc/ui-kit` is the required source of all shared UI components.** No app-local completion/handoff component systems.
5. **The completion confirmation must persist.** It must not disappear after a timeout or on the next load. Once a request is in `Completed` state, the completion confirmation is the canonical view for that request in Estimating.
6. **The site URL must be validated before rendering.** The "Open Project Hub" link must not be rendered if the provisioned site URL is absent or malformed in the provisioning status payload.

---

## 5. Completion State Detection

### 5.1 When Completion Triggers

The completion confirmation renders when `request.state === 'Completed'` in `RequestDetailPage.tsx`. This state may be reached via:

1. **Real-time:** `useProvisioningSignalR()` emits a state change event that updates the store while the requester is on the page
2. **On-load:** The requester navigates back to a request that was already completed (e.g., they return the next day)

Both cases must render the same completion confirmation surface. The experience must be identical regardless of whether the user witnessed the completion in real time or arrived at an already-completed request.

### 5.2 Data Sources

The completion surface requires two data sources:

1. `IProjectSetupRequest` — the original request fields (project name, department, type, stage, team)
2. `IProvisioningStatus` — the provisioning outcome (site URL, completion timestamp, step results)

Both are available in `RequestDetailPage.tsx` via `useProvisioningStore()` and `client.getProvisioningStatus(projectId)`.

**Required field on `IProvisioningStatus`:** `siteUrl: string` — the URL of the provisioned SharePoint site. Verify this field exists on the current `IProvisioningStatus` type in `@hbc/models`. If absent, it must be added before T05 implementation can render the Project Hub link.

---

## 6. Completion Confirmation Surface Composition

The completion confirmation replaces the standard status display area in `RequestDetailPage.tsx` when `request.state === 'Completed'`. It occupies a primary content section — not a toast or a banner appended to the bottom of an existing layout.

### 6.1 Surface Layout

```
HbcCard (variant: elevated or featured) — "Project Setup Complete"
├── Completion header
│   ├── HbcStatusBadge variant="success" — "Completed"
│   ├── HbcTypography heading — "Your project site is ready"
│   └── Completion timestamp
├── Provisioned site summary section
│   ├── Project name, department, type
│   ├── Site URL (rendered as link — opens in new tab)
│   ├── Team access summary ("3 access groups configured")
│   └── HbcComplexityGate standard: full step summary
├── Project Hub handoff section
│   ├── HbcTypography body — brief orientation paragraph (see §6.3)
│   ├── HbcButton variant="primary" — "Open Project Hub" (see §7)
│   └── HbcButton variant="secondary" — "Stay in Estimating" (dismisses the handoff section only)
└── ProvisioningChecklist (existing component, in summary mode)
    └── Displays all steps as Completed with timestamps
```

### 6.2 Completion Header

The header communicates three things clearly: success, the project name, and the time it was completed.

- `HbcStatusBadge variant="success"` with label "Provisioning Complete"
- `HbcTypography` heading: `"Your project site is ready"` (or `"{projectName} is ready"` — product owner to confirm)
- Completion timestamp: `provisioningStatus.completedAt` formatted as `"Completed on {date} at {time}"`

### 6.3 Project Hub Orientation Paragraph

The handoff section's orientation text must communicate:
- What Project Hub is: "Your project workspace — a curated hub within your project's SharePoint site — is now available."
- What it contains: "Use it to manage documents, track your team, and access project controls."
- That it's optional: "You can open it now or return any time from the project summary."

This text must be static copy defined in the app — not a dynamic API-generated string. Exact wording is subject to product owner review but the structure above must be the basis.

### 6.4 "Stay in Estimating" Behavior

When the user clicks "Stay in Estimating," the Project Hub handoff section (the orientation paragraph and "Open Project Hub" button) is hidden. The completion header and provisioned site summary remain visible. A session flag (not draft-persisted, just component state) records that the user dismissed the handoff prompt for this session so it does not re-appear on the same session's re-visit.

This is not a permanent preference — if the user navigates away and returns in a new session, the handoff section may re-appear. This behavior avoids dismissal state persisting across users (e.g., on shared devices).

---

## 7. "Open Project Hub" Link Construction and Navigation

### 7.1 Site URL Source

The Project Hub link is constructed from `provisioningStatus.siteUrl` — the provisioned SharePoint site URL. This is a different URL from the Estimating app's SharePoint host.

**Example:**
- Estimating app host: `https://contoso.sharepoint.com/sites/HBIntelEstimating`
- Provisioned project site: `https://contoso.sharepoint.com/sites/ProjectABC` (or whatever naming convention G1-T01 specifies)

The "Open Project Hub" link navigates to the provisioned project site URL, not to a route within the Estimating app.

### 7.2 Link Validation

Before rendering the "Open Project Hub" button:

```typescript
const projectHubUrl = provisioningStatus?.siteUrl
  ? `${provisioningStatus.siteUrl}` // or append a Project Hub page path if known
  : null;

// Validation: URL must be an HTTPS SharePoint URL
const isValidUrl = projectHubUrl &&
  projectHubUrl.startsWith('https://') &&
  projectHubUrl.includes('.sharepoint.com');
```

If `isValidUrl` is false, do not render the button. Instead, render a `HbcBanner variant="warning"` with: "Project site URL is not yet available. Check back in a few moments, or contact Admin if this persists."

### 7.3 Navigation Behavior

The "Open Project Hub" button opens the project site URL in a **new browser tab** (`window.open(projectHubUrl, '_blank', 'noopener,noreferrer')`). It does not navigate the current tab away from Estimating. This preserves the user's position in the Estimating app — they can return by switching back to the Estimating tab.

**Rationale:** Opening in a new tab is the correct behavior for cross-site navigation in SPFx contexts. A same-tab navigation would destroy the Estimating app's current state (including any other open requests).

### 7.4 The Project Hub Destination Page

When the user arrives at the provisioned project site URL, they should see the Project Hub webpart on the project site's front page (or a dedicated landing page). T05 specifies a minimal onboarding entry point for Project Hub in §8.

---

## 8. Project Hub Onboarding Entry Point (`apps/project-hub/`)

T05's Project Hub scope is narrow and deliberate: the `DashboardPage.tsx` in `apps/project-hub/src/pages/` is the existing home page of the Project Hub webpart. T05 adds a **conditional onboarding welcome section** to `DashboardPage.tsx` that is shown only when a project was recently provisioned (within a configurable window, e.g., 7 days of the `completedAt` timestamp).

### 8.1 Welcome Section Composition

```tsx
// Shown when project.provisionedAt is within 7 days
{isNewlyProvisioned && (
  <HbcCard variant="featured">
    <HbcTypography heading>Welcome to your Project Hub</HbcTypography>
    <HbcTypography body>
      Your project workspace has been set up. Explore documents, review your team,
      and start using your project controls.
    </HbcTypography>
    <HbcButton variant="secondary">Dismiss</HbcButton>
  </HbcCard>
)}
```

**`isNewlyProvisioned` determination:** Compare `project.provisionedAt` (from `IActiveProject` or `IProjectSetupRequest` via the provisioning store) to `Date.now()`. If within 7 days, show the welcome card. If `provisionedAt` is not available on `IActiveProject`, this feature degrades gracefully — the welcome card is simply not shown.

### 8.2 What the Welcome Section Must Not Do

- Must not re-run the setup wizard
- Must not show provisioning retry controls
- Must not show admin or controller content
- Must not require the user to take any action to proceed — it is purely informational and dismissable

---

## 9. `@hbc/workflow-handoff` Composition

T05 uses `@hbc/workflow-handoff` to assemble the completion handoff package that signals the Estimating → Project Hub transition. This is not a visual handoff composer (like `HbcHandoffComposer`) — it is a background data assembly using `usePrepareHandoff()`.

### 9.1 Handoff Package Assembly

When `request.state === 'Completed'` and `provisioningStatus.siteUrl` is available, T05 calls:

```typescript
const { handoffPackage, prepareStatus } = usePrepareHandoff<
  IProjectSetupRequest,  // source type (Estimating context)
  IProjectRecord         // destination type (Project Hub context)
>({
  config: projectSetupHandoffConfig, // from G3-T02 handoff route spec
  sourceItem: request,
  destinationContext: { siteUrl: provisioningStatus.siteUrl }
});
```

The `projectSetupHandoffConfig` is the `IHandoffConfig<IProjectSetupRequest, IProjectRecord>` produced by G3-T02. T05 applies that config — it does not define its own handoff configuration.

### 9.2 Handoff Status Badge

After the handoff package is prepared, `HbcHandoffStatusBadge` from `@hbc/workflow-handoff` renders the handoff status in the completion confirmation card. This communicates to the coordinator that the handoff event has been logged — not just that a link was shown.

### 9.3 What T05 Does Not Use from `@hbc/workflow-handoff`

`HbcHandoffComposer` is for interactive handoff composition (the sender assembling a rich handoff package with notes and sign-off). T05 does not use this — the completion handoff in Wave 0 is automatic upon provisioning completion, not an interactive user-composed handoff. `HbcHandoffComposer` is reserved for future Wave 1 workflow family handoffs where interactive sign-off is required.

---

## 10. Post-Completion States Visible to Requester and Coordinator

Once `request.state === 'Completed'`, the following information must remain accessible to both the requester and coordinator in `RequestDetailPage.tsx`:

| Information | Always Visible | Standard Tier | Expert Tier |
|-------------|---------------|---------------|-------------|
| Completion confirmation card (§6.1) | ✓ | | |
| Project Hub link (if valid) | ✓ | | |
| Provisioned site URL | ✓ | | |
| Completion timestamp | ✓ | | |
| ProvisioningChecklist (summary) | ✓ | | |
| Full step-level results with timestamps | | ✓ | |
| Step duration per step | | ✓ | |
| Internal request ID | | | ✓ |
| Raw step results/payloads | | | ✓ |

The completion state is a terminal state — no further action is expected from the requester or coordinator after completion. The surface should communicate finality clearly.

---

## 11. `@hbc/ui-kit` Component Assignments

| Completion Surface Element | Required Component | Notes |
|----------------------------|--------------------|-------|
| Completion card | `HbcCard` (elevated/featured variant) | Primary completion surface |
| Success badge | `HbcStatusBadge variant="success"` | Provisioning Complete |
| Completion heading | `HbcTypography` heading | "Your project is ready" |
| Site URL link | `HbcTypography` + HTML `<a>` | Opens project site in new tab |
| "Open Project Hub" button | `HbcButton variant="primary"` | Cross-site navigation |
| "Stay in Estimating" button | `HbcButton variant="secondary"` | Dismisses handoff section |
| Site unavailable banner | `HbcBanner variant="warning"` | When siteUrl not valid |
| Handoff status badge | `HbcHandoffStatusBadge` (from `@hbc/workflow-handoff`) | Handoff event logged |
| Welcome card (Project Hub) | `HbcCard variant="featured"` | In DashboardPage |
| Step summary | `ProvisioningChecklist` (summary mode) | Existing component |
| Complexity-gated detail | `HbcComplexityGate` | Step detail, expert fields |

---

## 12. Known Risks and Pitfalls

**R1 — `IProvisioningStatus.siteUrl` field not confirmed:**
If `siteUrl` is not on `IProvisioningStatus` in `@hbc/models`, the Project Hub link cannot be constructed. This is a hard dependency. Confirm its existence before T05 implementation. If absent, it must be added to the model as part of G2/backend work.

**R2 — `@hbc/workflow-handoff` configuration not yet locked:**
The `IHandoffConfig<IProjectSetupRequest, IProjectRecord>` from G3-T02 is required before `usePrepareHandoff()` can be called with the correct configuration. If G3-T02 is not locked, T05 cannot complete the handoff assembly portion. The completion confirmation card (without the handoff badge) can be implemented first; the handoff assembly is added when the G3-T02 config is locked.

**R3 — `IActiveProject.provisionedAt` field may not exist:**
The Project Hub welcome card in `DashboardPage.tsx` depends on a `provisionedAt` timestamp on the project model. This may not exist on `IActiveProject` in `@hbc/models`. If absent, the welcome card degrades gracefully (not shown). This is acceptable for Wave 0 — do not add a fake or hardcoded `provisionedAt` value.

**R4 — Cross-site navigation in SPFx contexts:**
SPFx webparts operate within a SharePoint page. Navigation to a different SharePoint site using `window.open` is the safest approach in SPFx. Using `<Link>` from TanStack Router would only route within the current app. Confirm that `window.open` is used for the Project Hub link — not an internal router navigation.

---

## 13. Acceptance Criteria

T05 is complete when all of the following are true:

- [ ] `RequestDetailPage.tsx` renders the completion confirmation card when `request.state === 'Completed'`
- [ ] Completion card shows: success badge, heading, completion timestamp, site URL, team access summary, orientation paragraph
- [ ] "Open Project Hub" button is rendered only when `siteUrl` is present and valid
- [ ] "Open Project Hub" opens the project site in a new tab (not same-tab navigation, not auto-redirect)
- [ ] "Stay in Estimating" button dismisses the handoff section without navigating away
- [ ] `usePrepareHandoff()` is called with G3-T02 config when `siteUrl` is available
- [ ] `HbcHandoffStatusBadge` renders the handoff status in the completion card
- [ ] `DashboardPage.tsx` in Project Hub shows a dismissable welcome card for recently provisioned projects (degrades gracefully if `provisionedAt` is absent)
- [ ] No auto-redirect, countdown timer, or forced navigation to Project Hub
- [ ] No app-local reusable completion/handoff component systems
- [ ] Build, lint, and type-check pass
- [ ] Reference document exists at `docs/reference/spfx-surfaces/completion-handoff-spec.md`

---

*End of W0-G4-T05 — Completion Confirmation and Optional Project Hub Handoff v1.0*
