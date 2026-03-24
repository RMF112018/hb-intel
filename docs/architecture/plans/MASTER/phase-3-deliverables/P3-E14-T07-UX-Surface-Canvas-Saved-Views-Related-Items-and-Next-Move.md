# P3-E14-T07 — UX Surface, Canvas, Saved Views, Related Items, and Next Move

| Property | Value |
|----------|-------|
| **Doc ID** | P3-E14-T07 |
| **Parent** | [P3-E14 Project Warranty Module](P3-E14-Project-Warranty-Module-Field-Specification.md) |
| **Phase** | Phase 3 |
| **Workstream** | E (Module Implementation) |
| **Part** | T07 of 10 |
| **Owner** | Project Hub Leadership |
| **Last Updated** | 2026-03-24 |
| **Status** | Governing — locked architecture |

---

## 1. UX Philosophy: The Warranty Canvas

The Warranty module is not a claims ledger — it is the PM's active control surface for managing contractual obligations that run for years after project completion. The UX must reflect this:

- **Work-first, not list-first.** Entry should surface what requires action, not dump a flat record list.
- **Responsibility-visible.** Every case carries an unambiguous current owner. The PM must always be able to see who holds the ball.
- **Context-connected.** Warranty cases do not exist in isolation. Linked turnover packages, commissioning records, and financial back-charge advisories belong in the PM's view.
- **Complexity managed.** A project with 3 open cases and a project with 80 need different visual density. The complexity dial (§8) adapts without requiring layout configuration.
- **AI embedded, not sidecar.** Assistive intelligence appears where the PM is already working — on the case, on the coverage item — not in a separate "AI panel" the PM must navigate to.

These principles align with `docs/explanation/design-decisions/ux-mold-breaker.md` and govern all Phase 3 implementation decisions for this module.

---

## 2. Primary UX Surfaces

The Warranty module delivers three primary UX surfaces in Phase 3:

| Surface | Record focus | Primary user |
|---|---|---|
| **Coverage Registry** | `WarrantyCoverageItem` | PM, WARRANTY_MANAGER |
| **Warranty Case Workspace** | `WarrantyCase` and linked records | PM, WARRANTY_MANAGER, PX |
| **Canvas Tile** | Derived health metrics | PM, PX, all project roles |

All three surfaces are `@hbc/features-project-hub`-owned and composed from `@hbc/ui-kit` components. No feature-local reusable visual primitives may be created.

---

## 3. Coverage Registry Surface

### 3.1 Entry state by role

The Coverage Registry opens to an active-work orientation, not a full flat list.

| Role | Entry state |
|---|---|
| PM | "Active Coverage" system view — coverage items that are live, with expiration status visible; items expiring within 30 days surface with advisory treatment |
| WARRANTY_MANAGER | Same as PM |
| PX | Portfolio posture view — coverage items across projects if PX has multi-project access; scoped to single project if navigating from a project card |
| APM / PA | "Active Coverage" view, read-only |
| Admin | Full record list with admin-only columns visible |

### 3.2 Smart empty state

When a project has no coverage items registered:

> **Empty state:** "No warranty coverage items are registered for this project. Add coverage items from the turnover package or register them manually. [Add Coverage Item] [Link Turnover Package]"

When a project has coverage items but no active cases:

> **Empty state (case list on registry):** "No open warranty cases. Coverage is registered and active. [Log Owner Report] [Create Case]"

The empty state must not be a bare "No records found" message. It must orient the PM to the correct next action and link to the path.

### 3.3 Coverage item row anatomy

Each coverage item in the registry row shows (Essential tier):
- Coverage type badge (Product / Labor / System)
- Item title and scope label
- Warranty period (start → end date)
- Expiration status (Active / Expiring / Expired)
- Open case count linked to this item

Standard tier adds: Responsible subcontractor, Turnover linkage indicator, Last activity timestamp.

Expert tier adds: Source warranty document reference, commissioning linkage, back-charge advisory count.

---

## 4. Warranty Case Workspace

### 4.1 Case workspace layout

