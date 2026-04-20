# PH7.7 — SharePoint Docs Boundary Cleanup & Config Hardening

**Version:** 1.1 *(Amended 2026-03-09 — see audit trail)*
**Purpose:** Remove package-boundary leaks and configuration fragility from `@hbc/sharepoint-docs`, beginning with upload orchestration and folder-resolution seams.
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.
**Implementation Objective:** Tighten public service contracts, eliminate direct internal-member access, validate config explicitly, and make `@hbc/sharepoint-docs` safe to scale as a Tier-1 platform primitive.

---

## Prerequisites

- PH7.1 and PH7.4 complete.
- Review the sharepoint-docs master plan, `UploadService.ts`, `FolderManager.ts`, API/service boundaries, README, and relevant tests.

<!-- AMENDMENT A (2026-03-09) — ADR numbering conflict + plan correction requirement
Before executing §7.7.6:

  SF01-T10-Deployment.md (the remaining un-executed task for @hbc/sharepoint-docs) and
  SF01-Sharepoint-Docs.md (§12 ADR Requirement) both reference:

      docs/architecture/adr/0010-sharepoint-docs-pre-provisioning-storage.md

  That number is OCCUPIED:
      ADR-0010-ci-cd-pipeline.md  (Accepted, 2026-03-03, Phase 8 — CI/CD Pipeline)

  The correct next sequential ADR number is ADR-0082 (after ADR-0081-complexity-dial,
  created PH7.4R). All references in SF01-T10 and SF01-Sharepoint-Docs.md must be
  corrected to ADR-0082-sharepoint-docs-pre-provisioning-storage.md before
  SF01-T10 is executed. See Amendment E (§7.7.6) for exact locations and
  replacement text.
-->

---

## Source Inputs

- `packages/sharepoint-docs/src/services/UploadService.ts`
- `packages/sharepoint-docs/src/api/*`
- `packages/sharepoint-docs/src/services/*`
- package entrypoints and README
- related test suites
- `SF01-Sharepoint-Docs.md`

---

## 7.7.1 — Inventory Current Boundary Leaks

- Document all encapsulation leaks and config fragility, including the confirmed bracket/internal-member access pattern and any silent env/config assumptions.

<!-- AMENDMENT B (2026-03-09) — Name all confirmed leaks with file/line refs
Validation confirmed four distinct boundary leaks. The implementation agent must
address all four; the plan must not be closed until each is resolved.

  LEAK 1 — Bracket/internal-member access (encapsulation breach)
    File:  packages/sharepoint-docs/src/services/UploadService.ts
    Line:  103
    Code:  const parentPath = this.folderManager['getParentPath'](contextConfig.contextType);
    Root:  FolderManager.getParentPath() is declared `private` (FolderManager.ts:130).
           UploadService bypasses TypeScript access control via bracket notation to reach it.
    Risk:  FolderManager can change its private surface without type-error warning in UploadService.
           Test suite MASKS this — all 7 upload test mocks expose getParentPath as a public method
           (see Amendment D, §7.7.5 for mock correction requirement).
    Fix:   Expose a typed public result from FolderManager.resolveOrCreate() — specifically, add
           `relativeFolderPath: string` to IResolvedDocumentContext (IDocumentContext.ts). The
           already-computed `fullFolderPath` (FolderManager.ts:44) should be returned as part
           of the public contract. UploadService then reads resolvedContext.relativeFolderPath.

  LEAK 2 — Silent empty-string env fallbacks (config fragility)
    Three independent instances — each returns '' when the env var is unset, producing
    an opaque Graph API error deep in the call chain rather than a fast-fail at startup.

      Location A:  packages/sharepoint-docs/src/services/UploadService.ts:188
                   private getHbIntelSiteUrl(): string {
                     return process.env.VITE_HBINTEL_SITE_URL ?? '';
                   }

      Location B:  packages/sharepoint-docs/src/api/FolderManager.ts:183
                   private getHbIntelSiteUrl(): string {
                     return process.env.VITE_HBINTEL_SITE_URL ?? '';
                   }

      Location C:  packages/sharepoint-docs/src/services/MigrationService.ts:186
                   private getHbIntelSiteUrl(): string {
                     return process.env.VITE_HBINTEL_SITE_URL ?? '';
                   }

    Fix:   Constructor-inject `hbIntelSiteUrl: string` into all three classes (see Amendment C,
           §7.7.3). Validate the value is non-empty at the SharePointDocsProvider level before
           wiring. Eliminates all three private methods and the env read duplication.

  LEAK 3 — Duplicated path assembly
    FolderManager.resolveOrCreate() already computes `fullFolderPath` internally (line 44):
        const fullFolderPath = `${parentPath}/${folderName}`;
    UploadService re-derives the same path via LEAK 1 (bracket access to getParentPath)
    plus a manual concatenation using the folder name from IResolvedDocumentContext.
    Root:  IResolvedDocumentContext exposes `folderUrl` (absolute) and `folderName` (segment)
           but NOT `relativeFolderPath` (the SP-relative path needed by UploadService).
    Fix:   Resolved by the same IResolvedDocumentContext extension that fixes LEAK 1.

  LEAK 4 — MigrationService destination placeholder
    File:  packages/sharepoint-docs/src/services/MigrationService.ts
    Lines: 179–183
    Code:  private getDefaultDestinationPath(sourceContextId: string): string {
             // Convention: BD leads go to BD Heritage/, Estimating pursuits go to Estimating/
             // The sourceContextType is known from the registry; this is a simplified example.
             return 'Shared Documents/Project Documents';
           }
    Note:  Inline comment acknowledges "this is a simplified example". This placeholder
           returns a single hardcoded path regardless of context type, meaning BD lead
           and estimating pursuit documents would both migrate to 'Shared Documents/Project
           Documents' instead of their correct type-specific destinations.
    Fix:   Resolve in §7.7.4 boundary clarification. The destination path must be driven by
           the document's contextType from the registry, not a hardcoded fallback. At minimum,
           this method must throw NotImplementedError until the correct routing is wired.
