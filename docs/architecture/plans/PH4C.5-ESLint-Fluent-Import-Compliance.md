# PH4C.5 — ESLint Fluent Import Compliance

**Version:** 1.0
**Date Created:** 2026-03-07
**Status:** Ready for Implementation
**Audience:** Frontend Engineers, All Teams (Accounting, Estimating, Project Hub, etc.), Team Leads
**Implementation Objective:** Execute comprehensive ESLint audit across all 14 apps/ directories for `no-direct-fluent-import` violations; triage and resolve using three-bucket system (Fix Now / Suppress with Justification / Escalate); achieve zero unexplained violations.

---

## Purpose

The HBC ESLint plugin defines the rule `no-direct-fluent-import` at error level to enforce that applications import UI components exclusively from `@hbc/ui-kit` (not directly from `@fluentui/react-components`). This ensures:
- Centralized component design consistency
- UI Kit serves as single source of truth
- Fluent UI version upgrades are managed in one place
- Design system theming applies uniformly

This task performs a live audit of all 14 application directories, categorizes every violation into one of three resolution buckets, and ensures zero unexplained violations remain.

---

## Prerequisites

**No hard prerequisites.** This task is independent and can proceed in parallel with PH4C.3 and PH4C.4.

---

## Implementation Steps

### 4C.5.1 — Verify ESLint Rule Configuration

Confirm that the `no-direct-fluent-import` rule is defined and active at error level in the ESLint plugin.

**File Reference:** `/sessions/tender-zen-rubin/mnt/hb-intel/packages/eslint-plugin-hbc/src/rules/no-direct-fluent-import.ts`

```bash
cat /sessions/tender-zen-rubin/mnt/hb-intel/packages/eslint-plugin-hbc/src/rules/no-direct-fluent-import.ts | head -50
```

**Action Items:**
- Verify the rule file exists
- Check the rule's meta object for `type`, `docs.description`, `docs.category`
- Confirm it exports a rule object with `create` function
- Verify the severity is set to 'error' in the rule's meta

**Expected Output:** Rule definition showing severity 'error' and the rule name `no-direct-fluent-import`.

---

### 4C.5.2 — Run Full Lint Audit and Capture Violations

Execute the turbo lint task across the entire monorepo, filtering for `no-direct-fluent-import` violations.

```bash
cd /sessions/tender-zen-rubin/mnt/hb-intel && \
pnpm turbo lint 2>&1 | tee /tmp/lint-full-output.txt | grep -E "no-direct-fluent-import" | head -50
```

Capture the full count of violations:

```bash
grep -c "no-direct-fluent-import" /tmp/lint-full-output.txt || echo "0"
```

Also capture with file/line context:

```bash
grep -B 2 "no-direct-fluent-import" /tmp/lint-full-output.txt > /tmp/fluent-import-violations.txt && \
wc -l /tmp/fluent-import-violations.txt
```

**Action Items:**
- Save the full lint output to a file for later review
- Count total violations
- Create a summary document listing all violations by app directory
- Note which apps have zero violations (will be marked as compliant)

**Expected Output:** One or more violations listed by file and line number, or "0" if all compliant (unlikely on first run).

---

### 4C.5.3 — Scan for Existing ESLint Disable Comments

Identify any existing `eslint-disable` comments that may be masking violations. These need to be reviewed and replaced with justified suppressions.

```bash
grep -r "eslint-disable.*no-direct-fluent-import\|eslint-disable-next-line.*no-direct-fluent-import" \
  --include="*.ts" --include="*.tsx" \
  /sessions/tender-zen-rubin/mnt/hb-intel/apps/ | tee /tmp/existing-disable-comments.txt

echo "=== Count ===" && wc -l /tmp/existing-disable-comments.txt
```

**Action Items:**
- List all existing disable comments
- Review each one to determine if it has proper justification
- Remove or update comments that lack justification
- Ensure all updates follow the format in Step 4C.5.5 (Bucket 2)

---

### 4C.5.4 — Scan for Direct Fluent Imports Not Caught by ESLint