The Case Workspace is a full-surface view for an individual `WarrantyCase`. It is not a slide-over panel — it is the primary working surface for case management.

The workspace is structured in three zones:

**Zone A — Identity and Status Bar (top)**
- Case title, case ID, project reference
- Current status badge in owner-facing plain language (T05 §4.2) with internal enum visible on hover
- SLA indicator: remaining time or overdue state (colored, not just a text label)
- Responsible party badge (current Next Move owner)
- Primary action button (derived from Next Move model, §5)

**Zone B — Work Area (center, tabbed)**
- **Overview tab**: coverage item linkage, issue description, location, owner intake summary (if originated from owner report)
- **Timeline tab**: `IWarrantyCommunicationEvent` records in reverse chronological order; owner contact history
- **Evidence tab**: `IWarrantyCaseEvidence` records with preview thumbnails; add-evidence affordance
- **Assignment tab**: subcontractor assignment, acknowledgment status, dispute state
- **Related Items tab**: linked turnover package, commissioning record, financial back-charge advisory, related cases

**Zone C — Next Move panel (right sidebar or bottom card on mobile)**
- Full Next Move card (§5.2)
- SLA deadline with time-to-due or overdue state
- Blocking reason if case is blocked
- Previous and next owner visibility

### 4.2 Owner Status Summary block

On cases with an associated `OwnerIntakeLog`, the Overview tab surfaces a dedicated **Owner Status Summary** block:

- Owner-facing status text (from T05 §4.2 mapping)
- Last logged communication (channel, date, summary)
- Next expected milestone
- Back-charge advisory status if applicable

This block is the PM's "what do I tell the owner when they call" prompt. It must be above the fold on the Overview tab.

### 4.3 Communications tab

The Timeline/Communications tab is visible only on cases with an associated `OwnerIntakeLog`. It shows:

