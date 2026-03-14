# W0-G3-T06 — Summary View, Expandable History, and Complexity Rules

> **Doc Classification:** Canonical Normative Plan — Wave 0 Group 3 task plan defining the core summary fields visible to all users of the project setup workflow, the expandable history levels, and the `@hbc/complexity` gate specification table that governs which operational detail is shown at which tier. This plan prevents per-role bespoke view logic.

**Phase Reference:** Wave 0 Group 3 — Shared-Platform Wiring and Workflow Experience Plan
**Depends On:** T02 (ownership fields in summary), T03 (clarification history in expanded view), G3-D5 (history visibility decision), G3-D6 (complexity/role-based detail decision)
**Unlocks:** T07 (complexity integration rules), T08 (summary and complexity tests), G4/G5 summary surface implementations
**Repo Paths Governed:** `packages/complexity/src/`, `apps/estimating/src/`, `apps/accounting/src/`, `apps/admin/src/`, `apps/pwa/src/`

---

## Objective

This task defines two complementary specifications:

1. **The summary field registry** — every field that appears in the compact request summary, what it shows, and whether it is universally visible or tier-gated.

2. **The complexity gate specification table** — field-by-field, tier-by-tier specification of what is shown at Essential, Standard, and Expert complexity tiers. This table is the governing reference that G4/G5 surface teams must follow when implementing `HbcComplexityGate` components.

The G3-D5 locked decision (summary-first, expandable history) and G3-D6 locked decision (complexity for progressive detail, no bespoke role-specific logic) are both operationalized here.

---

## Why This Task Exists

The project setup workflow is visible to three parties with legitimately different information needs:

- **Requester (Estimating app, PWA):** Needs to know "where is my request, what do I need to do, is my site ready?"
- **Controller (Accounting app):** Needs to know "what requests need my attention, what has the requester provided, what is the project number?"
- **Admin (Admin app):** Needs to know "what requests are failing, what are the saga step details, what went wrong?"

Without a governing spec, these different needs would be satisfied by building three separate views — one per role — with duplicated request metadata and divergent history displays. The result is a maintenance burden and an inconsistent experience when the same user holds multiple roles (e.g., an admin who is also a controller).

G3-D6 resolves this. The correct approach is: one canonical summary view with progressive detail controlled by `@hbc/complexity`. A controller who bumps to Expert tier sees the same technical detail that an admin sees. A new Estimating requester at Essential tier sees only what they need to complete their action. No hardcoded role guards.

---

## Scope

T06 specifies:
- The core summary field registry (universally visible fields)
- History expansion levels (what each level shows)
- The complete complexity gate spec table (per field, per tier)
- What complexity tier maps to which user profile in the project setup context
- What the summary looks like at each tier
- What history looks like at each expansion level

T06 does not specify:
- The visual layout of the summary (G4/G5 scope)
- How `@hbc/complexity` is initialized or the role-to-tier mapping (governed by `packages/complexity/src/config/roleComplexityMap.ts`)
- Request data schema (MVP Project Setup T02 and G2 scope)
- The specific components from `@hbc/ui-kit` used to render (G4/G5 scope)

---

## Governing Constraints

- **No bespoke hardcoded role-specific logic.** No `if (role === 'controller') { showProjectNumber() }` patterns. All progressive detail is governed by `HbcComplexityGate` with explicit `minTier` / `maxTier` props (G3-D6).
- **Core summary must be identical across surfaces.** The same core summary fields are displayed in the Estimating app, Accounting app, Admin app, and PWA. The rendering may differ (compact card vs. detail page header) but the field set is the same.
- **`@hbc/complexity` is a P1-tested package.** Its `HbcComplexityGate` component is available and must be used rather than implementing custom gate logic.

---

## Part 1 — Core Summary Fields (Universally Visible)

These fields appear in the project setup request summary for **all users at all complexity tiers**. They represent the minimum information needed to answer "where is this request and what is happening?"

| Field | Source | Display rule |
|-------|--------|-------------|
| **Project name** | `IProjectSetupRequest.projectName` | Always visible |
| **Department** | `IProjectSetupRequest.department` | Always visible; display as "Commercial" or "Luxury Residential" (human-readable, not enum value) |
| **Current status** | `IProvisioningStatus.workflowStage` | Always visible as a human-readable label (e.g., "Under Review", "Clarification Needed", "Provisioning", "Completed") |
| **Current owner** | `IBicNextMoveState.currentOwner.displayName` | Always visible; "In Progress" for system-owned states; "Unassigned" with ⚠ badge for null owner |
| **Expected action** | `IBicNextMoveState.expectedAction` | Always visible; this is the canonical action string from T02 |
| **Submitted at** | `IProjectSetupRequest.submittedAt` | Always visible (relative time: "Submitted 2 days ago") |
| **Urgency tier** | `IBicNextMoveState.urgencyTier` | Always visible as a visual indicator (● red = immediate, ● yellow = watch, ● green = upcoming) |