Find any direct imports from `@fluentui/react-components` that may not yet be caught by the ESLint rule (e.g., due to rule configuration not being active in specific files or directories).

```bash
grep -r "from '@fluentui/react-components'" \
  --include="*.ts" --include="*.tsx" \
  /sessions/tender-zen-rubin/mnt/hb-intel/apps/ | tee /tmp/direct-fluent-imports.txt

echo "=== Count ===" && wc -l /tmp/direct-fluent-imports.txt
```

Also check for other Fluent UI package imports that might be indirect:

```bash
grep -r "from '@fluentui/" \
  --include="*.ts" --include="*.tsx" \
  /sessions/tender-zen-rubin/mnt/hb-intel/apps/ | grep -v "@hbc/ui-kit" | head -20
```

**Action Items:**
- List all direct Fluent imports
- Cross-reference with ESLint violations from Step 4C.5.2
- Any direct imports not in the ESLint report may indicate rule configuration gaps (note for team)

---

### 4C.5.5 — Categorize Violations into Three Buckets

For each violation found (from Steps 4C.5.2, 4C.5.3, 4C.5.4), assign it to exactly one of three resolution buckets. Create a spreadsheet or document to track all violations and their assignments.

**Bucket 1 — Fix Now**

Violations where the imported Fluent component has a direct, drop-in replacement in `@hbc/ui-kit`.

**Indicators:**
- HBC wrapper exists with same or very similar API
- Component is core to HBC design system (Button, Card, TextField, etc.)
- No custom wrapping or augmentation needed
- Example: `import { Button } from '@fluentui/react-components'` → replace with `import { HbcButton } from '@hbc/ui-kit'`

**Resolution:** Replace the import and update all usages.

**Bucket 2 — Suppress with Justification**

Legitimate exceptions where suppression is appropriate:
- Storybook stories that document Fluent components directly
- Test utilities that need raw Fluent API
- One-off scenarios where creating a wrapper is not warranted
- Intentional leakage for specific UI/UX need with documented rationale

**Indicators:**
- File is a `.stories.tsx` file (Storybook)
- File is in a `__tests__` or `test.ts` directory
- Comment explains why the direct import is necessary
- Documented exception with issue reference

**Resolution:** Add suppress comment with justification.

**Format:**
```ts
// eslint-disable-next-line @hb-intel/hbc/no-direct-fluent-import -- [reason: ...] tracked in #ISSUE_NUMBER
import { ComponentName } from '@fluentui/react-components';
```

**Bucket 3 — Escalate**

Violations that require a new wrapper component to be created in `@hbc/ui-kit`. Escalation means:
- The component is needed but no UI Kit wrapper exists
- Creating the wrapper is within scope of future work
- The need is documented as a backlog item
- This is **not** resolved in PH4C (only documented)

**Indicators:**
- Specialized component not in HBC design system
- Wrapping would add value (theming, consistent API, constraints)
- No quick fix or suppression rationale exists
- Used in production code (not test/story)

**Resolution:** Create tracking issue, document in escalations file, **do not create wrapper in PH4C**.

---

### 4C.5.6 — Apply Bucket 1 Fixes (Fix Now)

For each Bucket 1 violation, execute the import replacement and update all usages.

**Workflow:**

1. **Identify the violation:**
   ```
   apps/accounting/src/pages/TransactionList.tsx:42
   Import from '@fluentui/react-components'
   Component: Button
   ```

2. **Verify HBC replacement exists:**
   ```bash
   grep -r "export.*HbcButton\|export.*Button" \
     /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/ | grep -v node_modules
   ```

3. **Open the file:**
   ```bash
   cat /sessions/tender-zen-rubin/mnt/hb-intel/apps/accounting/src/pages/TransactionList.tsx | head -50
   ```

4. **Apply the fix:**
   - Change: `import { Button } from '@fluentui/react-components'`
   - To: `import { HbcButton } from '@hbc/ui-kit'`
   - Update any usage: `<Button />` → `<HbcButton />` (if API differs)

5. **Verify the change compiles:**
   ```bash
   cd /sessions/tender-zen-rubin/mnt/hb-intel && pnpm turbo run build --filter=apps/accounting 2>&1 | tail -10
   ```

