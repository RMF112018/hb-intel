# PH7.13-T04 — Stub Inventory Remediation

**Phase Reference:** PH7.13 (Stub Detection and Incomplete Implementation Enforcement)
**Spec Source:** `docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md`
**Decisions Applied:** D-04 (stub-approved escape hatch), D-06 (`tools/mocks/` globally exempt), D-07 (BIC aggregation deferred), D-08 (full inventory closure required)
**Estimated Effort:** 0.2 sprint-weeks
**Depends On:** T02 (no-stub-implementations rule in place so markers can be verified to suppress it)

> **Doc Classification:** Canonical Normative Plan — PH7.13-T04 task; sub-plan of `PH7.13-Stub-Detection-Enforcement.md`.

---

## Objective

Apply `stub-approved` markers to all three stubs that require explicit exemption (S-01, S-02, S-06), and confirm that S-03, S-04, and S-05 in `tools/mocks/` are globally exempt by directory — no markers required. After this task, the CI grep scan (T03) and `no-stub-implementations` ESLint rule (T02) must both pass with zero unapproved results.

---

## 3-Line Plan

1. Add `// stub-approved:` markers to `acknowledgments/stubs.ts` (S-01) and `BicModuleRegistry.ts` (S-02).
2. Add `# stub-approved:` YAML comment to `.github/workflows/cd.yml` (S-06).
3. Run the CI grep simulation locally — confirm zero unapproved lines; confirm S-03/04/05 produce no lint or grep hits.

---

## Known Stub Inventory — Full Disposition

| # | File | Stub Type | Action Required |
|---|------|-----------|----------------|
| S-01 | `backend/functions/src/functions/acknowledgments/stubs.ts` | TypeScript log-only stubs | Apply `// stub-approved:` markers |
| S-02 | `packages/bic-next-move/src/registry/BicModuleRegistry.ts` | Server-side BIC aggregation (D-07) | Apply `// stub-approved:` marker |
| S-03 | `tools/mocks/sp-core-library.ts` | SPFx SDK mock | **No action** — globally exempt (D-06) |
| S-04 | `tools/mocks/sp-property-pane.ts` | SPFx SDK mock | **No action** — globally exempt (D-06) |
| S-05 | `tools/mocks/sp-webpart-base.ts` | SPFx SDK mock | **No action** — globally exempt (D-06) |
| S-06 | `.github/workflows/cd.yml` | YAML SPFx deploy job stub | Apply `# stub-approved:` YAML comment |

---

## S-01 — `backend/functions/src/functions/acknowledgments/stubs.ts`

**Context:** This file contains log-only stub implementations for BIC-completion callbacks, notification dispatch, and next-party notification hooks. These are intentional scaffolding stubs awaiting full SF04 (`@hbc/acknowledgment`) platform integration.

**Change:** Add `stub-approved` comment immediately above each stub function body (or at the file header if all functions in the file are stubs of the same category):

```typescript
// stub-approved: intentional BIC-completion and notification stubs pending SF04
// full platform integration. Implement when @hbc/acknowledgment T07 is activated
// and the Azure Functions trigger pipeline is established.
```

If stubs appear as individual function bodies with `throw new Error(...)` or `console.log(...)` patterns, place the comment on the line immediately preceding each stub throw. Example:

```typescript
export async function completeBicOnAcknowledgment(payload: AckPayload): Promise<void> {
  // stub-approved: BIC-completion pending SF04 @hbc/acknowledgment T07 activation
  console.log('[stub] completeBicOnAcknowledgment called', payload);
}
```

---

## S-02 — `packages/bic-next-move/src/registry/BicModuleRegistry.ts`

**Context:** The server-side BIC aggregation endpoint in `BicModuleRegistry` is a log-only stub. Per ADR-0095 D-07, server-side BIC aggregation is a PH8 concern — implementing it now would pull in Azure Functions infrastructure that is explicitly deferred.

**Change:** Add the `stub-approved` comment immediately above the stub aggregation code:

```typescript
// stub-approved: server-side BIC aggregation deferred per ADR-0095 D-07.
// This endpoint will aggregate BIC state across modules via the backend aggregation
// service. Implement when the backend aggregation endpoint is activated in PH8 CI/CD phase.
```

---

## S-06 — `.github/workflows/cd.yml`

**Context:** The SPFx deploy job in `cd.yml` has `if: false` and an `echo` statement that explicitly identifies itself as stubbed. The stub is intentional — the Vite-to-.sppkg packaging pipeline is deferred to PH8.

**Change:** Replace the existing echo stub run command with the `stub-approved` YAML comment and an updated echo message:

Before:
```yaml
    - run: echo "SPFx deploy is stubbed — see TODO comments"
```

After:
```yaml
    # stub-approved: SPFx deployment pending Vite-to-.sppkg packaging pipeline (PH8 CI/CD phase).
    # The deploy job is intentionally disabled (if: false) until PH8 establishes the build pipeline.
    - run: echo "SPFx deploy is not yet active — see PH8 CI/CD plan."
```

---

## S-03, S-04, S-05 — `tools/mocks/` (No Action Required)

These three files contain SPFx SDK mock implementations (`sp-core-library.ts`, `sp-property-pane.ts`, `sp-webpart-base.ts`). Per ADR-0095 D-06, the `tools/mocks/` directory is globally exempt from all stub scans:

- The ESLint `no-stub-implementations` rule's `excludedFiles` list contains `tools/mocks/**`
- The CI grep step's `grep -v "tools/mocks"` filter excludes all matches from this directory

**Confirmation step:** Verify that the three files do not produce lint errors or grep hits after T02 and T03 are in place.

---

## Verification Commands

```bash
# 1. Confirm S-01 has stub-approved marker
grep -n "stub-approved" backend/functions/src/functions/acknowledgments/stubs.ts
# Expected: one or more lines with stub-approved markers

# 2. Confirm S-02 has stub-approved marker
grep -n "stub-approved" packages/bic-next-move/src/registry/BicModuleRegistry.ts
# Expected: line with stub-approved comment

# 3. Confirm S-06 has stub-approved YAML comment
grep -n "stub-approved" .github/workflows/cd.yml
# Expected: line with stub-approved comment in the deploy job

# 4. Confirm S-03, S-04, S-05 produce no lint errors (globally exempt)
pnpm eslint tools/mocks/sp-core-library.ts tools/mocks/sp-property-pane.ts tools/mocks/sp-webpart-base.ts
# Expected: 0 errors from no-stub-implementations

# 5. Full CI grep simulation — must return empty after all markers are applied
grep -rn \
  --include="*.ts" --include="*.tsx" \
  --exclude-dir=dist --exclude-dir=node_modules --exclude-dir=coverage \
  -E "(throw new Error\(['\"\`][^'\"]+not.?impl|throw new Error\(['\"\`][^'\"]+placeholder)" \
  packages/ apps/ backend/ 2>/dev/null \
  | grep -v "stub-approved:" | grep -v "\.test\.\|\.spec\.\|tools/mocks"
# Expected: no output (empty = all stubs remediated or exempted)

# 6. Run pnpm scan-stubs (T05 must be complete for this)
pnpm scan-stubs
# Expected: ✅ No unapproved stubs found.

# 7. Run pnpm scan-stubs:all — should list S-01, S-02, S-06 as approved
pnpm scan-stubs:all
# Expected: lists the three stub-approved entries

# 8. Full lint gate — no stub-related errors
pnpm turbo run lint
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.13-T04 not yet started.
Next: PH7.13-T05 (scan-stubs Developer Tool)
-->
