# PH7.16 — Project Hub: Testing, CI/CD & Documentation

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · `PH7-ProjectHub-Features-Plan.md`
**Purpose:** Define the complete testing strategy (Vitest unit tests, Playwright E2E), GitHub Actions CI/CD integration, and all required documentation deliverables in the correct Diátaxis folder structure.
**Audience:** Implementation agent(s), technical reviewers.
**Implementation Objective:** A production-quality, fully tested Project Hub module with comprehensive documentation that satisfies all CLAUDE.md v1.2 documentation requirements. Phase 7 Project Hub is not considered complete until all tests pass and all documentation files exist in the correct `docs/` locations.

---

## Prerequisites

- PH7.1 through PH7.15 complete.
- Vitest configured in `apps/project-hub/` and `apps/functions/`.
- Playwright configured for E2E tests against the dev-harness.
- GitHub Actions workflow file for Phase 7 (`/.github/workflows/ph7-project-hub.yml`).

---

## 7.16.1 — Vitest Unit Tests

Target coverage: ≥95% for all data transformation, business logic, and state functions.

### Backend Unit Tests

Location: `backend/functions/src/functions/projectHub/__tests__/`

**Test file: `buyout-log.test.ts`**
```typescript
describe('Buyout Log calculations', () => {
  it('calculates overUnder as contractAmount - originalBudget', () => {
    const entry = { contractAmount: 500_000, originalBudget: 450_000 };
    expect(calculateOverUnder(entry)).toBe(50_000); // over budget
  });

  it('calculates percentBuyoutComplete correctly excluding zero-budget rows', () => {
    // rows with originalBudget > 0 = 10, rows with contractAmount set = 7
    expect(calculateBuyoutPercent(mockRows)).toBe(70);
  });

  it('seeds 14 CSI division rows on project initialization', () => {
    const rows = generateInitialBuyoutRows('proj-123');
    expect(rows).toHaveLength(14);
    expect(rows[0].csiDivision).toBe('02');
    expect(rows[13].csiDivision).toBe('16');
  });
});
```

**Test file: `procore-budget-parser.test.ts`**
```typescript
describe('Procore budget CSV/Excel parser', () => {
  it('parses a valid CSV export into IProcoreBudgetLineItem[]', () => {
    const result = parseProcoreBudgetCsv(mockCsvContent);
    expect(result.items).toHaveLength(expectedCount);
    expect(result.errors).toHaveLength(0);
  });

  it('handles missing cost code column → returns parse error', () => {
    const result = parseProcoreBudgetCsv(csvWithoutCostCode);
    expect(result.errors).toContain('Cost Code column not found');
  });

  it('handles non-numeric budget amount → returns row-level error', () => {
    const result = parseProcoreBudgetCsv(csvWithBadAmount);
    expect(result.errors[0]).toMatch(/row 3.*not a valid number/i);
  });

  it('sums cost codes into CSI division totals for buyout log seeding', () => {
    const items = parsedBudgetItems; // mix of div 03 and 09 codes
    const divTotals = groupBudgetByCsiDivision(items);
    expect(divTotals['03']).toBe(expectedDiv03Total);
    expect(divTotals['09']).toBe(expectedDiv09Total);
  });
});
```

**Test file: `schedule-parser.test.ts`**
```typescript
describe('Schedule file parser', () => {
  it('parses XER milestones from a valid P6 export', () => {
    const result = parseXerFile(mockXerContent);
    expect(result.milestones.length).toBeGreaterThan(0);
    expect(result.milestones[0]).toHaveProperty('milestoneName');
  });

  it('parses XML milestones from a valid MS Project export', () => {
    const result = parseXmlSchedule(mockMsProjectXml);
    expect(result.milestones.every(m => m.isCriticalPath !== undefined)).toBe(true);
  });

  it('parses CSV with flexible column detection', () => {
    const result = parseCsvSchedule(csvWithVariantHeaders);
    expect(result.parseErrors).toHaveLength(0);
  });

  it('correctly derives MilestoneStatus from variance days', () => {
    expect(deriveMilestoneStatus({ forecastDate: today, baselineDate: today })).toBe('OnTrack');
    expect(deriveMilestoneStatus({ forecastDate: addDays(today, 15), baselineDate: today })).toBe('AtRisk');
    expect(deriveMilestoneStatus({ forecastDate: addDays(today, 45), baselineDate: today })).toBe('Delayed');
    expect(deriveMilestoneStatus({ actualDate: yesterday })).toBe('Complete');
  });
});
```