1. The original intake record (owner's issue as reported)
2. All `IWarrantyCommunicationEvent` records in reverse chronological order
3. Empty state: "No communications logged yet. Use this log to track every owner update."
4. Add Communication button (PM / WARRANTY_MANAGER only)

Communication event rows show: direction indicator (inbound/outbound arrow), channel icon, date, and PM-entered summary.

---

## 5. Next Move Model

### 5.1 Next Move as the PM's primary workflow driver

The Warranty module participates in the platform-wide Next Move framework (`docs/explanation/design-decisions/ux-mold-breaker.md`). Every open case has exactly one Next Move item at any moment. The Next Move item answers the PM's key question: **"What should I do right now on this case, and whose responsibility is it?"**

The Next Move surface is not a checklist. It is a single high-signal prompt that reflects the case's current blocking condition and the most valuable action available.

### 5.2 Next Move card anatomy

Each Warranty Next Move item carries:

| Field | Content |
|---|---|
| `currentOwner` | Role label: PM / WARRANTY_MANAGER / PX / SUBCONTRACTOR (pm-tracked in Phase 3) / SYSTEM |
| `expectedAction` | Concise action label (see §5.3) |
| `dueAt` | Absolute deadline (ISO datetime), rendered as relative time ("3 days left" / "2 days overdue") |
| `urgency` | Normal / Warning / Overdue / Blocked |
| `blockingReason` | Human-readable blocking condition if `urgency = Blocked` |
| `escalationPath` | Who escalation goes to if this item ages past its threshold |
| `previousOwner` | Who held the ball before the current owner (context for handoff) |
| `nextOwner` | Who will receive the ball after the current action completes |

### 5.3 Next Move action catalog (Phase 3)

| Case state | Acknowledgment state | Next Move action | Owner |
|---|---|---|---|
| `Open` | — | Evaluate coverage and make coverage decision | PM |
| `PendingCoverageDecision` | — | Complete coverage review and assign or close | PM |
| `Assigned` | `Pending` | Contact subcontractor and confirm acknowledgment | PM |
| `Assigned` | `Acknowledged` | Record subcontractor scope acceptance or dispute | PM |
| `Assigned` | `ScopeDisputed` | Resolve scope dispute before repair can proceed | PM |
| `AwaitingSubcontractor` | — | Follow up with subcontractor on scheduling | PM |
| `AwaitingOwner` | — | Awaiting owner input or site access — follow up | PM |
| `Scheduled` | — | Confirm visit occurred; record outcome | PM |
| `InProgress` | — | Confirm completion declaration from subcontractor | PM |
| `Corrected` | — | Schedule and conduct verification inspection | PM / WARRANTY_MANAGER |
| `PendingVerification` | — | Complete verification and record outcome | PM / WARRANTY_MANAGER |
| `NotCovered` | — | Log communication to owner: not covered | PM |
| `Denied` | — | Log communication to owner: claim denied | PM |
| `Closed` | — | (No open action) | — |

### 5.4 Communication cadence advisory as Next Move nudge

The update cadence advisory (T05 §4.4) surfaces as a low-priority Next Move nudge on cases with an associated intake log where no communication has been logged within the advisory threshold:

- Expedited case, no communication in 3 days: `"No owner update logged in 3 days on an expedited case"`
- Standard case, no communication in 7 days: `"No owner update logged in 7 days"`

The nudge is dismissible by the PM and does not block case transitions.

---

## 6. Saved Views

### 6.1 Saved view support

Both the Coverage Registry and the Case Workspace list support saved views via `@hbc/saved-views` (SF26). Saved views persist filter state, column selection, sort order, and grouping.

### 6.2 Saved view scopes

| Scope | Description | Who can create |
|---|---|---|
| Personal | Visible only to the user who created it | Any user with view access |
| Team | Visible to all project team members | PM, WARRANTY_MANAGER |
| System | Pre-defined; not editable; may not be deleted | Admin / Platform |

### 6.3 System views — Coverage Registry

| View name | Filter definition |
|---|---|
| Active Coverage | `coverageStatus = Active` |
| Expiring Within 30 Days | `coverageStatus = Active AND warrantyEndDate ≤ today + 30d` |
| Expired Coverage | `coverageStatus = Expired` |
| Coverage With Open Cases | `coverageStatus = Active AND openCaseCount > 0` |
| All Coverage | No filter — full coverage registry |

### 6.4 System views — Case Workspace

| View name | Filter definition |
|---|---|
| My Open Cases | `caseStatus NOT IN (Closed, Voided, Duplicate) AND assignedPmId = currentUser` |
| All Open Cases | `caseStatus NOT IN (Closed, Voided, Duplicate)` |
| Overdue Cases | `slaStatus = Overdue` |
| Expedited Cases | `slaTier = Expedited AND caseStatus NOT IN (Closed, Voided)` |
| Disputed Cases | `acknowledgmentStatus = ScopeDisputed AND caseStatus != Closed` |
| Awaiting Owner | `caseStatus = AwaitingOwner` |
| Closed This Month | `caseStatus = Closed AND closedAt >= startOfCurrentMonth` |
| Back-Charge Flagged | `isBackChargeAdvisory = true` |

### 6.5 Saved view governance

System views are defined in `@hbc/features-project-hub` warranty constants. They are rendered by `@hbc/saved-views` but their filter definitions are authored and versioned in the feature package. System view filters may not be overridden by project configuration.

---

## 7. Related Items and Work Graph

### 7.1 What Warranty publishes to Related Items

The Warranty module publishes to `@hbc/related-items` (P3-D4) so that warranty entities surface in the Related Items panel of adjacent records across Project Hub.

#### Outbound publications (Warranty → Related Items)

| Source record | Target record type | Relationship label | Direction |
|---|---|---|---|
| `WarrantyCase` | `WarrantyCoverageItem` | "Under coverage" | Warranty → Coverage |
| `WarrantyCase` | Subcontractor / Buyout record | "Responsible contractor" | Warranty → Financial |
| `WarrantyCase` | `OwnerIntakeLog` | "Owner report" | Warranty → Intake |
| `WarrantyCase` | `WarrantyCase` (duplicate) | "Consolidated with" | Warranty → Warranty |
| `WarrantyCoverageItem` | Closeout turnover package | "From turnover" | Warranty → Closeout |
| `WarrantyCoverageItem` | Startup commissioning record | "Commissioning reference" | Warranty → Startup |
| `IWarrantyCaseResolutionRecord` | `WarrantyCase` | "Resolves" | Warranty → Warranty |

#### Inbound consumption (Other modules → Warranty)

| Source module | Published record | What Warranty surfaces |
|---|---|---|
| Closeout | Turnover package | Coverage items sourced from turnover; linked in coverage item detail |
| Startup | Commissioning record | System commissioning reference in coverage item detail |
| Financial | Back-charge record | Back-charge advisory follow-up status in case workspace |

### 7.2 Turnover and commissioning context in the Case Workspace

When a `WarrantyCoverageItem` has an associated `ICloseoutTurnoverRef` or `IStartupCommissioningRef`, the Case Workspace **Related Items tab** surfaces:

- Turnover package name, turnover date, and link to the Closeout surface
- Commissioning record name, commissioning date, and link to the Startup surface
- Coverage item details sourced from these records (e.g., system type, warranty period)

The PM sees this context inline in the case — not as a separate navigation step. The PM does not need to leave the warranty workspace to understand what was turned over or commissioned for the affected item.

### 7.3 PER visibility

PER (Portfolio Executive Reviewer) sees warranty-related items in the Related Items panel with read-only access. PER does not have write affordances on Warranty surfaces in Phase 3. No annotation scope is defined for Warranty records in Phase 3.

---

## 8. Complexity Dial

### 8.1 Dial behavior in the Warranty module

The Warranty module implements the platform complexity dial (Essential / Standard / Expert) on both the Coverage Registry and the Case Workspace. The dial does not change what records are accessible — it changes visual density and the depth of surfaced fields.

### 8.2 Coverage Registry complexity tiers

| Tier | Visible columns and affordances |
|---|---|
| Essential | Coverage type badge, title, expiration status, open case count |
| Standard | + Responsible subcontractor, turnover linkage indicator, last activity timestamp |
| Expert | + Source warranty document reference, commissioning linkage, back-charge advisory count, internal notes |

### 8.3 Case Workspace complexity tiers

| Tier | Visible sections and fields |
|---|---|
| Essential | Status bar, identity fields, Next Move card, issue description, location, communications summary |
| Standard | + Assignment details, acknowledgment status, SLA detail, evidence list, related items |
| Expert | + Full SLA calculation breakdown, audit trail, system log entries, admin actions, record IDs |

### 8.4 Dial defaults by role

| Role | Default tier |
|---|---|
| PM | Standard |
| WARRANTY_MANAGER | Standard |
| PX | Essential (command posture) |
| APM / PA | Essential |
| Admin | Expert |

The user may override their default. The setting persists per-user, not per-project.

---

## 9. Permission Explainability

### 9.1 Show-me-why pattern

The Warranty module implements the platform permission transparency pattern: when an action is visible but disabled, a "Why is this disabled?" affordance is available on hover or focus.

Examples:

| Situation | Visible but disabled | Explainer text |
|---|---|---|
| PM cannot close a case without a resolution record | "Close Case" button is greyed | "A resolution record is required before closing. [Create Resolution Record]" |
| APM cannot assign subcontractors | "Assign Sub" button is hidden | (not shown — hidden for APM; only PMs and WARRANTY_MANAGERs see this action) |
| PM cannot reopen a case (only PX can) | "Reopen" visible, disabled | "Only a Project Executive can reopen a closed case." |
| Coverage item is expired and cannot be linked to a new case | "Link to Case" disabled | "This coverage item is expired. New cases cannot be opened against expired coverage." |

### 9.2 Actions hidden vs. disabled

The module follows a clear rule: actions that a user will never have permission for are hidden entirely. Actions the user is momentarily blocked from are visible but disabled with an explainer. This prevents confusion about whether an action exists at all versus being temporarily unavailable.

---

## 10. AI and HBI Assistive Behaviors

### 10.1 Embedded in work, not floating beside it

AI/HBI behaviors in the Warranty module appear in-context as the PM works a case. They do not live in a separate "AI panel" or require the PM to leave the working surface.

### 10.2 Phase 3 assistive behaviors

| Location | Behavior | Trigger |
|---|---|---|
| Case coverage decision | **Coverage classification suggestion** — HBI surfaces the most likely coverage type (Product/Labor/System) based on the issue description | PM enters issue description in new case |
| Coverage Registry | **Expiration advisory** — HBI flags coverage items where open cases may not resolve before expiration | PM views registry with open cases near expiration |
| Back-charge advisory | **Back-charge probability flag** — HBI surfaces a back-charge advisory signal when case resolution pattern and subcontractor assignment history suggest back-charge is warranted | PM enters resolution notes with dispute history |
| SLA escalation | **Natural language SLA status** — instead of a raw date, surfaces "3 days remaining on expedited repair window — repair window closes [date]" | SLA within warning threshold |
| Dispute path | **Dispute resolution suggestion** — based on similar scope and sub, HBI surfaces the outcome history of similar disputes | PM opens a scope dispute |

### 10.3 HBI behavior governance

- HBI suggestions are advisory only. They do not pre-fill required fields or auto-advance case state.
- HBI suggestions appear as inline prompts with a "Use this" and "Dismiss" affordance.
- Every HBI-assisted entry is recorded with a provenance flag in the audit trail so downstream review can identify AI-assisted data entries.
- HBI behaviors in Phase 3 are surfaced as placeholder hooks if the underlying `@hbc/hbi` package is not production-ready at Phase 3 build time. The UI scaffolding must not block launch on HBI readiness.

---

## 11. Canvas Tile

### 11.1 Warranty canvas tile

The Warranty module contributes one canvas tile to the Project Home canvas (governed by P3-C2). The tile content is derived from Health spine metrics (T09) — not from direct record queries at render time.

**Essential tier tile content:**
- Count of open warranty cases
- Count of overdue cases (SLA exceeded) — displayed with urgency treatment if > 0
- "View Cases" quick link

**Standard tier tile content (additions):**
- Count of coverage items expiring within 30 days
- Count of cases awaiting owner input
- "View Coverage" quick link

**Expert tier tile content (additions):**
- Back-charge advisory count
- Disputed acknowledgment count

### 11.2 Tile role visibility

The tile is visible to: PM, APM, PA, PX, WARRANTY_MANAGER, PER (read-only aggregate view). The tile is not visible to external roles in Phase 3.

### 11.3 Tile governance

The tile is a core canvas tile governed by P3-C2. It may not be removed from the canvas by project configuration. Its data is consumed from published Health signals, not from runtime queries.

---

## 12. Surface Boundaries: Phase 3 vs. Deferred

| Surface or capability | Phase 3 | Deferred |
|---|---|---|
| Coverage Registry | ✓ | — |
| Warranty Case Workspace | ✓ | — |
| Canvas tile with Health-derived metrics | ✓ | — |
| Communications tab with owner intake log | ✓ | — |
| Next Move card with full action catalog | ✓ | — |
| Complexity dial (Essential / Standard / Expert) | ✓ | — |
| Permission explainability | ✓ | — |
| HBI assistive behaviors (advisory, inline) | ✓ (if package ready; hooks if not) | Full HBI model |
| Saved views (personal, team, system) | ✓ | — |
| Related items (turnover/commissioning/sub linkage) | ✓ | — |
| Owner-facing portal surface | — | Layer 2 |
| Subcontractor-facing portal surface | — | Layer 2 |
| Owner-facing case status view | — | Layer 2 |
| PM + owner shared communications thread | — | Layer 2 |
| Mobile-native offline entry | — | Post-Phase 3 |

---

*← [T06](P3-E14-T06-Subcontractor-Participation-Acknowledgment-and-Resolution-Declarations.md) | [Master Index](P3-E14-Project-Warranty-Module-Field-Specification.md) | [T08 →](P3-E14-T08-Lane-Ownership-PWA-SPFx-Acceptance-and-External-Collaboration-Deferrals.md)*
