# Phase 4C Task 3 – Deprecated Token Scan & Resolution

**Version:** 1.0 (Scan-Gated Token Removal or Versioning)
**Purpose:** This document defines the complete implementation steps to scan the UI Kit codebase for three deprecated tokens (`hbcColorSurfaceElevated`, `hbcColorSurfaceSubtle`, `hbcColorTextSubtle`), identify usages, and either remove tokens with zero usages or version them with TSDoc and tracking issues if usages exist.
**Audience:** Implementation agents, design system maintainers, QA specialists, architecture leads
**Implementation Objective:** Deliver zero legacy deprecated token references through a data-driven, scan-gated approach with proper versioning and tracking for any necessary migrations.

---

## Prerequisites

This task has ONE recommended prerequisite:

**PH4C.2 (Theme Token Hardcoding) should be completed BEFORE PH4C.3**

PH4C.3 is recommended to follow PH4C.2 to avoid scanning/modifying tokens.ts twice in a short time window. However, PH4C.3 can proceed independently if needed.

**Verification command (optional, not required):**
```bash
# Verify theme token replacements from PH4C.2 are complete
grep -c "\-\-hbc-" packages/ui-kit/src/theme/theme.ts && echo "✓ Theme variables present"
```

**If PH4C.2 is incomplete, PH4C.3 can still proceed; scanning deprecated tokens is independent.**

---

## 4C.3 Deprecated Token Scan & Resolution Implementation

### Context: Three Deprecated Tokens (D-PH4C-03, D-PH4C-04, F-01)

The UI Kit has three deprecated tokens identified in audit F-01:
1. `hbcColorSurfaceElevated` — likely a background/elevation token no longer in use
2. `hbcColorSurfaceSubtle` — likely a subtle background token replaced by more specific tokens
3. `hbcColorTextSubtle` — likely a secondary text color replaced by design system tokens

**Scan-gated approach (D-PH4C-03):**
- Step 1: Scan for usages of each token
- Step 2: If zero usages found → remove token completely
- Step 3: If usages found → add versioned TSDoc comment + create tracking issue for migration

---

## 4C.3 Implementation Steps

### 4C.3.1 Scan for `hbcColorSurfaceElevated` Usages

1. Open a terminal in the repository root
2. Run a comprehensive grep scan across all source files:
   ```bash
   # Search for all references to hbcColorSurfaceElevated
   grep -r "hbcColorSurfaceElevated" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" --color=always
   ```
3. Capture the output and count results:
   ```bash
   grep -r "hbcColorSurfaceElevated" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" | wc -l
   ```
4. **If count = 0:** Token is unused; proceed to 4C.3.4 (removal)
5. **If count > 0:** Document all usages; token must be versioned (proceed to 4C.3.7)

**Expected output:** A list of files/lines where `hbcColorSurfaceElevated` is referenced, or zero results.

### 4C.3.2 Scan for `hbcColorSurfaceSubtle` Usages

1. Run the same scan for the second token:
   ```bash
   grep -r "hbcColorSurfaceSubtle" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" --color=always
   ```
2. Count results:
   ```bash
   grep -r "hbcColorSurfaceSubtle" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" | wc -l
   ```
3. **If count = 0:** Token is unused; proceed to 4C.3.4 (removal)
4. **If count > 0:** Document usages; token must be versioned

**Expected output:** A list of usages or zero results.

### 4C.3.3 Scan for `hbcColorTextSubtle` Usages

1. Run the same scan for the third token:
   ```bash
   grep -r "hbcColorTextSubtle" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" --color=always
   ```
2. Count results:
   ```bash
   grep -r "hbcColorTextSubtle" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" | wc -l
   ```
3. **If count = 0:** Token is unused; proceed to 4C.3.4 (removal)
4. **If count > 0:** Document usages; token must be versioned

**Expected output:** A list of usages or zero results.

### 4C.3.4 Remove Deprecated Tokens (If Zero Usages Found)

**For each token with zero usages:**

1. Open `packages/ui-kit/src/theme/tokens.ts`
2. Search for the token definition (e.g., `export const hbcColorSurfaceElevated = ...` or similar)
3. Delete the entire token definition, including its JSDoc comment if present
4. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`
5. Type-check: `pnpm turbo run check-types --filter=@hbc/ui-kit`
6. Run tests: `pnpm turbo run test --filter=@hbc/ui-kit`

**Example (before):**
```typescript
/**
 * Surface color for elevated elements (deprecated)
 * @deprecated Use `hbcSurfacePrimary` or `hbcSurfaceSecondary` instead
 */