**Test file: `constraints-log.test.ts`**
```typescript
describe('Constraints Log', () => {
  it('calculates daysElapsed for Open constraints from dateIdentified to today', () => {
    const constraint = { dateIdentified: sevenDaysAgo, status: 'Open' };
    expect(calculateDaysElapsed(constraint)).toBe(7);
  });

  it('freezes daysElapsed for Closed constraints at completionDate - dateIdentified', () => {
    const constraint = { dateIdentified: tenDaysAgo, completionDate: threeDaysAgo, status: 'Closed' };
    expect(calculateDaysElapsed(constraint)).toBe(7);
  });

  it('correctly classifies due date color: green (8+ days), orange (7 days), red (past)', () => {
    expect(getDueDateColor(addDays(today, 10))).toBe('green');
    expect(getDueDateColor(addDays(today, 7))).toBe('orange');
    expect(getDueDateColor(yesterday)).toBe('red');
  });
});
```

**Test file: `incident-report.test.ts`**
```typescript
describe('Incident Report', () => {
  it('builds correct notification recipients from project SSSP and form data', () => {
    const notifications = buildIncidentNotifications(mockSssp, mockReport);
    expect(notifications).toHaveLength(2);
    expect(notifications[0].recipientRole).toBe('SafetyManager');
    expect(notifications[1].recipientRole).toBe('SubcontractorSupervisor');
  });

  it('24-hour check: returns true when incident is older than 24 hours', () => {
    const incidentDate = subHours(new Date(), 25);
    expect(isLateSubmission(incidentDate)).toBe(true);
  });
});
```

**Test file: `warranty-alerts.test.ts`**
```typescript
describe('Warranty expiration alerts', () => {
  it('fires alert when days until expiration === alertDaysBefore', () => {
    const doc = { warrantyExpirationDate: addDays(today, 90), alertDaysBefore: 90, alertSentAt: null };
    expect(shouldFireAlert(doc, today)).toBe(true);
  });

  it('does not fire alert when alertSentAt is already set', () => {
    const doc = { ...alertDueDoc, alertSentAt: yesterday };
    expect(shouldFireAlert(doc, today)).toBe(false);
  });

  it('does not fire alert when days remaining !== alertDaysBefore', () => {
    const doc = { warrantyExpirationDate: addDays(today, 91), alertDaysBefore: 90, alertSentAt: null };
    expect(shouldFireAlert(doc, today)).toBe(false);
  });
});
```

**Test file: `financial-summary.test.ts`**
```typescript
describe('Financial Summary calculations', () => {
  it('calculates currentContractAmount = originalContractAmount + approvedChangeOrders', () => { /* ... */ });
  it('calculates projectedProfit = currentBudget - projectedCostAtCompletion', () => { /* ... */ });
  it('calculates projectedProfitPercent = projectedProfit / currentContractAmount * 100', () => { /* ... */ });
  it('calculates scheduleVarianceDays = projectedCompletion - scheduledCompletion in days', () => { /* ... */ });
});
```

**Test file: `turnover-sign-off.test.ts`**
```typescript
describe('Turnover to Ops sign-off', () => {
  it('isValidSigningParty: returns true only if currentUserUpn matches the party UPN', () => { /* ... */ });
  it('isTurnoverComplete: returns true only when all 4 parties have Acknowledged status', () => { /* ... */ });
  it('isTurnoverComplete: returns false when any party is Pending or Declined', () => { /* ... */ });
});
```

---

## 7.16.2 — Playwright E2E Tests

Location: `e2e/project-hub/`