**Example Fixes:**

| File | Before | After | Notes |
|---|---|---|---|
| `apps/accounting/src/components/TransactionForm.tsx:15` | `import { Button } from '@fluentui/react-components'` | `import { HbcButton } from '@hbc/ui-kit'` | API compatible, no usage changes needed |
| `apps/estimating/src/components/EstimateCard.tsx:8` | `import { Card } from '@fluentui/react-components'` | `import { HbcCard } from '@hbc/ui-kit'` | HBC wrapper available, update `<Card />` to `<HbcCard />` |

**Action Items:**
- Create a checklist of all Bucket 1 violations (see Verification Evidence template)
- For each violation: fix, test, commit
- Verify zero Bucket 1 violations remain after this step

---

### 4C.5.7 — Apply Bucket 2 Suppressions (Suppress with Justification)

For each Bucket 2 violation, add an ESLint disable comment with clear justification and issue reference.

**Format:**
```ts
// eslint-disable-next-line @hb-intel/hbc/no-direct-fluent-import -- [reason] tracked in #ISSUE_NUMBER
import { ComponentName } from '@fluentui/react-components';
```

**Justifications (examples):**
- `Storybook story requires raw Fluent component for props documentation`
- `Test utility needs direct access to Fluent component API for assertions`
- `One-off specialized visualization not in HBC design system`

**Workflow:**

1. **Identify the violation:**
   ```
   apps/pwa/src/stories/FluentComponents.stories.tsx:25
   ```

2. **Determine justification:**
   ```
   Is this a .stories.tsx file? → Yes → Justification: "Storybook story"
   ```

3. **Open the file and add comment:**
   ```ts
   // eslint-disable-next-line @hb-intel/hbc/no-direct-fluent-import -- Storybook story requires raw Fluent component for props documentation. tracked in #1234
   import { Slider } from '@fluentui/react-components';
   ```

4. **Re-run linting on this file:**
   ```bash
   cd /sessions/tender-zen-rubin/mnt/hb-intel && pnpm turbo lint --filter=apps/pwa 2>&1 | grep "FluentComponents.stories"
   ```

   **Expected:** No errors reported for this file.

**Action Items:**
- Create a list of all Bucket 2 violations with justifications
- Add suppress comments to each file
- Link each suppression to a GitHub issue (create if needed) for visibility
- Verify zero unsuppressed Bucket 2 violations remain

---

### 4C.5.8 — Document Bucket 3 Escalations (Escalate)

For each Bucket 3 violation, create a tracking issue and document in a central escalations file. **Do not create the wrapper component in PH4C.**

**Workflow:**

1. **Identify the violation:**
   ```
   apps/admin/src/components/CustomChart.tsx:12
   Direct import: ChartComponent from @fluentui/react-components
   ```

2. **Verify no HBC wrapper exists:**
   ```bash
   grep -r "export.*Chart\|export.*HbcChart" \
     /sessions/tender-zen-rubin/mnt/hb-intel/packages/ui-kit/src/
   ```

   Result: No matches → Confirm escalation needed.

3. **Create a tracking issue (in GitHub or equivalent):**
   ```
   Title: "UI Kit: Create HbcChart wrapper component"
   Description:
     - Current direct import: @fluentui/react-components/Chart
     - Use case: Custom chart in Admin Dashboard
     - Scope: Post-PH4C (backlog item)
     - Component should expose Fluent Chart API with HBC theming and constraints
   Priority: Low / Medium (depends on criticality)
   ```