**What is NOT in the core summary (regardless of tier):**
- Raw saga step results
- Entra ID group IDs
- Azure Function correlation IDs
- Error stack traces
- Internal provisioning status resource version

---

## Part 2 — Expandable History Levels

The request history is collapsed by default. The user expands it explicitly. There are two expansion levels:

### Level 0 — Core Summary (always shown, no expansion needed)

Displays the core summary fields from Part 1 above. No user action required.

### Level 1 — Activity Timeline (first expansion)

**What is shown:**
- Ordered list of lifecycle state transitions with timestamps and actor names (e.g., "Submitted by Jane Smith — March 10, 10:42 AM")
- Clarification request/response pairs (e.g., "Clarification requested by Controller — March 11 · Responded by requester — March 12")
- Notification events fired (e.g., "Notification sent to Controller")
- Handoff events (e.g., "Handoff sent to Project Hub — March 14")

**Who can expand to Level 1:** All users. No tier gate — this is standard visibility.

**Source:** `IProvisioningStatus.stateTransitionHistory[]` + `IRequestClarification[]` (responded items) + handoff status from `@hbc/workflow-handoff`

### Level 2 — Operational Detail (second expansion, complexity-gated)

**What is shown (Standard tier and above):**
- Saga step results (`ISagaStepResult[]`) with step name, status, timestamp, and `idempotentSkip` flag
- List of provisioned structures (libraries, lists created)
- Entra ID group IDs for the three provisioned groups

**What is shown (Expert tier only):**
- Raw error details for failed steps (error message, step index, retry count)
- `statusResourceVersion` and `statusUpdatedAtIso` (for debugging optimistic update issues)
- Throttle backoff records (`throttleBackoffUntilIso` if present)
- Azure Function correlation IDs

**Who can expand to Level 2:** Any user who expands the panel AND whose complexity tier meets the gate. A user at Essential tier will not see Level 2 content (the expansion control is not shown or the panel is empty).

---

## Part 3 — Complexity Gate Specification Table

This table is the governing reference for `HbcComplexityGate` usage in all project setup summary views. G4/G5 implementation agents must wrap content exactly as specified.

**Tier definitions in project setup context:**

| Tier | Who this typically is | What they need |
|------|-----------------------|----------------|
| **Essential** | New Estimating users, field staff using PWA, occasional requesters | Current status, what action to take, link to their site when ready |
| **Standard** | Day-to-day Estimating PMs, Controllers doing routine review | Full request detail, step progress, clarification history, team members |
| **Expert** | Senior PMs, Admins, controllers investigating failures | Saga internals, error details, group IDs, correlation IDs, throttle records |

---

### Summary View — Complexity Gates

| Content | Essential | Standard | Expert | Gate |
|---------|-----------|----------|--------|------|
| Project name | ✓ | ✓ | ✓ | No gate (always visible) |
| Department | ✓ | ✓ | ✓ | No gate |
| Status label | ✓ | ✓ | ✓ | No gate |
| Current owner name | ✓ | ✓ | ✓ | No gate |
| Expected action | ✓ | ✓ | ✓ | No gate |
| Submitted at (relative) | ✓ | ✓ | ✓ | No gate |
| Urgency tier indicator | ✓ | ✓ | ✓ | No gate |
| BIC badge (compact: name + urgency dot) | ✓ | ✓ | ✓ | No gate |
| BIC detail (full: previous → current → next chain) | ✗ | ✓ | ✓ | `minTier="standard"` |
| Blocked reason banner | ✗ | ✓ | ✓ | `minTier="standard"` |
| Team member list (project lead + group members) | ✗ | ✓ | ✓ | `minTier="standard"` |
| Add-ons selected | ✗ | ✓ | ✓ | `minTier="standard"` |
| Project number | ✗ | ✓ | ✓ | `minTier="standard"` |
| Estimated value / contract value | ✗ | ✓ | ✓ | `minTier="standard"` |
| Clarification count (open / responded) | ✗ | ✓ | ✓ | `minTier="standard"` |
| Provisioned site URL | ✓ | ✓ | ✓ | No gate (always visible when state=Completed) |
| Getting-started page link | ✓ | ✓ | ✓ | No gate (always visible when available) |
| Entra ID group IDs | ✗ | ✗ | ✓ | `minTier="expert"` |
| Step count (completed / total) | ✗ | ✓ | ✓ | `minTier="standard"` |
| Last successful saga step | ✗ | ✗ | ✓ | `minTier="expert"` |

---

### History View — Complexity Gates