**Test file: `project-hub-home.spec.ts`**
```typescript
test('PM can view project hub home page with module status cards', async ({ page }) => {
  await page.goto('/project-hub');
  await page.click('[data-testid="project-card-first"]');
  await expect(page.locator('[data-testid="module-status-grid"]')).toBeVisible();
  await expect(page.locator('[data-testid="module-card"]')).toHaveCount(10);
});
```

**Test file: `startup-checklist.spec.ts`**
```typescript
test('PM can mark startup checklist items complete', async ({ page }) => {
  await page.goto('/project-hub/:projectId/project-management/startup-checklist');
  const firstStatus = page.locator('[data-testid="checklist-status-0"]');
  await firstStatus.selectOption('Complete');
  await expect(page.locator('[data-testid="progress-header"]')).toContainText('1 / 37');
});
```

**Test file: `buyout-log.spec.ts`**
```typescript
test('Inline edit: PM can enter contract amount and over/under calculates', async ({ page }) => {
  await page.goto('/project-hub/:projectId/buyout-log');
  await page.click('[data-testid="contract-amount-row-0"]');
  await page.fill('[data-testid="contract-amount-input"]', '500000');
  await page.keyboard.press('Tab');
  // originalBudget for div 02 from Procore upload = 450000
  await expect(page.locator('[data-testid="over-under-row-0"]')).toContainText('50,000');
});
```

**Test file: `incident-report.spec.ts`**
```typescript
test('PM can submit incident report and notifications are recorded', async ({ page }) => {
  await page.goto('/project-hub/:projectId/safety/incident-reporting');
  await page.click('[data-testid="new-incident-report-btn"]');
  await page.fill('[data-testid="description"]', 'Near miss on Level 3');
  await page.selectOption('[data-testid="incident-type"]', 'Near Miss');
  // ... fill required fields
  await page.click('[data-testid="submit-incident-btn"]');
  await expect(page.locator('[data-testid="incident-log-table"]')).toContainText('Near Miss');
});
```

**Test file: `turnover-sign-off.spec.ts`**
```typescript
test('4-party turnover sign-off completes when all parties acknowledge', async ({ page, context }) => {
  // Login as each of the 4 parties in sequence and sign
  // Verify "Turnover Complete" banner appears after 4th signature
});
```

---

## 7.16.3 — GitHub Actions CI/CD

Create/update `/.github/workflows/ph7-project-hub.yml`:

```yaml
name: PH7 Project Hub — CI

on:
  push:
    paths:
      - 'apps/project-hub/**'
      - 'backend/functions/src/functions/projectHub/**'
      - 'packages/models/src/project-hub/**'
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run test --filter=@hbc/models --filter=project-hub --filter=functions
      - run: pnpm turbo run build

  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps chromium
      - run: pnpm turbo run e2e --filter=project-hub
```

---

## 7.16.4 — Required ADRs

Create the following Architecture Decision Records in `docs/architecture/adr/`:

**`docs/architecture/adr/0010-project-hub-single-project-scope.md`**
- Decision: All Project Hub features are scoped to a single `projectId` at a time; no cross-project aggregates in this module.
- Status: Accepted
- Context: Governing architectural rule from product owner interview 2026-03-07.
- Consequences: Multi-project reports and analytics must live in other modules (Estimating for pursuits, future Leadership module for executive summaries).

**`docs/architecture/adr/0011-procore-budget-upload-seeds-both-financial-and-buyout.md`**
- Decision: A single Procore budget CSV/Excel upload at project start seeds both the Financial Forecasting baseline and the Buyout Log original budget.
- Status: Accepted
- Context: User input 2026-03-07 — "the original budget will need to be populated with an upload of the initial Procore budget."

**`docs/architecture/adr/0012-qc-phase1-upload-phase2-collaborative.md`**
- Decision: Phase 1 QC delivers file upload + CSI-suggested checklists. Phase 2 full Dashpivot-replacement collaborative workflow is documented but deferred.
- Status: Accepted
- Context: QC App Initiative and Dashpivot Analytics evaluation 2026-03-07.