-->

## 7.7.2 — Define Explicit Folder Policy Contract

- Replace internal reach-in with a public contract that exposes the upload target information `UploadService` actually needs.

## 7.7.3 — Validate Configuration at Construction Time

- Replace weak fallbacks with explicit validation, fast failure, and clear typed errors where possible.

<!-- AMENDMENT C (2026-03-09) — Constructor injection strategy + validation point
Implementation approach for config hardening:

  STEP 1 — Extend constructor signatures
    Three classes currently read VITE_HBINTEL_SITE_URL via private methods (see Amendment B,
    LEAK 2). Each must accept `hbIntelSiteUrl: string` as a constructor parameter instead:

      UploadService(api, folderManager, registry, hbIntelSiteUrl: string)
      FolderManager(api, hbIntelSiteUrl: string)
      MigrationService(api, registry, migrationLog, tombstoneWriter, conflictDetector,
                       conflictResolver, hbIntelSiteUrl: string)

    All three `private getHbIntelSiteUrl()` methods are then deleted.

  STEP 2 — Validate at SharePointDocsProvider (single validation point)
    File:  packages/sharepoint-docs/src/hooks/internal/useSharePointDocsServices.ts
    This provider is the composition root where all services are instantiated and wired.
    It is the correct and ONLY place to read VITE_HBINTEL_SITE_URL and validate it.

    Validation contract:
      const hbIntelSiteUrl = import.meta.env.VITE_HBINTEL_SITE_URL;
      if (!hbIntelSiteUrl) {
        throw new Error('[sharepoint-docs] VITE_HBINTEL_SITE_URL is required but not set.');
      }

    The validated value is then passed to the three constructors above. If the env var is
    missing, the provider throws at mount time (fast-fail), not deep in an API call chain.

  STEP 3 — Test harness
    Unit tests that construct these services directly must pass a literal string (e.g.
    'https://contoso.sharepoint.com/sites/hb-intel') as the new constructor argument.
    No env reads in test code; no `process.env` stubs required.
-->

## 7.7.4 — Clarify Service Boundaries

- Document and, if needed, refactor the boundary between SharePointDocsApi, FolderManager, RegistryClient, UploadService, and offline/migration services so peers do not depend on internals.

## 7.7.5 — Add Boundary-Focused Tests

- Cover validated construction/config failures, path resolution via the public contract, no internal-member access, and upload behavior under invalid config.