4. **Document in escalations file:**
   Create `/sessions/tender-zen-rubin/mnt/hb-intel/docs/troubleshooting/eslint-fluent-import-escalations.md`:

   ```markdown
   # ESLint Fluent Import Escalations — Bucket 3

   This document lists components imported directly from `@fluentui/react-components`
   that require new UI Kit wrappers. These are backlog items for post-PH4C work.

   ## ChartComponent (Admin Dashboard)

   - **Violation Location:** `apps/admin/src/components/CustomChart.tsx:12`
   - **Component Name:** ChartComponent (from @fluentui/react-components)
   - **Use Case:** Custom chart visualization in Admin Dashboard
   - **Reason for Escalation:** No HBC wrapper exists; creating a general-purpose chart wrapper requires design review
   - **Tracking Issue:** #1250 (or equivalent)
   - **Target Phase:** PH5 or later
   - **Notes:** Wrapper should expose Fluent Chart API with HBC theming and validation constraints

   ## CustomDataGrid (Project Hub)

   - **Violation Location:** `apps/project-hub/src/pages/GanttView.tsx:8`
   - **Component Name:** DataGridLayout (from @fluentui/react-components)
   - **Use Case:** Custom Gantt-style layout, not standard data grid
   - **Reason for Escalation:** Specialized layout component, HBC data grid doesn't fit; wrapper needed post-design-review
   - **Tracking Issue:** #1251
   - **Target Phase:** PH6 or later
   - **Notes:** Requires UX review to determine if standard HbcDataTable can be adapted

   ## Summary

   - **Total Escalations:** 2
   - **Issues Created:** 2 (#1250, #1251)
   - **Est. Effort:** High (requires design review and iteration)
   - **Timeline:** Post-PH4C backlog
   ```

5. **Add a TODO comment in the code pointing to the issue:**
   ```ts
   // TODO: Use HbcChart once available (tracked in #1250)
   import { ChartComponent } from '@fluentui/react-components';
   ```

**Action Items:**
- For each Bucket 3 violation: create GitHub issue, document in escalations file, add TODO comment in code
- Verify escalations file is in correct location and uses Diátaxis structure (troubleshooting)
- Ensure all issues are linked and tracked in project backlog

---

### 4C.5.9 — Re-run Lint Audit and Confirm Compliance

Execute a final lint audit to verify that all violations have been addressed (either fixed, suppressed with justification, or escalated).

```bash
cd /sessions/tender-zen-rubin/mnt/hb-intel && \
pnpm turbo lint 2>&1 | tee /tmp/lint-final-output.txt | grep -E "no-direct-fluent-import"
```

Capture the result:

```bash
echo "=== Final Violation Count ===" && \
grep -c "no-direct-fluent-import" /tmp/lint-final-output.txt || echo "✓ Zero violations"
```

**Expected Output:** Either:
- No lines (zero violations), OR
- Only lines with `eslint-disable` comments that include justification + issue number

Any violations without suppress comments indicate incomplete work.

---

### 4C.5.10 — Update UI Kit Exports and Reference Docs

If new ui-kit wrappers were created as part of Bucket 1 fixes (i.e., if any HBC wrappers were added or updated):

**Action Items:**
- Add new wrappers to the ui-kit barrel export (`packages/ui-kit/src/index.ts`)
- Create placeholder reference docs in `docs/reference/ui-kit/` for each new wrapper
- Include the wrapper name, purpose, props, and examples

**Example (if HbcChart was created during Bucket 1 fixes):**

Add to `packages/ui-kit/src/index.ts`:
```ts
export { HbcChart, type HbcChartProps } from './HbcChart';
```

Create `docs/reference/ui-kit/HbcChart.md`:
```markdown
# HbcChart

A wrapper around Fluent UI's Chart component with HBC theming and constraints.

## Props

[Props table]

## Examples

[Usage examples]

## See Also

- [Data Visualization Guide](../explanation/data-visualization.md)
- [Fluent Chart Docs](https://fluent-ui.com/docs/Chart)
```

**Note:** If no new wrappers were created during Bucket 1 fixes (all Bucket 1 violations were swaps to existing wrappers), skip this step.

---

### 4C.5.11 — Create Summary Report and Metrics

Document the final results of the audit: violation counts by bucket, apps compliant, total resolution time, etc.

**File:** `/sessions/tender-zen-rubin/mnt/hb-intel/docs/architecture/plans/PH4C.5-Audit-Summary.md`