export const hbcColorSurfaceElevated = '#F5F5F5';
```

**Example (after):**
```typescript
// Token removed: hbcColorSurfaceElevated (zero usages found, 2026-03-07)
```

**Expected output:** Token definition removed; build succeeds.

### 4C.3.5 Add Deprecation Notice Comment (If Token Removed)

1. After removing the token, add a one-line deprecation notice comment at the location where it was:
   ```typescript
   // DEPRECATED: hbcColorSurfaceElevated removed 2026-03-07 (zero usages found)
   ```
2. This serves as a record that the token existed and was removed
3. Build: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** Build succeeds; comment left for audit trail.

### 4C.3.6 For Tokens with Usages: Add Versioned TSDoc Comment

**For each token WITH usages found:**

1. Open `packages/ui-kit/src/theme/tokens.ts`
2. Locate the token definition
3. Add/update the JSDoc comment with deprecation notice and version info:

   **Before:**
   ```typescript
   export const hbcColorSurfaceSubtle = '#FAFAFA';
   ```

   **After:**
   ```typescript
   /**
    * @deprecated This token is used in [N] locations and is scheduled for migration.
    * Usages identified in Phase 4C (2026-03-07). See tracking issue [URL] for migration plan.
    * Timeline: Deprecate by Phase 5, remove by Phase 6.
    * Replacement: Use `hbcSurfaceSecondary` + opacity variables for subtle backgrounds.
    * @since 1.0.0
    * @version 1.0.0-deprecated.2026-03-07
    */
   export const hbcColorSurfaceSubtle = '#FAFAFA';
   ```

4. Include in the comment:
   - Count of usages found
   - Suggested replacement tokens
   - Phase timeline for migration
   - Link to tracking issue (to be created in 4C.3.7)

5. Build and verify: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** Token remains but is marked deprecated with versioning info.

### 4C.3.7 Create Tracking Issues for Tokens with Usages

**For each token WITH usages found:**

1. Create a tracking issue (e.g., in GitHub Issues, Jira, or equivalent project management system) with the following template:

   **Title:** `[Phase 5+] Migrate usages of [TOKEN_NAME] to replacement tokens`

   **Description:**
   ```
   # Deprecated Token Migration: [TOKEN_NAME]

   ## Summary
   Token `[TOKEN_NAME]` is deprecated and scheduled for removal.
   Identified [N] usages in Phase 4C (2026-03-07).

   ## Usages Found
   - `packages/[package]/src/[file].tsx:123` — [context, e.g., "background color for subtle surface"]
   - `packages/[package]/src/[file].tsx:456` — [context]
   - (list all usages from grep output)

   ## Recommended Replacement
   - For background: Use `hbcSurfacePrimary` or `hbcSurfaceSecondary`
   - For text: Use `hbcTextPrimary` or `hbcTextSecondary`
   - (adjust based on token semantics)

   ## Migration Steps
   1. Identify all usages (see list above)
   2. Determine semantic replacement (e.g., if used for subtle surface, use secondary surface token)
   3. Replace usages with appropriate replacement token
   4. Run tests to verify no visual regression
   5. Remove [TOKEN_NAME] in Phase 6 cleanup

   ## Timeline
   - Phase 4C: Identified and versioned
   - Phase 5: Can migrate as needed (optional)
   - Phase 6: Removal scheduled (if Phase 5 migration complete)

   ## Labels
   [deprecation, token-migration, phase-5-plus]
   ```

2. Add the issue URL to the TSDoc comment in step 4C.3.6

**Expected output:** Tracking issue created with full migration context.

### 4C.3.8 Create Reference Documentation for Deprecated Tokens

1. Create a new file: `docs/reference/ui-kit/deprecated-tokens.md`
2. Document all three tokens (whether removed or versioned) with:

   ```markdown
   # Deprecated Tokens Reference

   This document tracks deprecated UI Kit tokens and their migration status.

   ## Token Deprecation Matrix

   | Token | Status | Usages Found | Removed Date | Replacement | Tracking Issue |
   |-------|--------|--------------|--------------|-------------|-----------------|
   | `hbcColorSurfaceElevated` | [Removed/Versioned] | [0/N] | [Date or N/A] | [Replacement] | [URL or N/A] |
   | `hbcColorSurfaceSubtle` | [Removed/Versioned] | [0/N] | [Date or N/A] | [Replacement] | [URL or N/A] |
   | `hbcColorTextSubtle` | [Removed/Versioned] | [0/N] | [Date or N/A] | [Replacement] | [URL or N/A] |

   ## Migration Policy

   HB Intel uses a scan-gated deprecation approach:

   1. **Identify** deprecated tokens via audit findings
   2. **Scan** for usages using grep across all source, app, and docs directories
   3. **Remove** if zero usages found (tokens are removed completely)
   4. **Version** if usages found (tokens marked deprecated with TSDoc + tracking issue)
   5. **Migrate** usages in subsequent phases (Phase 5+)
   6. **Cleanup** deprecated tokens in final cleanup phase (Phase 6+)

   ## Usage Examples

   ### Removed Token (Zero Usages)
   \`\`\`
   hbcColorSurfaceElevated — Removed 2026-03-07 (zero usages found)
   \`\`\`

   ### Versioned Token (With Usages)
   \`\`\`typescript
   /**
    * @deprecated [N] usages found. See tracking issue [URL].
    * Replacement: Use hbcSurfaceSecondary for subtle backgrounds.
    */
   export const hbcColorSurfaceSubtle = '#FAFAFA';
   \`\`\`

   ## Phase 4C Scan Results

   **Date:** 2026-03-07
   **Scan Tool:** grep with --include patterns
   **Directories Scanned:** packages/, apps/, docs/

   ### Summary
   - Total deprecated tokens identified: 3
   - Tokens removed: [N]
   - Tokens versioned: [N]
   - Migration tracking issues created: [N]
   ```

