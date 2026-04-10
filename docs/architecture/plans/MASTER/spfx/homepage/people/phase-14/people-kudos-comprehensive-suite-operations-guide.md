# Operations Guide: People & Culture + HB Kudos Comprehensive Test Suite

**Package:** Phase-14 Testing (Prompt-06)  
**Suite location:** `scripts/testing/people-kudos/`  
**Config template:** `scripts/testing/people-kudos/config.example.json`  
**Closure report:** `docs/architecture/reviews/people-kudos-comprehensive-test-suite-closure-report.md`

---

## Quick Start

### Prerequisites

- Node.js 18+ and `npm` or `pnpm`
- Access to target SharePoint site (for live runs)
- M365 app registration (for bearer token auth)
- Service principal credentials or user account credentials

### Dry-run (no tenant access required)

```bash
# Validate suite structure without touching SharePoint
npx tsx scripts/testing/people-kudos/runAll.ts --dry-run
```

Output shows all 236 checks with dry-run status (no actual creates, no cleanup required).

### Live run (requires tenant access)

```bash
# Run against live SharePoint
npx tsx scripts/testing/people-kudos/runAll.ts --live --token <bearer-token>
```

Creates test items, validates persistence, cleans up by default.

---

## Configuration

### Default Configuration

The suite uses sensible defaults for the HB Central site:

```json
{
  "siteUrl": "https://hedrickbrotherscom.sharepoint.com/sites/HBCentral",
  "lists": {
    "peopleCultureKudos": "People Culture Kudos",
    "kudosAuditEvents": "Kudos Audit Events",
    "peopleCultureAnnouncements": "People Culture Announcements",
    "peopleCultureCelebrations": "People Culture Celebrations"
  },
  "testPrefix": "TEST-HBI",
  "cleanup": true,
  "auditParity": true,
  "docsDir": "docs/architecture/plans/MASTER/spfx/homepage/people/phase-14"
}
```

### Custom Configuration

Create `scripts/testing/people-kudos/config.json`:

```json
{
  "siteUrl": "https://yourtenant.sharepoint.com/sites/YourSite",
  "lists": {
    "peopleCultureKudos": "Kudos List Name",
    "kudosAuditEvents": "Audit Events List Name",
    "peopleCultureAnnouncements": "Announcements List Name",
    "peopleCultureCelebrations": "Celebrations List Name"
  },
  "testPrefix": "MY-PREFIX",
  "cleanup": true,
  "auditParity": true,
  "docsDir": "docs/architecture/plans/MASTER/spfx/homepage/people/phase-14"
}
```

Run with custom config:

```bash
npx tsx scripts/testing/people-kudos/runAll.ts --live --token <token> --config scripts/testing/people-kudos/config.json
```

### Configuration Options

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `siteUrl` | string | HB Central site URL | Target SharePoint site |
| `lists.peopleCultureKudos` | string | `People Culture Kudos` | Kudos list display name |
| `lists.kudosAuditEvents` | string | `Kudos Audit Events` | Audit events list display name |
| `lists.peopleCultureAnnouncements` | string | `People Culture Announcements` | Announcements list display name |
| `lists.peopleCultureCelebrations` | string | `People Culture Celebrations` | Celebrations list display name |
| `testPrefix` | string | `TEST-HBI` | Prefix for synthetic test data (used for cleanup) |
| `cleanup` | boolean | `true` | Auto-delete created test items after run |
| `auditParity` | boolean | `true` | Verify audit events match item transitions |
| `docsDir` | string | `docs/...` | Documentation directory for reporting |

---

## Authentication

### Bearer Token (Service Principal)

1. Register app in Azure AD / Entra ID
2. Grant `Sites.Manage.All` or `Sites.ReadWrite.All` permission
3. Obtain access token:

```bash
# Using Azure CLI
az account get-access-token --resource https://graph.microsoft.com | jq -r .accessToken

# Or use your app credentials directly (consult your org's auth docs)
```

4. Run with token:

```bash
npx tsx scripts/testing/people-kudos/runAll.ts --live --token <your-token>
```

### Interactive Auth (User Account)

If configured with interactive auth support (not yet implemented):

```bash
# Would prompt for MFA / device code flow
npx tsx scripts/testing/people-kudos/runAll.ts --live
```

---

## Running the Suite

### Full Suite