<!-- AMENDMENT D (2026-03-09) — Existing test mock normalization requirement
Current test state (confirmed in validation):

  File:  packages/sharepoint-docs/src/__tests__/services/UploadService.test.ts
  All 7 upload tests that exercise UploadService.upload() mock the FolderManager with
  `getParentPath` exposed as a PUBLIC method:

    Line  62:  mockFolderMgr = { resolveOrCreate: vi.fn()..., getParentPath: vi.fn()... }
    Line  88:  mockFolderMgr = { resolveOrCreate: vi.fn()..., getParentPath: vi.fn()... }
    Line 115:  mockFolderMgr = { resolveOrCreate: vi.fn()..., getParentPath: vi.fn()... }
    Line 184:  mockFolderMgr = { resolveOrCreate: vi.fn()..., getParentPath: vi.fn()... }
    Line 207:  mockFolderMgr = { resolveOrCreate: vi.fn()..., getParentPath: vi.fn()... }
    Line 233:  mockFolderMgr = { resolveOrCreate: vi.fn()..., getParentPath: vi.fn()... }
    (Line 62 also appears in the small-file routing test at line 57.)

  This means the tests currently PASS despite the encapsulation violation in
  UploadService.ts:103. The mock normalizes the breach rather than detecting it.

Post-fix test requirements:
  1. Once IResolvedDocumentContext gains `relativeFolderPath: string` and UploadService
     reads it (eliminating the bracket access), all 7 mockFolderMgr objects must be
     updated: remove `getParentPath` from the mock shape; include `relativeFolderPath`
     in the `resolveOrCreate` return value instead.

  2. NEW tests to add (not currently covered):
     a. UploadService constructed with empty hbIntelSiteUrl throws at construction
        (post Amendment C).
     b. FolderManager constructed with empty hbIntelSiteUrl throws at construction.
     c. MigrationService.execute() with a missing destination path produces a clear
        error (not a hardcoded fallback).
     d. UploadService resolves path entirely from resolvedContext.relativeFolderPath
        (no private methods reached).

  3. Existing coverage metrics to maintain:
     100% statements/functions/lines, ≥96% branches (current baseline from PH7.7 validation).
-->

## 7.7.6 — Update Docs and Shared-Feature Plan

- Update package docs and `SF01-Sharepoint-Docs.md` to describe hardened contracts and validated config requirements.

<!-- AMENDMENT E (2026-03-09) — ADR-0082 correction scope: exact locations in SF01-T10 and SF01
The following two files both reference the wrong ADR number for the sharepoint-docs
architecture decision record. All references must be corrected to ADR-0082 before
SF01-T10 is executed.

CORRECT NUMBER: ADR-0082-sharepoint-docs-pre-provisioning-storage.md
OCCUPIED NUMBER: ADR-0010 is ADR-0010-ci-cd-pipeline.md (Accepted 2026-03-03, Phase 8)

────────────────────────────────────────────────────────────────────────────────
FILE 1: docs/architecture/plans/shared-features/SF01-T10-Deployment.md
────────────────────────────────────────────────────────────────────────────────

  Location 1 — 3-Line Plan section (≈ top of file)
    WRONG:   0010-sharepoint-docs-pre-provisioning-storage.md
    CORRECT: 0082-sharepoint-docs-pre-provisioning-storage.md

  Location 2 — Pre-Deployment Checklist, Documentation sub-section
    WRONG:   ADR-0010-sharepoint-docs-pre-provisioning-storage.md
    CORRECT: ADR-0082-sharepoint-docs-pre-provisioning-storage.md

  Location 3 — §7 ADR Creation section heading / file target
    WRONG:   docs/architecture/adr/0010-sharepoint-docs-pre-provisioning-storage.md
    CORRECT: docs/architecture/adr/ADR-0082-sharepoint-docs-pre-provisioning-storage.md

  Location 4 — ADR content block (the authored ADR text embedded in the task file)
    Heading: WRONG: # ADR-0010: SharePoint Docs ...
             CORRECT: # ADR-0082: SharePoint Docs ...
    Body:    Any inline reference to ADR-0010 within this block must also become ADR-0082.

  Location 5 — Blueprint Progress Comment block at bottom of file
    WRONG:   ADR created: docs/architecture/adr/0010-sharepoint-docs-...
    CORRECT: ADR created: docs/architecture/adr/ADR-0082-sharepoint-docs-...

────────────────────────────────────────────────────────────────────────────────
FILE 2: docs/architecture/plans/shared-features/SF01-Sharepoint-Docs.md
────────────────────────────────────────────────────────────────────────────────

  Location 6 — §12 ADR Requirement
    WRONG:   docs/architecture/adr/0010-sharepoint-docs-pre-provisioning-storage.md
    CORRECT: docs/architecture/adr/ADR-0082-sharepoint-docs-pre-provisioning-storage.md

  Location 7 — Progress notes / audit trail (if already populated with ADR-0010 reference)
    WRONG:   ADR-0010 or 0010-sharepoint-docs-...
    CORRECT: ADR-0082 or ADR-0082-sharepoint-docs-...