```markdown
# PH4C.5 — ESLint Fluent Import Audit Summary

**Date Completed:** 2026-03-07
**Audit Scope:** 14 apps/ directories
**Total Files Scanned:** [number]
**Total Violations Found:** [number]

## Results by Bucket

| Bucket | Violations | Resolved | Status |
|---|---|---|---|
| Bucket 1 (Fix Now) | [N] | [N] | [COMPLETE / IN PROGRESS / PENDING] |
| Bucket 2 (Suppress) | [N] | [N] | [COMPLETE / IN PROGRESS / PENDING] |
| Bucket 3 (Escalate) | [N] | [N] | [COMPLETE / DOCUMENTED] |
| **Total** | **[N]** | **[N]** | **[%]** |

## Compliance by App

| App | Status | Fix Count | Suppress Count | Escalate Count |
|---|---|---|---|---|
| accounting | [ ] Compliant | [N] | [N] | [N] |
| admin | [ ] Compliant | [N] | [N] | [N] |
| business-development | [ ] Compliant | [N] | [N] | [N] |
| dev-harness | [ ] Compliant | [N] | [N] | [N] |
| estimating | [ ] Compliant | [N] | [N] | [N] |
| hb-site-control | [ ] Compliant | [N] | [N] | [N] |
| human-resources | [ ] Compliant | [N] | [N] | [N] |
| leadership | [ ] Compliant | [N] | [N] | [N] |
| operational-excellence | [ ] Compliant | [N] | [N] | [N] |
| project-hub | [ ] Compliant | [N] | [N] | [N] |
| pwa | [ ] Compliant | [N] | [N] | [N] |
| quality-control-warranty | [ ] Compliant | [N] | [N] | [N] |
| risk-management | [ ] Compliant | [N] | [N] | [N] |
| safety | [ ] Compliant | [N] | [N] | [N] |

## Key Findings

[Notes on patterns, commonly violated components, insights about wrapper coverage, etc.]

## Escalations

[Summary of Bucket 3 items and tracking issues. See `docs/troubleshooting/eslint-fluent-import-escalations.md` for details.]

## Recommendations

[Any follow-up actions or improvements suggested by the audit]

## Verification

Final lint audit confirms zero unexplained violations. All violations are either:
- Fixed (Bucket 1)
- Suppressed with justification and issue reference (Bucket 2)
- Documented and escalated (Bucket 3)
```

---

## Success Criteria Checklist

- [ ] ESLint rule `no-direct-fluent-import` verified at error level
- [ ] Full lint audit executed and all violations documented
- [ ] Existing ESLint disable comments reviewed; non-justified comments removed/updated
- [ ] Direct Fluent imports scanned; cross-referenced with ESLint report
- [ ] All violations categorized into Bucket 1, 2, or 3
- [ ] Bucket 1 (Fix Now):
  - [ ] All violations fixed with import replacements
  - [ ] All usages updated (e.g., `<Button />` → `<HbcButton />`)
  - [ ] Build succeeds for affected apps
  - [ ] Zero Bucket 1 violations remain
- [ ] Bucket 2 (Suppress with Justification):
  - [ ] All suppressions added with comment format
  - [ ] Each suppression includes reason and issue reference
  - [ ] All referenced issues created or already tracked
  - [ ] Zero unsuppressed Bucket 2 violations remain
- [ ] Bucket 3 (Escalate):
  - [ ] All escalations documented in `docs/troubleshooting/eslint-fluent-import-escalations.md`
  - [ ] GitHub issues created for each escalation
  - [ ] TODO comments added in code pointing to issues
  - [ ] Issues linked in project backlog
- [ ] UI Kit exports updated (if new wrappers created)
- [ ] Reference documentation created for new wrappers (if any)
- [ ] Summary report created at `docs/architecture/plans/PH4C.5-Audit-Summary.md`
- [ ] Final lint audit confirms zero unexplained violations
- [ ] All 14 apps marked compliant or with documented exceptions

---

## Verification Commands

### Verify Rule Configuration
```bash
cat /sessions/tender-zen-rubin/mnt/hb-intel/packages/eslint-plugin-hbc/src/rules/no-direct-fluent-import.ts | grep -A 5 "meta.*:" | head -10
```

**Expected:** Rule definition with severity 'error'.