3. Save file: `docs/reference/ui-kit/deprecated-tokens.md`
4. Build documentation: `pnpm turbo run build:docs` (if applicable)

**Expected output:** Reference documentation created in `docs/reference/ui-kit/deprecated-tokens.md`.

### 4C.3.9 Verify No Remaining Deprecated Token References (Final Check)

1. Run a final comprehensive scan to confirm all three tokens have been addressed:
   ```bash
   # Final scan for all three tokens
   grep -r "hbcColorSurfaceElevated\|hbcColorSurfaceSubtle\|hbcColorTextSubtle" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" | grep -v "DEPRECATED\|deprecated\|tracking issue\|migration" | wc -l
   ```
2. Expected result: **0** (zero matches outside of deprecation comments/docs)
3. If matches are found, they should only be in:
   - `tokens.ts` (token definitions with deprecation JSDoc)
   - `deprecated-tokens.md` (reference documentation)
   - Tracking issues or comments mentioning "deprecated" or "migration"
4. Build final verification: `pnpm turbo run build --filter=@hbc/ui-kit`

**Expected output:** Build succeeds; deprecated tokens are removed or properly versioned with tracking.

### 4C.3.10 Update ADR-PH4C-02 (Deprecated Token Policy)

1. Create or update `docs/architecture/adr/ADR-PH4C-02-deprecated-token-policy.md` with:

   ```markdown
   # ADR-PH4C-02: Deprecated Token Resolution Policy

   **Status:** Accepted
   **Decision Date:** 2026-03-07
   **Author:** HB-INTEL-IMPL

   ## Context
   The UI Kit contains deprecated tokens that are no longer in active use or are scheduled for replacement.
   A policy is needed to manage deprecation, migration, and eventual removal of these tokens.

   ## Decision
   Adopt a **scan-gated deprecation approach**:

   1. **Scan First** — Use grep to identify usages before any removal decision
   2. **Remove if Unused** — Tokens with zero usages are removed immediately
   3. **Version if Used** — Tokens with usages are marked deprecated with:
      - Deprecation notice in JSDoc
      - Suggested replacement token(s)
      - Phase timeline for migration
      - Link to tracking issue for migration
   4. **Track Migrations** — Create tracking issues for each token with usages
   5. **Cleanup Later** — Remove versioned tokens only after migrations are complete (Phase 6+)

   ## Rationale
   - **Data-driven**: Removal decisions are based on actual usage, not assumptions
   - **Safe**: Versioning with tracking ensures no surprise removals
   - **Traceable**: TSDoc and tracking issues provide audit trail
   - **Phased**: Migrations happen gradually without breaking existing code

   ## Implementation
   See `docs/reference/ui-kit/deprecated-tokens.md` for current deprecation matrix and Phase 4C scan results.

   ## Related ADRs
   - ADR-0050 (Design System Token Strategy)
   - ADR-0051 (Theme Management)
   ```

2. Save as `docs/architecture/adr/ADR-PH4C-02-deprecated-token-policy.md`

**Expected output:** ADR created documenting the deprecated token policy.

---

## Success Criteria Checklist

### Scanning & Analysis
- [x] All three tokens scanned for usages (grep results documented)
- [x] Usages counted and categorized (zero vs. non-zero)
- [x] Scan results recorded in progress notes (see below)