```bash
# Dry-run (validates structure, safe for CI/CD)
npx tsx scripts/testing/people-kudos/runAll.ts --dry-run

# Live run with cleanup (creates items, validates, deletes)
npx tsx scripts/testing/people-kudos/runAll.ts --live --token <token>

# Live run without cleanup (creates items, does NOT delete)
npx tsx scripts/testing/people-kudos/runAll.ts --live --token <token> --no-cleanup

# Verbose output (shows detailed results)
npx tsx scripts/testing/people-kudos/runAll.ts --live --token <token> --verbose
```

### Individual Suite

```bash
# HB Kudos suite only
npx tsx scripts/testing/people-kudos/runSuite.ts --suite kudos --dry-run

# People & Culture suite only
npx tsx scripts/testing/people-kudos/runSuite.ts --suite pc --dry-run

# Companions suite only
npx tsx scripts/testing/people-kudos/runSuite.ts --suite companions --dry-run

# Smoke suite only (no tenant required)
npx tsx scripts/testing/people-kudos/runSuite.ts --suite smoke --dry-run
```

### CLI Options

| Flag | Argument | Effect |
|------|----------|--------|
| `--dry-run` | none | Validates structure without writing to SharePoint (default) |
| `--live` | none | Writes test items to SharePoint and validates persistence |
| `--token` | bearer-token | Explicit bearer token (overrides auth discovery) |
| `--config` | path | Custom config file path |
| `--verbose` | none | Detailed output for each step |
| `--no-cleanup` | none | Skip deletion of created test items after run |

---

## Understanding Test Output

### Dry-run Output

```
── kudos ───────────────────────────────────

[·] kudos.submit.create                    itemId=414429 kudosId=TEST-HBI-hbi-20260410082814-4da8f7-001
[·] kudos.submit.persist.kudosId           dry-run: would assert KudosId === "TEST-HBI-hbi-20260410082814-4da8f7-001"
[·] kudos.approval.approve                 dry-run: would assert WorkflowStatus === "approved"
[!] kudos.recipients.taxonomy              TeamRecipients/DepartmentRecipients are Taxonomy fields — term-store write deferred
[✓] comp.kudos.role.admin.canApprove       canApprove=true (matrix proven in kudosCapabilities.ts + vitest)
[·] smoke.build.jsSize.detail              755 KB

── cleanup ──────────────────────────────────

[·] cleanup.kudos                          would delete 0 kudos row(s)
[·] cleanup.audit                          would delete 0 audit row(s)

================= SUMMARY =================
dry-run:  true
results:  total=236 pass=45 fail=0 warn=17 skip=0 dry=174
===========================================
```

### Status Symbols

| Symbol | Meaning | Action |
|--------|---------|--------|
| `[·]` | Dry-run check | Would execute in live mode |
| `[✓]` | Passed | Validation succeeded |
| `[!]` | Warning | Known limitation or deferred coverage |
| `[✗]` | Failed | Error occurred, suite halted |
| `[◌]` | Skipped | Condition not met, check skipped |

### Result Summary

```
results: total=236 pass=45 fail=0 warn=17 skip=0 dry=174
```

- **total**: All checks executed
- **pass**: Assertions succeeded (✓)
- **fail**: Errors encountered (✗) — exit code 1
- **warn**: Known limitations or deferred coverage (!)
- **skip**: Conditions not met (◌)
- **dry**: Dry-run validations (·)

### Common Warnings (Expected)

These warnings are documented in the closure report and do not indicate failures:

```
[!] kudos.recipients.taxonomy              Taxonomy fields require term-store; write deferred
[!] pc.cel.personName                      UserMulti field; live harness defers to unit tests
[!] comp.claim.reassign.note               Target user may not resolve in live mode
[!] pc.gov.lifecycle.states                State is derived; not a single column
[!] comp.pc.approvalsInbox                 UI surface rendering; state logic proven in vitest
```

---

## Extending the Suite

### Adding a New Workflow Test

