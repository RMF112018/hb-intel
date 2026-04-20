# PH7-BW-11 — Domain Feature Plans Roadmap: Remaining Domains

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md (all domain sections)
**Date:** 2026-03-07
**Type:** REFERENCE — This is a roadmap document, not an implementation task
**Priority:** REFERENCE — No code produced; guides future plan creation
**Depends on:** Nothing (reference document)
**Blocks:** Nothing directly; feature work on the 5 undocumented domains is blocked until their plans are written

---

## Purpose

As of 2026-03-07, detailed feature plans (summary + task sub-files) exist for:
- ✅ Business Development (`PH7-BD-Features.md` + `PH7-BD-1` through `PH7-BD-9`)
- ✅ Project Hub (`PH7-ProjectHub-Features-Plan.md` + `PH7-ProjectHub-1` through `PH7-ProjectHub-16`)
- ⚠️ Estimating (`PH7-Estimating-Feature-Plan.md` — monolithic, needs splitting)
- ⚠️ Admin (`PH7-Admin-Feature-Plan.md` — monolithic, needs splitting)
- ❌ Accounting — no detailed feature plan
- ❌ Leadership — no detailed feature plan
- ❌ Safety — no detailed feature plan
- ❌ Quality Control / Warranty — no detailed feature plan
- ❌ Risk Management — no detailed feature plan
- ❌ Operational Excellence — no detailed feature plan
- ❌ Human Resources — no detailed feature plan
- ❌ Site Controls — no detailed feature plan

This document provides:
1. Scoping notes for the 5 missing domain plans (what each plan must cover)
2. Notes on splitting the 2 existing monolithic plans
3. The MVP priority sequence for which plans to write first

---

## MVP Sequence for Plan Creation

Per CLAUDE.md §2 and Blueprint §2i, create feature plans in this order:

| Priority | Domain | Reason |
|---|---|---|
| 1st | **Accounting** | MVP critical — provisioning trigger lives here |
| 2nd | (Estimating — split existing monolithic plan) | Provisioning status display; bid tracking |
| 3rd | (Admin — split existing monolithic plan) | Provisioning failure dashboard |
| 4th | **Leadership** | Second wave MVP |
| 5th | **Safety** | High operational value |
| 6th | **Quality Control / Warranty** | Closely tied to project completion workflows |
| 7th | **Risk Management** | Linked to estimating and project hub |
| 8th | **Operational Excellence** | Organization-level (lower urgency) |
| 9th | **Human Resources** | Organization-level (lower urgency) |

---

## 1. Accounting Feature Plan — Scope Notes

**Existing stub pages:** `OverviewPage.tsx`, `InvoicesPage.tsx`, `BudgetsPage.tsx`

**What the Accounting domain owns (from Blueprint §2i):**
- **Primary: Provisioning Trigger** — The "Save + Provision Site" form. This is the MOST CRITICAL feature in the entire application. The Accounting Manager fills out project setup data and triggers SharePoint site provisioning. This is the single API call to the Azure Functions ProvisioningSaga.
- **Project Financials Overview** — Budget vs. actual cost summary per project (read from SharePoint lists)
- **Invoice Log** — Record and track invoices against project budget lines
- **Budget Lines** — Cost code-level budget entries with variance tracking

**Key technical dependencies:**
- `@hbc/provisioning` package (PH6.9 deliverable) — must be available before implementing provisioning trigger
- `IProjectSetupRequest` model from `@hbc/models`
- `useProvisioningMutation()` hook from `@hbc/query-hooks`

**Suggested plan file structure:**
```
PH7-Accounting-Features.md          ← master summary
PH7-Accounting-1-Foundation.md      ← models, routes, shell config
PH7-Accounting-2-ProvisioningForm.md ← THE critical form (Save + Provision Site)
PH7-Accounting-3-FinancialOverview.md ← budget/cost summary page
PH7-Accounting-4-InvoiceLog.md      ← invoice tracking
PH7-Accounting-5-BudgetLines.md     ← cost code budget management
PH7-Accounting-6-Backend-API.md     ← SP list schemas, query hooks
PH7-Accounting-7-Testing.md         ← test specs
```

---

## 2. Estimating — Split Existing Monolithic Plan

**Existing:** `PH7-Estimating-Feature-Plan.md` (monolithic)