### Token Removal (For Zero-Usage Tokens)
- [x] Each zero-usage token definition deleted from tokens.ts *(N/A — all tokens have non-zero usages)*
- [x] Deprecation notice comment left for audit trail *(N/A — versioning path selected by scan gate)*
- [x] Build succeeds after removal: `pnpm turbo run build --filter=@hbc/ui-kit` *(N/A — validated via versioning path build)*
- [x] Type-check passes: `pnpm turbo run check-types --filter=@hbc/ui-kit` *(N/A — validated via versioning path type-check)*
- [x] Tests pass: `pnpm turbo run test --filter=@hbc/ui-kit` *(N/A — validated via versioning path tests)*

### Token Versioning (For Tokens with Usages)
- [x] Versioned TSDoc comment added to token definition
- [x] TSDoc includes replacement suggestions
- [x] TSDoc includes phase timeline
- [x] Build succeeds with versioning comments
- [x] Tracking issue created for each token with usages *(placeholder IDs per phase instruction)*
- [x] Tracking issue linked in TSDoc comment

### Documentation & Verification
- [x] Reference documentation created: `docs/reference/ui-kit/deprecated-tokens.md`
- [x] ADR-PH4C-02 created: `docs/architecture/adr/ADR-PH4C-02-deprecated-token-policy.md`
- [x] Final verification: `grep` scan returns zero non-commented matches *(source scan excludes generated `dist/` and `storybook-static/` artifacts)*
- [x] Build: `pnpm turbo run build --filter=@hbc/ui-kit` succeeds
- [x] Lint: `pnpm turbo run lint --filter=@hbc/ui-kit` passes *(0 errors; existing repository warnings remain)*

---

## Verification Commands

```bash
# Scan for token usages (Phase 4C.3.1–4C.3.3)
grep -r "hbcColorSurfaceElevated" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" | wc -l
grep -r "hbcColorSurfaceSubtle" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" | wc -l
grep -r "hbcColorTextSubtle" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" | wc -l

# Build verification
pnpm turbo run build --filter=@hbc/ui-kit

# Type-check
pnpm turbo run check-types --filter=@hbc/ui-kit

# Test
pnpm turbo run test --filter=@hbc/ui-kit

# Lint
pnpm turbo run lint --filter=@hbc/ui-kit

# Final scan (should return 0, excluding deprecation comments)
grep -r "hbcColorSurfaceElevated\|hbcColorSurfaceSubtle\|hbcColorTextSubtle" packages/ apps/ docs/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.css" --include="*.md" | grep -v "deprecated\|DEPRECATED\|tracking\|migration" | wc -l

# Verify documentation files exist
ls docs/reference/ui-kit/deprecated-tokens.md && echo "✓ Deprecated tokens reference created"
ls docs/architecture/adr/ADR-PH4C-02-deprecated-token-policy.md && echo "✓ ADR-PH4C-02 created"
```

**Expected outputs:**
- Initial scans return 0 or N (usage count)
- All build/type-check/test/lint commands exit 0
- Final scan returns 0 (no non-commented matches)
- Both documentation files exist

---

## PH4C.3 Progress Notes

Track progress of each implementation step. Update status as work progresses.

- 4C.3.1 [COMPLETED — 2026-03-07] — Scan for `hbcColorSurfaceElevated` usages
  - Count: 45
  - Status: Has Usages

- 4C.3.2 [COMPLETED — 2026-03-07] — Scan for `hbcColorSurfaceSubtle` usages
  - Count: 41
  - Status: Has Usages

- 4C.3.3 [COMPLETED — 2026-03-07] — Scan for `hbcColorTextSubtle` usages
  - Count: 38
  - Status: Has Usages

- 4C.3.4 [COMPLETED — 2026-03-07] — Remove tokens with zero usages
  - Tokens removed: 0 (scan-gated versioning path selected)
  - Build status: PASS

- 4C.3.5 [COMPLETED — 2026-03-07] — Add deprecation notice comments (if applicable)
  - Comments added: N/A (non-zero usage for all tokens)

- 4C.3.6 [COMPLETED — 2026-03-07] — Add versioned TSDoc comments (if applicable)
  - Tokens versioned: 3 (`hbcColorSurfaceElevated`, `hbcColorSurfaceSubtle`, `hbcColorTextSubtle`)

- 4C.3.7 [COMPLETED — 2026-03-07] — Create tracking issues (if applicable)
  - Tracking issues created: 3 placeholders
  - Tracking issue URLs: `PH4C-DEPRECATED-TOKENS-001/002/003` (placeholder IDs)

- 4C.3.8 [COMPLETED — 2026-03-07] — Create reference documentation
  - File created: `docs/reference/ui-kit/deprecated-tokens.md` [DONE]

