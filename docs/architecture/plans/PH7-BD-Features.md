# PH7 — Business Development Module: Master Feature Plan

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md · `hb-intel-foundation-plan.md`
**Date:** 2026-03-07
**Derived from:** Structured product-owner interview (2026-03-07); all decisions locked Q51–Q65.
**Audience:** Implementation agent(s), technical reviewers, product owner, and future maintainers.
**Purpose:** Master plan for the Business Development module. Defines every feature, consolidates all locked architectural decisions from the structured interview, and serves as the authoritative index for all 9 individual task files.

---

## Module Scope (Locked)

> **The HB Intel Business Development module is scoped exclusively to the Go/No-Go Scorecard workflow** — from lead identification by the BD Manager through the Director of Preconstruction review, committee meeting, decision, and formal handoff to the Estimating Coordinator.
>
> Lead pipeline tracking, client/owner relationship management, and contact records remain in the external CRM (currently Unanet; transitioning). HB Intel does not replicate CRM functionality.

---

## All Locked Interview Decisions (Q51–Q65)

### Workflow Stages (Q52, Q57, Q58 — updated with Q52 clarification)

| Stage | Actor | Action |
|---|---|---|
| 1 | BD Manager | Identifies lead; completes Go/No-Go Scorecard via guided 5-step form (BD Originator score column) |
| 2 | BD Manager | Coordinates departmental sections (Pursuits/Marketing, Estimating, IDS); submits scorecard + documents to Director of Preconstruction |
| 3 | Director of Preconstruction | Reviews; (a) requests clarification with free-text + inline field annotations, (b) rejects with required reason, or (c) accepts with required committee meeting deadline |
| 4 | Director of Preconstruction or BD Manager | Notifies Estimating Coordinator to schedule the Go/No-Go Committee Meeting; may request specific additional invitees |
| 4a | Estimating Coordinator | Schedules the meeting; pre-populates fixed core committee + any requested additional invitees |
| 5 | Estimating Coordinator (facilitator) + Committee + BD Manager | Facilitator-led live scoring: Estimating Coordinator enters Committee consensus scores criterion-by-criterion on screen; running total updates live |
| 6a | — | **NO GO** → scorecard closed; BD Manager notified; may be reopened for reconsideration |
| 6b | VP of Operations | **GO** → assigns Project Executive (always) + PM (rarely) outside HB Intel; Estimating Coordinator + Chief Estimator notified with auto-assembled handoff package |
| 6c | — | **WAIT** → scorecard parked with required follow-up date; BD Manager reminded on that date |

### Scorecard Structure (Q53 — from uploaded `HB GO_NOGO Template Ver 2.2 2025.12.05.xlsx`)

**Project Details Header Fields:**
Date of Evaluation · Originator/Opportunity Owner · Dept of Lead Origination · Project Name · Client Name · A/E Info · City Location · Region *(West Palm / Winter Park / Miami / Stuart)* · Sector *(14 options)* · Sub Sector · Proposal/Bid Due · Award Date · Project Value · Delivery Method *(GMP / Hard-Bid / Other / Precon w/ GMP Amend)* · Anticipated Fee % · Anticipated Gross Margin · Preconstruction Duration · Square Feet · Project Start Date · Project Duration · Brief Description

**Resource/Capacity Fields:**
Estimating Capacity + Deliverable + Cost · Mktg/Pursuit Team Capacity + Deliverable + Cost · IDS Capacity + Deliverable + Cost · Will We Get Paid For Precon? · Schedule Required? · Logistics Required? · Financials Required?

**20 Scoring Criteria (Dual Score: BD Originator + GNG Committee):**

| # | Criterion | High | Avg | Low | Max |
|---|---|---|---|---|---|
| 1 | Client Importance | 6 | 4 | 2 | 6 |
| 2 | Competition (short list) | 4 | 2 | 0 | 4 |
| 3 | Estimated Win Odds | 6 | 4 | 1 | 6 |
| 4 | Estimated Project $ | 4 | 2 | 1 | 4 |
| 5 | Location/Environment | 5 | 3 | 1 | 5 |
| 6 | Commercially Viable | 6 | 4 | 2 | 6 |
| 7 | Preferred by Decision Maker | 6 | 3 | 0 | 6 |
| 8 | A&E Experience | 5 | 4 | 1 | 5 |
| 9 | Staff Availability (Super/PM) | 4 | 2 | 1 | 4 |
| 10 | Staff Experience — Project Type | 5 | 3 | 0 | 5 |
| 11 | Staff Experience — Geography | 5 | 3 | 0 | 5 |
| 12 | Schedule (float potential) | 4 | 3 | 1 | 4 |
| 13 | Contract Terms/Conditions | 5 | 4 | 1 | 5 |
| 14 | Type of Contract | 5 | 4 | 1 | 5 |
| 15 | Client Financing | 5 | 3 | 1 | 5 |
| 16 | Supports Sector Diversification (COE) | 7 | 5 | 2 | 7 |
| 17 | Investment Front End (Time/Cost) | 6 | 3 | 1 | 6 |
| 18 | Profit Potential | 6 | 4 | 2 | 6 |
| 19 | Fee Enhancement — Subguard/Billable/Savings | 6 | 4 | 2 | 6 |
| 20 | Fee Enhancement — Direct Purchase | 6 | 4 | 1 | 6 |
| | **Totals** | **106** | **68** | **21** | **106** |