**Action:** Read the existing plan, then create:
```
PH7-Estimating-Features.md          ← slim master summary (rewrite existing as index)
PH7-Estimating-1-Foundation.md
PH7-Estimating-2-ProjectSetupForm.md ← provisioning status display (SignalR checklist)
PH7-Estimating-3-BidTracking.md
PH7-Estimating-4-Templates.md
PH7-Estimating-5-RequestQueue.md
PH7-Estimating-6-Backend-API.md
PH7-Estimating-7-Testing.md
```

The `ProjectSetupPage.tsx` already exists as a stub and maps directly to `PH7-Estimating-2`. This page is where the real-time provisioning checklist is displayed (Blueprint §2i: "Estimating Project Setup page is the single source of truth for provisioning status").

---

## 3. Admin — Split Existing Monolithic Plan

**Existing:** `PH7-Admin-Feature-Plan.md` (monolithic)

**Action:** Read the existing plan, then create:
```
PH7-Admin-Features.md
PH7-Admin-1-Foundation.md
PH7-Admin-2-ProvisioningFailures.md ← existing ProvisioningFailuresPage.tsx stub
PH7-Admin-3-ErrorLog.md             ← existing ErrorLogPage.tsx stub
PH7-Admin-4-SystemSettings.md       ← existing SystemSettingsPage.tsx stub
PH7-Admin-5-UserManagement.md       ← SP group management UI
PH7-Admin-6-Testing.md
```

---

## 4. Leadership Feature Plan — Scope Notes

**Existing stub pages:** `KpiDashboardPage.tsx`, `PortfolioOverviewPage.tsx`

**What Leadership owns:**
- **Portfolio KPI Dashboard** — Aggregated metrics across all active projects (schedule adherence, cost performance, safety incidents, quality scores)
- **Portfolio Overview** — Table/grid of all active projects with status indicators
- **Financial Forecast** — Revenue/cost projections at portfolio level
- **Go/No-Go Pipeline View** — Read-only view of BD pipeline for leadership visibility (linked to BD module data)
- **Executive Reports** — Printable/exportable summaries for ownership presentations

**Key technical dependencies:**
- Reads from `@hbc/query-hooks` project, accounting, and safety hooks (cross-domain read access)
- No write operations — Leadership is a read-only aggregation domain
- High chart usage — `HbcChart` component (ECharts wrapper)

**Suggested plan file structure:**
```
PH7-Leadership-Features.md
PH7-Leadership-1-Foundation.md
PH7-Leadership-2-PortfolioOverview.md
PH7-Leadership-3-KPIDashboard.md
PH7-Leadership-4-FinancialForecast.md
PH7-Leadership-5-PipelineView.md
PH7-Leadership-6-Backend-API.md
PH7-Leadership-7-Testing.md
```

---

## 5. Safety Feature Plan — Scope Notes

**Existing stub pages:** *(check apps/safety/src/pages/ for current stubs)*

**What Safety owns (from legacy monolith — `SafetyManagement.tsx`):**
- **Incident Tracking** — Record, categorize, and track safety incidents (type, severity, corrective action, closure status)
- **Daily Safety Inspections** — Digital inspection forms per project site
- **Safety Meeting Log** — Record toolbox talks and safety training attendance
- **Leading Indicators Dashboard** — Near-miss count, inspection completion rate, training hours
- **OSHA Recordable Log** — 300/300A log generation

**Suggested plan file structure:**
```
PH7-Safety-Features.md
PH7-Safety-1-Foundation.md
PH7-Safety-2-IncidentTracking.md
PH7-Safety-3-Inspections.md
PH7-Safety-4-MeetingLog.md
PH7-Safety-5-Dashboard.md
PH7-Safety-6-Backend-API.md
PH7-Safety-7-Testing.md
```

---

## 6. Quality Control / Warranty Feature Plan — Scope Notes

**What QC/W owns:**
- **Punch List Management** — Create, assign, track, and close punch list items (by area, trade, priority)
- **Inspection Records** — Pre-pour, framing, MEP rough-in inspection logs
- **Warranty Claims** — Customer-reported warranty items with contractor assignment and resolution tracking
- **QC Metrics Dashboard** — Open items by trade, average close time, inspection pass rates