**`docs/architecture/adr/0013-schedule-file-parsing-formats.md`**
- Decision: Schedule module supports XER (Primavera P6), XML (P6/MS Project), and CSV. File is parsed on upload and milestones stored in SharePoint; raw file stored in document library.
- Status: Accepted

**`docs/architecture/adr/0014-constraints-due-date-color-coding.md`**
- Decision: Constraints Log due date color coding: ≥8 days = green, exactly 7 days = orange, past due = red. Matches exact uploaded HB_ConstraintsLog_Template.xlsx logic.
- Status: Accepted

---

## 7.16.5 — Documentation Deliverables

All files must exist and contain accurate, complete content before PH7 Project Hub is considered Done.

### Developer How-To Guides (`docs/how-to/developer/`)

**`docs/how-to/developer/project-hub-module-guide.md`**
- How to add a new page to the Project Hub route tree
- How the `projectId` context flows from URL → layout → page component → API call
- How to add a new SharePoint list schema
- How to add a new API endpoint following the auth middleware pattern

**`docs/how-to/developer/procore-budget-parser.md`**
- How the CSV/Excel parser works
- How to add support for a new Procore export format

**`docs/how-to/developer/schedule-file-parsing.md`**
- How XER, XML, and CSV parsing works
- How to extend the parser for new schedule file formats

### User Guide (`docs/user-guide/`)

**`docs/user-guide/project-hub/getting-started.md`**
- How to navigate to the Project Hub
- How to find your project
- Overview of all module sections

**`docs/user-guide/project-hub/financial-forecasting.md`**
- How to upload your Procore budget
- How to complete the monthly financial forecast
- How to read the GC/GR Forecast and Cash Flow Schedule

**`docs/user-guide/project-hub/incident-reporting.md`**
- How to submit an incident report
- 24-hour submission rule explanation
- Who gets notified and when

### Reference Documentation (`docs/reference/`)

**`docs/reference/project-hub/api-endpoints.md`**
- Complete list of all Project Hub API endpoints with request/response examples

**`docs/reference/project-hub/sharepoint-lists.md`**
- All SharePoint list schemas with column definitions

**`docs/reference/project-hub/csi-divisions.md`**
- Standard CSI divisions 02–16 with descriptions (used by Buyout Log and QC Checklists)

### Maintenance Runbook (`docs/maintenance/`)

**`docs/maintenance/project-hub-runbook.md`**
- How to re-seed checklist items for a project (startup/closeout)
- How to re-run Procore budget import if the initial import was incorrect
- How to handle failed PDF generation (PX Review / Owner Report)
- How to manually trigger warranty expiration alert timer

---

## Phase 7 Project Hub — Final Verification Checklist

Before declaring Phase 7 Project Hub complete, confirm all of the following:

```bash
# 1. Build passes
pnpm turbo run build
# Expected: 0 errors, 0 warnings

# 2. Unit tests pass with ≥95% coverage
pnpm turbo run test --filter=project-hub --filter=functions -- --coverage
# Expected: Coverage ≥95% for project-hub data/logic functions

# 3. E2E tests pass
pnpm turbo run e2e --filter=project-hub
# Expected: All Playwright tests pass

# 4. Documentation files exist
ls docs/architecture/adr/0010-project-hub-single-project-scope.md
ls docs/architecture/adr/0011-procore-budget-upload-seeds-both-financial-and-buyout.md
ls docs/architecture/adr/0012-qc-phase1-upload-phase2-collaborative.md
ls docs/architecture/adr/0013-schedule-file-parsing-formats.md
ls docs/architecture/adr/0014-constraints-due-date-color-coding.md
ls docs/how-to/developer/project-hub-module-guide.md
ls docs/user-guide/project-hub/getting-started.md
ls docs/reference/project-hub/api-endpoints.md
ls docs/maintenance/project-hub-runbook.md
# Expected: all files exist
```

<!-- IMPLEMENTATION PROGRESS & NOTES
Task file created: 2026-03-07
Status: Ready for implementation
Phase 7 Project Hub plan complete — all 16 task files created.
Next phase: Continue Business Development module interview (Q51 onward).
-->