**Score Guide:** Above 80 = Focus All Efforts (≥75%) · 75–80 = Pursue · Below 75 = Drop

**Comments/Resources Sections:** Originator Comments · Committee Comments · Pursuits/Marketing Comments + Resources + Hours · Estimating Comments + Resources + Hours · IDS Comments + Resources + Hours

**Strategic Narrative Fields:**
- Decision-Making Process
- HB Differentiators
- Win Strategy
- Is this a Strategic Pursuit or will a No Bid be Detrimental? *(dropdown: Strategic Pursuit / Detrimental / Not Detrimental — this is NOT the Go/No-Go decision; it is the answer to a specific strategic question)*
- Decision Maker Advocate + Why

**Approval Fields:** Executive Override *(configurable role — Admin-assigned)* · Go/No-Go Decision *(GO / NO GO / WAIT)* · Decision Date · Date Approved Pursuit Budget · Date Approved Precon Budget

### Scoring Mechanics (Q54, Q55)
- **BD Manager scoring:** Guided 5-step form — Step 1: Project Details, Step 2: Resource/Capacity fields, Step 3: Score all 20 criteria (rating descriptions visible), Step 4: Narrative fields + Departmental sections, Step 5: Review & Submit. Auto-saves between steps.
- **Committee scoring:** Facilitator-led live scoring during the meeting. Estimating Coordinator selects High/Average/Low per criterion as committee reaches verbal consensus. Running total and Difference (Committee − Originator) update live on screen.

### Versioning (Q59)
Any update to the scorecard — by any party at any stage — creates a new **version**. Each version requires change comments applied per-criterion/category that changed. All versions preserved as immutable history.

### Decisions & Reconsideration (Q59)
- **WAIT:** Scorecard parks with required follow-up date; BD Manager reminded when date arrives.
- **NO GO Reconsideration:** BD Manager or Director of Preconstruction can re-open; creates new version with required change comments.
- **Strategic Pursuit / Detrimental / Not Detrimental:** Answer to strategic question field only — not a standalone decision state.

### Departmental Sections (Q56)
Pursuits/Marketing, Estimating, and IDS sections are completed **before BD Manager submission**. BD Manager coordinates; tagged department leads receive HB Intel notifications. Scorecard cannot be submitted until all sections are complete.

### Director of Preconstruction Review Actions (Q57)
- **Request Clarification:** Free-text overall comment + inline annotations on specific fields. BD Manager notified with field-level highlights.
- **Rejection:** Required reason field mandatory before rejection is recorded.
- **Acceptance:** Director sets committee meeting scheduling deadline. Estimating Coordinator notified with deadline.

### Committee Composition (Q58)
Fixed core committee (Admin-configured) + per-lead additions. Director of Preconstruction, BD Manager, or VP of Operations may request Estimating Coordinator include specific additional invitees when scheduling.

### Documents (Q61, Q65)
- BD Manager can attach documents at any workflow stage.
- Director of Preconstruction can attach documents during review stage.
- On provisioning completion: BD-attached documents automatically copy to the project's SharePoint document library (available in Project Hub from day one).

### Handoff to Estimating (Q61)
On GO decision: HB Intel auto-assembles a formal handoff package (structured scorecard summary + document links) delivered inside HB Intel to the Estimating Coordinator and Chief Estimator. PE/PM assignment happens outside HB Intel; Estimating Coordinator enters PE/PM manually when creating the Project Setup Request.

### Access Permissions (Q63)