**Suggested plan file structure:**
```
PH7-QCW-Features.md
PH7-QCW-1-Foundation.md
PH7-QCW-2-PunchList.md
PH7-QCW-3-Inspections.md
PH7-QCW-4-WarrantyClaims.md
PH7-QCW-5-Dashboard.md
PH7-QCW-6-Backend-API.md
PH7-QCW-7-Testing.md
```

---

## 7. Risk Management Feature Plan — Scope Notes

**What Risk Management owns (from legacy `RiskCostManagement.tsx`):**
- **Risk Register** — Identify, assess (probability × impact), and track mitigation for project risks
- **Risk Cost Schedule** — Track actual risk costs against contingency reserve
- **Risk Matrix Visualization** — Heat map view of risk distribution (P × I)
- **Change Order Log** — Track owner change orders and their risk cost implications
- **Contingency Tracking** — Available contingency vs. committed risk costs

**Suggested plan file structure:**
```
PH7-Risk-Features.md
PH7-Risk-1-Foundation.md
PH7-Risk-2-RiskRegister.md
PH7-Risk-3-ContingencyTracking.md
PH7-Risk-4-ChangeOrderLog.md
PH7-Risk-5-Dashboard.md
PH7-Risk-6-Backend-API.md
PH7-Risk-7-Testing.md
```

---

## 8. Operational Excellence Feature Plan — Scope Notes

**What OE owns:**
- **Process Improvement Log** — Record and track process improvement initiatives with status and outcomes
- **Performance Metrics** — KPIs for operational efficiency (cycle times, rework rates, material waste)
- **Lessons Learned Library** — Searchable database of project lessons for future reference
- **Best Practices Repository** — Standardized workflows and method statements

**Scope note:** OE is the lowest-urgency domain. Initial implementation may be a simple CRUD module with a metrics dashboard. Full scope should be defined in a product owner interview before plan creation.

**Suggested plan file structure:**
```
PH7-OE-Features.md
PH7-OE-1-Foundation.md
PH7-OE-2-ProcessLog.md
PH7-OE-3-MetricsDashboard.md
PH7-OE-4-LessonsLearned.md
PH7-OE-5-Backend-API.md
PH7-OE-6-Testing.md
```

---

## 9. Human Resources Feature Plan — Scope Notes

**What HR owns:**
- **Org Chart** — Visual hierarchy of the construction firm's personnel by project and department
- **Onboarding Tracker** — Track new hire onboarding milestones and document completion
- **Personnel Directory** — Searchable list of employees with role, project assignment, and contact info
- **Certification Tracking** — Safety certifications (OSHA, First Aid, Equipment Operator) with expiry alerts

**Scope note:** HR data is sensitive — all HR features require the `HB Intel HR Managers` permission group. PII data handling must be reviewed before feature plan creation.

**Suggested plan file structure:**
```
PH7-HR-Features.md
PH7-HR-1-Foundation.md
PH7-HR-2-OrgChart.md
PH7-HR-3-OnboardingTracker.md
PH7-HR-4-Directory.md
PH7-HR-5-CertificationTracking.md
PH7-HR-6-Backend-API.md
PH7-HR-7-Testing.md
```

---

## Plan Creation Checklist

When writing each new domain feature plan, follow this checklist:

- [ ] Read the existing monolith code (legacy `src/webparts/hbcProjectControls/components/pages/`) to identify actual features in use
- [ ] Confirm models exist in `@hbc/models` for all domain entities (or note gaps for creation)
- [ ] Confirm query hooks exist in `@hbc/query-hooks` for all domain data access (or note gaps)
- [ ] Document all SharePoint list schemas used by the domain
- [ ] Define the minimum permission key required for each route
- [ ] Identify cross-domain read dependencies (which other domains' data does this domain display?)
- [ ] Write the master summary plan first; then individual task files
- [ ] Each task file must include: Summary, Why It Matters, Files to Create/Modify, Code, Verification, and Definition of Done sections
- [ ] Follow Diátaxis for any documentation created as part of the plan

---

## Notes on Domain Isolation

Each domain's pages **must not** directly import from another domain's app. Cross-domain data access goes through `@hbc/query-hooks` only. Example:

```typescript
// ✅ Correct — Leadership reads project data via shared hook
import { useProjectDashboard } from '@hbc/query-hooks';

// ❌ Wrong — Leadership must not import from project-hub app
import { ProjectDashboardSummary } from '../../project-hub/src/pages/DashboardPage.js';
```

This isolation ensures each webpart app builds independently for SharePoint deployment.