Total corrections: 7 locations across 2 files.

Post-correction verification:
  grep -r "0010-sharepoint-docs" docs/architecture/plans/shared-features/
  → should return zero results.

  grep -r "ADR-0082" docs/architecture/plans/shared-features/
  → should return results in both SF01-Sharepoint-Docs.md and SF01-T10-Deployment.md.
-->

---

## Deliverables

- Boundary audit document (all 4 leaks named, root-caused, and fix strategy confirmed)
- `IResolvedDocumentContext` extended with `relativeFolderPath: string`
- `UploadService`, `FolderManager`, `MigrationService` constructors accept `hbIntelSiteUrl: string`; all three `private getHbIntelSiteUrl()` methods deleted
- `SharePointDocsProvider` (useSharePointDocsServices.ts) validates `VITE_HBINTEL_SITE_URL` at mount time and passes it to service constructors
- Bracket access at `UploadService.ts:103` replaced with `resolvedContext.relativeFolderPath`
- `MigrationService.getDefaultDestinationPath()` either implemented correctly or replaced with `NotImplementedError` pending routing design
- All 7 existing upload test mocks updated (remove `getParentPath`, add `relativeFolderPath` to `resolveOrCreate` return value)
- New boundary-focused tests: empty config fast-fail, path-from-public-contract, no-private-access
- `SF01-Sharepoint-Docs.md` and `SF01-T10-Deployment.md` corrected: 7 ADR-0010 references → ADR-0082

---

## Acceptance Criteria Checklist

- [x] No bracket/internal-member access remains in Tier-1 package code paths.
- [x] Upload/folder resolution uses an explicit public contract (`relativeFolderPath` on `IResolvedDocumentContext`).
- [x] Required config (`hbIntelSiteUrl`) is validated explicitly at `SharePointDocsProvider` — not inside service private methods.
- [x] Invalid config (empty `hbIntelSiteUrl`) fails fast at provider mount with a clear error message.
- [x] All three `private getHbIntelSiteUrl()` methods are deleted from `UploadService`, `FolderManager`, and `MigrationService`.
- [x] Service boundaries are documented and clearer than before.
- [x] All 7 existing upload test mocks updated to remove `getParentPath` from mock shape.
- [x] New boundary-focused tests cover empty-config fast-fail and path-via-public-contract.
- [x] All 7 ADR-0010 references in SF01-T10 and SF01-Sharepoint-Docs.md corrected to ADR-0082.
- [x] `grep -r "0010-sharepoint-docs" docs/architecture/plans/shared-features/` returns zero results.

---

## Verification Evidence

- `pnpm turbo run build --filter=@hbc/sharepoint-docs`
- `pnpm turbo run lint --filter=@hbc/sharepoint-docs`
- `pnpm turbo run check-types --filter=@hbc/sharepoint-docs`
- `pnpm turbo run test --filter=@hbc/sharepoint-docs`

---

## Progress Notes Template

```markdown
<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.7 started: YYYY-MM-DD
PH7.7 completed: YYYY-MM-DD

Artifacts:
- boundary audit
- IResolvedDocumentContext extended with relativeFolderPath
- hbIntelSiteUrl constructor injection (UploadService, FolderManager, MigrationService)
- SharePointDocsProvider fast-fail validation
- bracket access at UploadService:103 eliminated
- getDefaultDestinationPath() resolved (implemented or NotImplementedError)
- 7 existing upload test mocks updated
- new boundary-focused tests added
- SF01 + SF01-T10 ADR-0082 correction (7 locations)

Verification:
- build: PASS/FAIL
- lint: PASS/FAIL
- check-types: PASS/FAIL
- test / validation: PASS/FAIL

Notes:
- ADR-0082-sharepoint-docs-pre-provisioning-storage.md created: YES/NO
- getDefaultDestinationPath() status (implemented vs NotImplementedError):
- unresolved items:
- deferred items with rationale:
-->
```

---

<!-- IMPLEMENTATION PROGRESS & NOTES
PH7.7 plan amendments applied: 2026-03-09

Amendment A — Prerequisites: ADR-0010 occupied by ci-cd-pipeline; ADR-0082 is correct
              sequential for sharepoint-docs; SF01-T10 + SF01 master plan must be corrected
              before execution. Documented in Prerequisites comment block.