### Run Full Lint Audit
```bash
cd /sessions/tender-zen-rubin/mnt/hb-intel && \
pnpm turbo lint 2>&1 | grep -c "no-direct-fluent-import" || echo "0"
```

**Expected:** Count of violations (should decrease as work progresses to zero).

### Check for Unsuppressed Violations
```bash
cd /sessions/tender-zen-rubin/mnt/hb-intel && \
pnpm turbo lint 2>&1 | grep "no-direct-fluent-import" | grep -v "eslint-disable" | wc -l || echo "0"
```

**Expected:** Zero (all violations either fixed or suppressed).

### Verify Escalations File Exists
```bash
test -f /sessions/tender-zen-rubin/mnt/hb-intel/docs/troubleshooting/eslint-fluent-import-escalations.md && \
echo "✓ Escalations file exists" || echo "✗ Missing"
```

**Expected:** File exists.

### Verify Summary Report Exists
```bash
test -f /sessions/tender-zen-rubin/mnt/hb-intel/docs/architecture/plans/PH4C.5-Audit-Summary.md && \
echo "✓ Summary report exists" || echo "✗ Missing"
```

**Expected:** File exists.

### Build All Apps
```bash
cd /sessions/tender-zen-rubin/mnt/hb-intel && \
pnpm turbo run build 2>&1 | grep -E "error|Error|ERROR" | grep -v "TypeScript\|type" || echo "✓ Build succeeded"
```

**Expected:** No build errors introduced by fixes.

---

## PH4C.5 Progress Notes

Use this section to document the execution of PH4C.5. Update it as you proceed through implementation steps.

- **4C.5.1 — Rule Configuration Verified**
  - Date Checked: ___________
  - Rule Location: `packages/eslint-plugin-hbc/src/rules/no-direct-fluent-import.ts`
  - Severity: [ ] error [ ] warn [ ] off
  - Status: [ ] Verified

- **4C.5.2 — Full Lint Audit Executed**
  - Date Executed: ___________
  - Total Violations Found: ___________
  - Violations by Severity: error=[N], warn=[N], off=[N]
  - Output Saved To: `/tmp/lint-full-output.txt`
  - Status: [ ] Complete

- **4C.5.3 — Existing Disable Comments Scanned**
  - Date Scanned: ___________
  - Count of Existing Suppressions: ___________
  - With Valid Justification: ___________
  - Requiring Cleanup: ___________
  - Status: [ ] Complete

- **4C.5.4 — Direct Fluent Imports Scanned**
  - Date Scanned: ___________
  - Total Direct Imports Found: ___________
  - Imports Not in ESLint Report: ___________
  - Notes on Rule Coverage: ___________
  - Status: [ ] Complete

- **4C.5.5 — Violations Categorized**
  - Date Categorized: ___________
  - Bucket 1 (Fix Now): ___________
  - Bucket 2 (Suppress): ___________
  - Bucket 3 (Escalate): ___________
  - Total: ___________
  - Tracking Document: `/tmp/violation-categorization.csv` or similar
  - Status: [ ] Complete

- **4C.5.6 — Bucket 1 Fixes Applied**
  - Date Started: ___________
  - Date Completed: ___________
  - Fixes Applied: ___________
  - Build Status: [ ] Pass [ ] Fail
  - Remaining Bucket 1: ___________
  - Status: [ ] Complete

- **4C.5.7 — Bucket 2 Suppressions Added**
  - Date Started: ___________
  - Date Completed: ___________
  - Suppressions Added: ___________
  - Issues Created/Referenced: ___________
  - Status: [ ] Complete

- **4C.5.8 — Bucket 3 Escalations Documented**
  - Date Started: ___________
  - Date Completed: ___________
  - Escalations Documented: ___________
  - Issues Created: ___________
  - Escalations File: `docs/troubleshooting/eslint-fluent-import-escalations.md`
  - Status: [ ] Complete

- **4C.5.9 — Final Lint Audit**
  - Date Executed: ___________
  - Violations Remaining: ___________
  - Unsuppressed Violations: ___________
  - Expected: [ ] Zero [ ] All justified
  - Status: [ ] Pass [ ] Fail