| Role | Access |
|---|---|
| BD Manager (own scorecards) | Full read/write during draft → read-only on BD fields after submission |
| BD Manager (others' scorecards) | No access |
| Director of Preconstruction | All submitted scorecards — full read + review/accept/reject actions |
| VP of Operations | All scorecards at any stage — read-only |
| Estimating Coordinator | Scorecards at two points: (1) meeting scheduling notification, (2) GO decision handoff. Read-only on BD fields; read/write on Committee fields |
| Committee Members (invited) | Scorecard for their specific meeting only — read-only until committee scoring session; read/write on Committee score fields during session |
| Admin | Scorecard existence/metadata only (no content access) |
| All other roles | No access before GO decision. **After GO: full scorecard surfaced read-only in Project Hub Preconstruction section for the project's full lifecycle** |

### Analytics (Q64)
Full scorecard analytics (Option C), **scoped per BD Manager to their own leads**. Director of Preconstruction and VP of Operations see company-wide analytics. Metrics: GO/NO GO/WAIT counts by period/sector/region, win rate, average scores, committee vs. originator divergence, score distribution by criterion, average stage duration.

### Notifications (Q65)

| Event | Notified |
|---|---|
| BD Manager submits scorecard | Director of Preconstruction |
| Director requests clarification | BD Manager |
| Director rejects scorecard | BD Manager |
| Director accepts → meeting needed | Estimating Coordinator (with deadline) |
| Meeting scheduled | Core committee + additional invitees + BD Manager |
| GO decision recorded | **Estimating Coordinator + Chief Estimator** (with handoff package) |
| NO GO decision recorded | BD Manager |
| WAIT decision recorded | BD Manager (follow-up date reminder set) |
| Follow-up date arrives (WAIT) | BD Manager |
| Dept section tagged but incomplete | Tagged Pursuits/Marketing / Estimating / IDS leads |

---

## BD Module — File Map

| Task File | Title | Key Deliverables |
|---|---|---|
| `PH7-BD-1` | Foundation & Data Models | All TypeScript enums, interfaces, and types for the BD scorecard and workflow |
| `PH7-BD-2` | Routes & Shell Navigation | TanStack Router route tree, BD app shell, role-differentiated home page views |
| `PH7-BD-3` | Scorecard Form — BD Manager | Guided 5-step scorecard creation form with auto-save, departmental section tagging |
| `PH7-BD-4` | Review Workflow | Director of Preconstruction review: clarification annotations, rejection, acceptance + deadline |
| `PH7-BD-5` | Committee Meeting & Live Scoring | Meeting scheduling, attendee management, facilitator live scoring session, running total display |
| `PH7-BD-6` | Decisions, Versioning & Handoff | GO/NO GO/WAIT decisions, version history, handoff package auto-assembly, Project Hub integration |
| `PH7-BD-7` | Analytics Dashboard | BD Manager self-service analytics; Director/VP company-wide analytics view |
| `PH7-BD-8` | Backend API & SharePoint Schemas | All Azure Functions HTTP triggers and SharePoint list schemas for the BD module |
| `PH7-BD-9` | Testing, CI/CD & Documentation | Vitest unit tests, Playwright E2E, GitHub Actions, ADRs, Diátaxis docs |

---

## Recommended Implementation Sequence

```
PH7-BD-1 → PH7-BD-2 → PH7-BD-3 → PH7-BD-4 → PH7-BD-5 →
PH7-BD-6 → PH7-BD-7 → PH7-BD-8 → PH7-BD-9
```

**Rationale:** Data models first; then shell/routing; then the BD Manager form (the primary data entry surface); then the review workflow (Director actions); then the committee meeting and live scoring (the most complex UX); then decisions/versioning/handoff (completes the workflow); then analytics (consumes finalized data); then backend/schemas (finalized after all shapes confirmed); then testing and documentation.

---

## BD Module — Definition of Done

The BD module is complete when:

- All 9 task files executed sequentially with passing builds at each step.
- BD Manager can complete the guided 5-step scorecard form, tag departmental sections, and submit.
- Tagged department leads receive notifications and can complete their sections; submission is blocked until all sections complete.
- Director of Preconstruction can request clarification (with free-text + inline field annotations), reject (with required reason), or accept (with committee meeting deadline).
- Estimating Coordinator receives meeting scheduling notification with deadline and core committee pre-populated; can add additional invitees per request.
- Committee live scoring session renders all 20 criteria with High/Average/Low selectors; running total and Difference row update in real time.
- GO/NO GO/WAIT decisions record correctly with all required fields.
- WAIT scorecards park with follow-up date and fire reminder notifications.
- NO GO scorecards can be re-opened (new version) by BD Manager or Director of Preconstruction with required change comments.
- All scorecard updates create versioned records with per-criterion change comments.
- GO decision auto-assembles handoff package and notifies Estimating Coordinator + Chief Estimator.
- BD-attached documents copy to project SharePoint library on provisioning.
- Full scored scorecard surfaces as read-only record in Project Hub Preconstruction section after GO.
- BD Manager analytics show own-leads-only metrics (score distributions, win rates, stage durations, committee vs. originator divergence).
- Director of Preconstruction and VP of Operations see company-wide analytics.
- All access permissions enforced per the Q63 permission matrix.
- All Azure Functions endpoints secured with Bearer token validation.
- All SharePoint list schemas deployed via setup script.
- Vitest unit test coverage ≥95% for all workflow logic.
- Playwright E2E tests cover all primary user flows.
- All required ADRs created. All Diátaxis documentation files exist.

---

## BD Module — Master Success Criteria Checklist

### Foundation
- [ ] BD-1.1 All BD TypeScript enums, interfaces, and type definitions created in `packages/models/src/bd/`
- [ ] BD-1.2 All models exported from `packages/models/src/index.ts`

### Routes & Shell
- [ ] BD-2.1 TanStack Router BD route tree registered
- [ ] BD-2.2 BD home page renders "My Scorecards" table for BD Manager role
- [ ] BD-2.3 Director of Preconstruction lands on review queue view
- [ ] BD-2.4 VP of Operations lands on full pipeline read-only view

### Scorecard Form
- [ ] BD-3.1 5-step form renders all steps with correct fields per step
- [ ] BD-3.2 Auto-save fires between steps; progress bar shows completion
- [ ] BD-3.3 Step 3 renders all 20 criteria with High/Average/Low selectors and value descriptions visible
- [ ] BD-3.4 Departmental section tagging notifies tagged leads via HB Intel notification
- [ ] BD-3.5 Submission blocked until all departmental sections complete
- [ ] BD-3.6 Document attachment accepts files at any stage; Director can attach during review

### Review Workflow
- [ ] BD-4.1 Director can request clarification with free-text comment + inline field annotations
- [ ] BD-4.2 BD Manager sees field-level highlights on clarification notification
- [ ] BD-4.3 Rejection requires mandatory reason field; record is immutable after rejection
- [ ] BD-4.4 Acceptance requires committee meeting deadline; Estimating Coordinator notified with deadline

### Committee Meeting & Live Scoring
- [ ] BD-5.1 Meeting scheduling page pre-populates fixed core committee
- [ ] BD-5.2 Additional invitees can be added per Director/BD Manager/VP request
- [ ] BD-5.3 Live scoring session renders all 20 criteria side-by-side (Originator | Committee)
- [ ] BD-5.4 Running total and Difference row update in real time as criteria are scored
- [ ] BD-5.5 Committee members invited to meeting gain read access to scorecard

### Decisions, Versioning & Handoff
- [ ] BD-6.1 GO/NO GO/WAIT decisions record with all required approval fields
- [ ] BD-6.2 Every scorecard update creates a new version with required change comments
- [ ] BD-6.3 Version history is fully preserved and viewable
- [ ] BD-6.4 WAIT scorecards park with follow-up date; reminder notification fires on that date
- [ ] BD-6.5 NO GO scorecards re-openable by BD Manager or Director; creates new version
- [ ] BD-6.6 GO decision auto-assembles handoff package; Estimating Coordinator + Chief Estimator notified
- [ ] BD-6.7 BD-attached documents copy to project SharePoint library on provisioning
- [ ] BD-6.8 Full scorecard surfaces read-only in Project Hub Preconstruction section after GO

### Analytics
- [ ] BD-7.1 BD Manager analytics show own-leads-only metrics (all Option C metrics)
- [ ] BD-7.2 Director of Preconstruction and VP of Operations see company-wide analytics
- [ ] BD-7.3 Score distribution by criterion chart renders correctly
- [ ] BD-7.4 Committee vs. originator divergence trend renders correctly

### Backend & Infrastructure
- [ ] BD-8.1 All BD Azure Function HTTP endpoints return correct data shapes
- [ ] BD-8.2 All endpoints secured with Bearer token validation
- [ ] BD-8.3 All SharePoint list schemas deployed via setup script

### Testing & Documentation
- [ ] BD-9.1 Vitest unit test coverage ≥95% for all workflow and scoring logic
- [ ] BD-9.2 Playwright E2E tests cover all primary user flows
- [ ] BD-9.3 Required ADRs created in `docs/architecture/adr/`
- [ ] BD-9.4 Developer how-to guide created in `docs/how-to/developer/`
- [ ] BD-9.5 User guide created in `docs/user-guide/bd/`
- [ ] BD-9.6 Reference documentation created in `docs/reference/bd/`

<!-- IMPLEMENTATION PROGRESS & NOTES
Plan created: 2026-03-07
Status: Ready for implementation
Next: Execute PH7-BD-1 — Foundation & Data Models
-->