1. **Create new workflow file**

   File: `scripts/testing/people-kudos/kudos/newFeature.ts`

   ```typescript
   import type { RunContext } from '../shared/types.js';
   import { recordResult, assertFieldEquals } from '../shared/assertions.js';
   import { spCreateItem, spPatchItem, spGetItem } from '../shared/spClient.js';
   import { buildKudosDraftFields } from '../shared/fixtures.js';

   export async function runNewFeatureWorkflow(ctx: RunContext, userId: number): Promise<void> {
     const kudosList = ctx.config.lists.peopleCultureKudos;
     
     try {
       // 1. Create test item
       const draft = buildKudosDraftFields(ctx.runId, 99, { submittedByUserId: userId });
       const item = await spCreateItem(ctx, kudosList, draft as unknown as Record<string, unknown>);
       if (!ctx.dryRun) ctx.createdKudosItemIds.push(item.Id);
       
       // 2. Perform operation
       const patch = { YourNewField: 'value' };
       await spPatchItem(ctx, kudosList, item.Id, patch);
       
       // 3. Verify result
       const fetched = await spGetItem<Record<string, unknown>>(ctx, kudosList, item.Id, ['YourNewField']);
       assertFieldEquals(ctx, 'newFeature.yourField', 'YourNewField', fetched.YourNewField, 'value');
       recordResult(ctx, { step: 'newFeature.success', status: 'pass' });
     } catch (err) {
       recordResult(ctx, { step: 'newFeature', status: 'fail', detail: (err as Error).message });
     }
   }
   ```

2. **Register in suite index**

   File: `scripts/testing/people-kudos/kudos/index.ts`

   ```typescript
   import { runNewFeatureWorkflow } from './newFeature.js';

   export const kudosSuite: SuiteModule = {
     name: 'kudos',
     async run(ctx: RunContext): Promise<StepResult[]> {
       // ... existing workflows ...
       await runNewFeatureWorkflow(ctx, userId);  // Add this line
       return ctx.results;
     },
   };
   ```

3. **Add fixture builder if needed**

   File: `scripts/testing/people-kudos/shared/fixtures.ts`

   ```typescript
   export function buildNewFeaturePatch(fieldValue: string): Record<string, unknown> {
     return { YourNewField: fieldValue };
   }
   ```

4. **Test locally**

   ```bash
   npx tsx scripts/testing/people-kudos/runSuite.ts --suite kudos --dry-run
   ```

### Adding a New Assertion Helper

File: `scripts/testing/people-kudos/shared/assertions.ts`

```typescript
export function assertGreaterThan(
  ctx: RunContext,
  stepId: string,
  fieldName: string,
  actual: number,
  expected: number
): void {
  if (actual > expected) {
    recordResult(ctx, { step: stepId, status: 'pass', detail: `${fieldName}: ${actual} > ${expected}` });
  } else {
    recordResult(ctx, { step: stepId, status: 'fail', detail: `${fieldName}: expected ${actual} > ${expected}` });
  }
}
```

### Adding a New Fixture Generator

File: `scripts/testing/people-kudos/shared/fixtures.ts`

```typescript
export function buildNewContentType(
  runId: string,
  seq: number,
  overrides: Partial<NewContentInput> = {},
): Record<string, unknown> {
  const id = overrides.id ?? buildSyntheticId(runId, seq);
  return {
    Title: overrides.title ?? buildSyntheticHeadline(runId, seq, 'new-feature'),
    NewField: overrides.newField ?? 'default-value',
    CreatedDate: new Date().toISOString(),
  };
}
```

---

## Troubleshooting

### Test Won't Run: Config Error

```
Config validation failed: siteUrl is required
```

**Solution:**
- Verify config file exists at `scripts/testing/people-kudos/config.json`
- Or use `--config` flag with correct path
- Check JSON syntax is valid

### Auth Failure: Invalid Token

```
Auth failed: 401 Unauthorized
```

**Solution:**
- Verify bearer token is current (tokens expire after ~1 hour)
- Refresh token using your auth method
- Ensure token has `Sites.ReadWrite.All` or equivalent permission
- Check site URL is correct and accessible

### List Not Found

```
List query failed: List 'People Culture Kudos' not found
```

**Solution:**
- Verify list exists on target site
- Check list display name matches exactly (case-sensitive)
- Use custom config with correct list names
- Verify site URL is correct

### Permission Denied

```
Create failed: 403 Forbidden
```

**Solution:**
- Token must have write permission to lists
- User account must have Editor or higher role on site
- App registration must have `Sites.Manage.All` or `Sites.ReadWrite.All`

### Cleanup Failed

```
Cleanup warning: Could not delete item 12345
```

**Solution:**
- Manual cleanup required: go to list, filter by test prefix, delete items
- Use `--no-cleanup` on next run to skip automatic cleanup
- Check if items are locked by another process

### Assertion Failure

```
[✗] kudos.submit.persist.workflowStatus  
     expected WorkflowStatus === "pending", got "draft"
```