- **4C.5.10 — UI Kit Exports & Docs Updated**
  - Date Completed: ___________
  - New Wrappers Created: [ ] Yes [ ] No [ ] N/A
  - Wrappers Added to Exports: [ ]
  - Reference Docs Created: [ ]
  - Count of New Docs: ___________

- **4C.5.11 — Summary Report Created**
  - Date Completed: ___________
  - Report File: `docs/architecture/plans/PH4C.5-Audit-Summary.md`
  - Metrics Included: [ ]
  - Compliance by App: [ ]
  - Status: [ ] Complete

---

## Verification Evidence

Record the results of each verification command here.

| Verification | Command | Status | Evidence | Notes |
|---|---|---|---|---|
| Rule Config | `grep -A 5 meta` | [ ] Pass | ___________ | Severity must be 'error' |
| Full Lint Audit | `pnpm turbo lint \| grep count` | [ ] Pass | ___________ | Capture initial violation count |
| Disable Comments | `grep eslint-disable` | [ ] Pass | ___________ | Count of existing suppressions |
| Direct Imports | `grep @fluentui` | [ ] Pass | ___________ | Cross-reference with lint report |
| Categorization | Manual review | [ ] Pass | ___________ | Document in CSV/spreadsheet |
| Bucket 1 Fixes | `pnpm turbo build` | [ ] Pass | ___________ | All fixes compile |
| Bucket 2 Suppressions | `grep eslint-disable-next-line` | [ ] Pass | ___________ | All have justification + issue |
| Bucket 3 Escalations | `test -f escalations.md` | [ ] Pass | ___________ | File exists and complete |
| Final Audit | `pnpm turbo lint \| grep count` | [ ] Pass | ___________ | Zero unsuppressed violations |
| Summary Report | `test -f summary.md` | [ ] Pass | ___________ | File exists and populated |
| Build Success | `pnpm turbo run build` | [ ] Pass | ___________ | No new errors introduced |

---

## Escalations File Template

Create `/sessions/tender-zen-rubin/mnt/hb-intel/docs/troubleshooting/eslint-fluent-import-escalations.md` with this structure if Bucket 3 items exist:

```markdown
# ESLint Fluent Import Escalations

This document lists components that currently require direct imports from `@fluentui/react-components`
because no HBC UI Kit wrapper exists. These are backlog items for future phases.

## Overview

- **Total Escalations:** [N]
- **Issues Tracking:** [N] GitHub issues created
- **Target Phase:** PH5 or later
- **Status:** All documented and tracked

## Escalation Items

### [Component Name]

- **Violation File(s):** `path/to/file.tsx:line`
- **Component:** `ComponentName` (from @fluentui/react-components)
- **Use Case:** [Description of why this component is needed]
- **Reason for Escalation:** [Explanation of why a wrapper is needed and why it wasn't created in PH4C]
- **Tracking Issue:** [Link to GitHub issue or backlog item]
- **Estimated Effort:** [Small / Medium / Large]
- **Target Phase:** [PH5 / PH6 / Later]
- **Wrapper Scope:** [Description of what the wrapper should do]
- **Notes:** [Any additional context or constraints]

### [Component Name #2]

[Repeat template]

## Summary Statistics

| Metric | Value |
|---|---|
| Total Escalations | [N] |
| by Estimated Effort: Small | [N] |
| by Estimated Effort: Medium | [N] |
| by Estimated Effort: Large | [N] |
| by Phase: PH5 | [N] |
| by Phase: PH6 | [N] |
| by Phase: Later | [N] |

## Next Steps

1. Prioritize escalations by business impact and effort estimate
2. Schedule wrapper creation in roadmap planning
3. Ensure escalations are visible in project backlog
4. Link escalations to design system review cadence

## See Also

- [ESLint Rule Documentation](../reference/eslint-plugin-hbc.md)
- [UI Kit Reference](../reference/ui-kit/index.md)
- [Component Checklist](../how-to/developer/creating-ui-kit-components.md)
```

---

**End of PH4C.5**