| Content | Essential | Standard | Expert | Gate |
|---------|-----------|----------|--------|------|
| Activity timeline (Level 1) expansion control | ✓ | ✓ | ✓ | No gate |
| Lifecycle state transitions in timeline | ✓ | ✓ | ✓ | No gate |
| Clarification pairs in timeline | ✓ | ✓ | ✓ | No gate |
| Notification events in timeline | ✗ | ✓ | ✓ | `minTier="standard"` |
| Handoff events in timeline | ✓ | ✓ | ✓ | No gate |
| Operational detail (Level 2) expansion control | ✗ | ✓ | ✓ | `minTier="standard"` |
| Saga step results list | ✗ | ✓ | ✓ | `minTier="standard"` |
| `idempotentSkip` flag per step | ✗ | ✗ | ✓ | `minTier="expert"` |
| Raw error details for failed steps | ✗ | ✗ | ✓ | `minTier="expert"` |
| `statusResourceVersion` | ✗ | ✗ | ✓ | `minTier="expert"` |
| Azure Function correlation IDs | ✗ | ✗ | ✓ | `minTier="expert"` |
| Throttle backoff records | ✗ | ✗ | ✓ | `minTier="expert"` |
| Full clarification message text | ✗ | ✓ | ✓ | `minTier="standard"` |
| Who raised each clarification (name) | ✓ | ✓ | ✓ | No gate |

---

### Implementation Pattern

G4/G5 implementation must follow this pattern for gated content:

```tsx
// CORRECT — use HbcComplexityGate with explicit minTier
<HbcComplexityGate minTier="standard">
  <ProjectNumberDisplay value={request.projectNumber} />
</HbcComplexityGate>

<HbcComplexityGate minTier="expert">
  <EntraGroupIdList groups={request.entraGroups} />
</HbcComplexityGate>

// INCORRECT — do not use raw role checks
{userRole === 'controller' && <ProjectNumberDisplay value={request.projectNumber} />}

// INCORRECT — do not use raw permission checks for detail gating
{permissions.includes('admin') && <EntraGroupIdList groups={request.entraGroups} />}
```

The complexity tier is set by the user via `HbcComplexityDial` (in the app header or settings page). It is not set by the surface or inferred from role at render time. The complexity package's role-to-tier mapping initializes the tier at login, but the user can adjust it. The complexity gate evaluates the current effective tier — regardless of how it was set.

---

## Part 4 — Coaching Prompts (Essential Tier Only)

The `showCoaching` flag in `@hbc/complexity` enables coaching prompts at Essential tier. For the project setup workflow, the following coaching prompts are appropriate:

| Context | Coaching prompt text | `showCoaching` condition |
|---------|---------------------|--------------------------|
| Setup form, Step 1 | "Tip: Fill in as much information as you can — you can always update it later." | showCoaching=true |
| Setup form, Step 2 | "The department you select determines which document libraries and templates are created for your project." | showCoaching=true |
| Setup form, Step 3 | "Your project lead will be added to the Project Leaders group and will have full control of the site." | showCoaching=true |
| Status view, Provisioning state | "Your site is being set up. This typically takes a few minutes. You'll receive an email when it's ready." | showCoaching=true |

Coaching prompts are hidden at Standard and Expert tiers (`maxTier="essential"` for coaching content). They must not clutter the experience for experienced users.

```tsx
<HbcComplexityGate maxTier="essential">
  <CoachingPrompt text="Tip: Fill in as much information as you can — you can always update it later." />
</HbcComplexityGate>
```

---

## Required Outputs

| Artifact | Location | Description |
|----------|----------|-------------|
| Complexity gate spec table | `docs/reference/workflow-experience/complexity-gate-spec.md` | Complete field-by-field, tier-by-tier gate specification for all summary and history surfaces |

The reference document must include:
- Core summary field registry table
- Expandable history levels description
- Summary view complexity gate table
- History view complexity gate table
- Implementation pattern example (correct vs. incorrect)
- Coaching prompt registry

---

## Acceptance Criteria

- [ ] Core summary field registry is complete (7 always-visible fields specified)
- [ ] History Level 0, Level 1, and Level 2 are defined with content lists
- [ ] Summary view complexity gate table is complete (all fields with tier and gate prop)
- [ ] History view complexity gate table is complete
- [ ] No bespoke role-specific logic is present anywhere in the spec
- [ ] Implementation pattern example shows correct `HbcComplexityGate` usage
- [ ] Coaching prompts for Essential tier are specified
- [ ] Reference document exists at `docs/reference/workflow-experience/complexity-gate-spec.md`
- [ ] Reference document is added to `current-state-map.md §2`

---

*End of W0-G3-T06 — Summary View, Expandable History, and Complexity Rules v1.0*