Amendment B — §7.7.1: All 4 confirmed boundary leaks named with file/line references:
              LEAK 1 bracket access (UploadService.ts:103), LEAK 2 three silent ?? ''
              fallbacks (UploadService.ts:188, FolderManager.ts:183, MigrationService.ts:186),
              LEAK 3 duplicated path assembly, LEAK 4 MigrationService hardcoded
              destination placeholder.

Amendment C — §7.7.3: Constructor injection strategy defined; SharePointDocsProvider
              (useSharePointDocsServices.ts) identified as single validation point;
              three private getHbIntelSiteUrl() methods to be deleted.

Amendment D — §7.7.5: Test mock normalization requirement documented; all 7 upload test
              mock locations identified (lines 62, 88, 115, 184, 207, 233); four new
              boundary-focused tests specified.

Amendment E — §7.7.6: ADR-0082 correction scope documented; 7 exact locations across
              SF01-T10-Deployment.md (5 locations) and SF01-Sharepoint-Docs.md (2 locations)
              with WRONG/CORRECT replacement text. Grep verification commands included.

Deliverables and Acceptance Criteria expanded from 6 to 10 items to match amendment scope.
Progress Notes Template updated with ADR-0082 creation checkbox and getDefaultDestinationPath
resolution field.

PH7.7 implementation completed: 2026-03-09

Artifacts produced:
- IDocumentContext.ts — IResolvedDocumentContext.relativeFolderPath: string added
- FolderManager.ts — hbIntelSiteUrl constructor param (4th arg); getHbIntelSiteUrl() deleted;
    resolveOrCreate() returns relativeFolderPath in both registry-hit and new-folder branches
- UploadService.ts — hbIntelSiteUrl constructor param (4th arg); getHbIntelSiteUrl() deleted;
    bracket access eliminated; fullDestinationPath built from resolvedContext.relativeFolderPath
- MigrationService.ts — hbIntelSiteUrl constructor param (7th arg); getHbIntelSiteUrl() deleted;
    getDefaultDestinationPath() throws NotImplementedError (pending MigrationScheduler routing)
- useSharePointDocsServices.ts — assertHbIntelSiteUrl() fast-fail utility added;
    createSharePointDocsServices() factory added as single composition root
- UploadService.test.ts — all 7 upload mocks updated (getParentPath removed,
    relativeFolderPath in resolveOrCreate return); hbIntelSiteUrl in all new UploadService()
    calls; 4 new PH7.7 boundary tests in separate describe block
- FolderManager.test.ts — hbIntelSiteUrl in all new FolderManager() calls;
    3 new PH7.7 boundary tests appended to resolveOrCreate describe
- ADR-0082-sharepoint-docs-pre-provisioning-storage.md — created
- SF01-T10-Deployment.md — 4 ADR-0010 occurrences corrected to ADR-0082
- SF01-Sharepoint-Docs.md — 3 ADR-0010 occurrences corrected to ADR-0082
- ConflictResolver.ts — hbIntelSiteUrl default '' removed (consistent with other services)
- assertHbIntelSiteUrl.test.ts — 6 test cases covering empty/null/undefined/whitespace/valid
- MigrationService.test.ts — 'uses default destination path' test rewritten to expect thrown error

Acceptance criteria status (VERIFIED 2026-03-09):
  [x] No bracket access in Tier-1 code paths
  [x] relativeFolderPath on IResolvedDocumentContext (public contract)
  [x] hbIntelSiteUrl constructor-injected (all 3 services + ConflictResolver)
  [x] assertHbIntelSiteUrl() fast-fail at composition root
  [x] All 3 private getHbIntelSiteUrl() methods deleted
  [x] All 7 upload test mocks updated
  [x] 4 new UploadService boundary tests + 3 new FolderManager boundary tests
  [x] assertHbIntelSiteUrl test coverage added (6 tests)
  [x] ADR-0082 created
  [x] 0010-sharepoint-docs references cleared from SF01 plan files
  [x] Build/test verified — 71 tests pass (5 test files, 0 failures)

Verification (2026-03-09):
- build: PASS (tsc compiles cleanly — cyclic dep in ui-kit/complexity is pre-existing, unrelated)
- test: PASS (71 tests, 5 files, 0 failures)

Deferred / noted:
- getDefaultDestinationPath() routing: to be implemented in MigrationScheduler (D-02)
    when BD/Estimating destination path conventions are finalized
-->