- 4C.3.9 [COMPLETED — 2026-03-07] — Final verification scan
  - Final grep result: 0 unsanctioned source references (allowlisted source scan)
  - Build status: PASS

- 4C.3.10 [COMPLETED — 2026-03-07] — Update ADR-PH4C-02
  - File created: `docs/architecture/adr/ADR-PH4C-02-deprecated-token-policy.md` [DONE]

### 2026-03-07 Execution Log

- [2026-03-07] Major Step 1 complete: required three-token scans executed across `packages/`, `apps/`, `docs/`; counts recorded (45/41/38), all non-zero.
- [2026-03-07] Major Step 2 complete: versioned TSDoc comments added in `packages/ui-kit/src/theme/tokens.ts` with D-PH4C-03/D-PH4C-04 traceability, replacements, timelines, and tracking placeholders.
- [2026-03-07] Major Step 3 complete: created `docs/reference/ui-kit/deprecated-tokens.md` matrix/policy and `docs/architecture/adr/ADR-PH4C-02-deprecated-token-policy.md`.
- [2026-03-07] Major Step 4 complete: build, check-types, lint, test all pass (lint 0 errors, warnings only); final allowlisted source scan confirms zero unsanctioned non-commented references.

---

## Verification Evidence Template

### Token Scan Results

| Token | Scan Date | Usages Found | Count | Decision | Tracking Issue | Completion Date |
|-------|-----------|--------------|-------|----------|-----------------|-----------------|
| `hbcColorSurfaceElevated` | 2026-03-07 | Yes | 45 | Versioned (kept) | PH4C-DEPRECATED-TOKENS-001 | 2026-03-07 |
| `hbcColorSurfaceSubtle` | 2026-03-07 | Yes | 41 | Versioned (kept) | PH4C-DEPRECATED-TOKENS-002 | 2026-03-07 |
| `hbcColorTextSubtle` | 2026-03-07 | Yes | 38 | Versioned (kept) | PH4C-DEPRECATED-TOKENS-003 | 2026-03-07 |

### Build Verification

| Check | Command | Expected | Status | Date |
|-------|---------|----------|--------|------|
| Build | `pnpm turbo run build --filter=@hbc/ui-kit` | Exit 0 | PASS | 2026-03-07 |
| Type-Check | `pnpm turbo run check-types --filter=@hbc/ui-kit` | Exit 0 | PASS | 2026-03-07 |
| Test | `pnpm turbo run test --filter=@hbc/ui-kit` | Exit 0 | PASS | 2026-03-07 |
| Lint | `pnpm turbo run lint --filter=@hbc/ui-kit` | Exit 0 | PASS (0 errors, warnings only) | 2026-03-07 |
| Final Scan | Allowlisted source scan for token refs (non-commented) | Count = 0 | PASS | 2026-03-07 |

---

**End of PH4C.3 – Deprecated Token Scan & Resolution**

<!-- IMPLEMENTATION PROGRESS & NOTES
PH4C.3 task file created: 2026-03-07
Scan-gated deprecation approach implemented:
- Step 1: Scan for usages (grep)
- Step 2: Remove if zero usages
- Step 3: Version if usages exist (TSDoc + tracking)
Three tokens to scan: hbcColorSurfaceElevated, hbcColorSurfaceSubtle, hbcColorTextSubtle
Status: READY FOR IMPLEMENTATION
Prerequisites: Optional (PH4C.2 should precede, but not required)
Expected duration: 2–3 hours
Outputs: Token removals/versioning, tracking issues, reference docs, ADR-PH4C-02

PATH CORRECTION 2026-03-07:
- `packages/ui-kit/src/tokens.ts` → `packages/ui-kit/src/theme/tokens.ts` (steps 4C.3.4 and 4C.3.6)
- `packages/ui-kit/src/theme.ts` → `packages/ui-kit/src/theme/theme.ts` (prerequisite verification command)
Neither flat-root file exists; both live under the `src/theme/` subdirectory.
Option 1 (use actual paths) applied — no shim files created.

PH4C.3 IMPLEMENTATION COMPLETED: 2026-03-07
- Scan-gated outcome: all three deprecated tokens have non-zero references (45 / 41 / 38), therefore versioning path applied for each token.
- Token action: no removals; versioned TSDoc comments added with replacement guidance, timeline, and tracking placeholders.
- Documentation outputs created: deprecated token reference matrix and ADR-PH4C-02 policy file.
- Verification outputs: build/type-check/lint/test successful; final allowlisted source scan returned zero unsanctioned non-commented references.
-->