**Solution:**
- Compare expected vs actual values in output
- Check if schema has changed (field renamed, default changed)
- Verify test data is being created correctly
- Check SharePoint list design hasn't been modified

### Dry-run Results Don't Match Live

```
Dry-run: 236 pass, Live: 200 pass, 10 fail
```

**Solution:**
- Check auth token is valid (auth issues cause failures)
- Verify list contents are clean (old test data may interfere)
- Run with `--no-cleanup` first, then `--cleanup` to reset state
- Check if schema or list design changed since last dry-run

---

## Suite Maintenance

### Regular Maintenance Tasks

**Monthly:**
- Run full dry-run to validate structure: `npx tsx scripts/testing/people-kudos/runAll.ts --dry-run`
- Review any schema changes in SharePoint lists

**When Adding New Fields:**
1. Update schema documentation in `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`
2. Add field to fixture builder in `scripts/testing/people-kudos/shared/fixtures.ts`
3. Add test step to appropriate workflow
4. Run dry-run to validate: `npx tsx scripts/testing/people-kudos/runSuite.ts --suite <name> --dry-run`

**When Renaming Fields:**
1. Update fixture builders to use new field name
2. Update assertion helpers to reference new field name
3. Update all workflow tests that use the field
4. Run full suite: `npx tsx scripts/testing/people-kudos/runAll.ts --dry-run`

**When Removing Fields:**
1. Remove from fixture builders
2. Remove tests that use the field
3. Update related assertions
4. Run full suite to verify no broken references

### Keeping Tests Synchronized with Product Changes

The suite **must** be updated when:

- SharePoint list schema changes (new fields, renamed fields, type changes)
- Workflow logic changes (new states, new transitions)
- Governance model changes (new roles, new capabilities)
- UI surfaces change significantly (new companion features, new sections)

The suite **does not** need to be updated when:

- Visual design changes (CSS, component styling)
- Performance optimizations (same observable behavior)
- Internal refactoring (same field-level contract)
- Non-critical bug fixes (that don't change workflow)

### Schema Change Workflow

When schema changes:

1. Update `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/` schema reports
2. Update `scripts/testing/people-kudos/shared/fixtures.ts` to reflect new field structure
3. Add new test workflows if new transitions are possible
4. Run full suite: `npx tsx scripts/testing/people-kudos/runAll.ts --dry-run`
5. Document changes in closure report addendum

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      
      # Dry-run (always safe to run)
      - run: npx tsx scripts/testing/people-kudos/runAll.ts --dry-run
      
      # Live run (only on main branch, requires secret)
      - run: npx tsx scripts/testing/people-kudos/runAll.ts --live --token ${{ secrets.SHAREPOINT_TOKEN }}
        if: github.ref == 'refs/heads/main'
```

### Pre-commit Hook

```bash
# .husky/pre-commit
npx tsx scripts/testing/people-kudos/runAll.ts --dry-run || exit 1
```

---

## Performance Notes

### Typical Execution Times

- **Dry-run:** ~2-3 seconds (no network)
- **Live run (full suite):** ~30-60 seconds (depends on tenant latency)
- **Live run (single suite):** ~5-15 seconds
- **Cleanup:** ~5-10 seconds

### Optimization Tips

- Use `--no-cleanup` if you're iterating and don't need to reset state
- Run individual suite with `--suite` instead of full suite for faster feedback
- Use dry-run by default in local development, live runs in CI/CD only

---

## Support and Escalation

### Getting Help

1. **Review closure report:** `docs/architecture/reviews/people-kudos-comprehensive-test-suite-closure-report.md`
2. **Check this guide:** Troubleshooting section above
3. **Inspect test code:** `scripts/testing/people-kudos/<domain>/<workflow>.ts`
4. **Check schema docs:** `docs/architecture/plans/MASTER/spfx/homepage/people/phase-14/`

### Reporting Issues

When reporting suite issues, include:
- Command you ran
- Full error output
- Dry-run result (for comparison)
- Config used (anonymized)
- Steps to reproduce

### Future Enhancements

Planned for Phase 7+:

- E2E browser tests for UI surfaces
- Multi-tenant scenario tests
- Term-store integration (for audience/recipient taxonomy fields)
- Notification delivery channel mocking
- Culture program/event list coverage (pending list provisioning)

See closure report section "Next Actions" for detailed roadmap.

---

## Document History

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-10 | 1.0 | Initial operations guide (Prompt-06) |
| — | — | — |

