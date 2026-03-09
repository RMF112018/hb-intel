# PH7.7 — SharePoint Docs Boundary Cleanup & Config Hardening

**Version:** 1.0  
**Purpose:** Remove package-boundary leaks and configuration fragility from `@hbc/sharepoint-docs`, beginning with upload orchestration and folder-resolution seams.  
**Audience:** Implementation agent(s), architecture owner, maintainers, and reviewers.  
**Implementation Objective:** Tighten public service contracts, eliminate direct internal-member access, validate config explicitly, and make `@hbc/sharepoint-docs` safe to scale as a Tier-1 platform primitive.

---

## Prerequisites

- PH7.1 and PH7.4 complete.
- Review the sharepoint-docs master plan, `UploadService.ts`, `FolderManager.ts`, API/service boundaries, README, and relevant tests.

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

## 7.7.2 — Define Explicit Folder Policy Contract

- Replace internal reach-in with a public contract that exposes the upload target information `UploadService` actually needs.

## 7.7.3 — Validate Configuration at Construction Time

- Replace weak fallbacks with explicit validation, fast failure, and clear typed errors where possible.

## 7.7.4 — Clarify Service Boundaries

- Document and, if needed, refactor the boundary between SharePointDocsApi, FolderManager, RegistryClient, UploadService, and offline/migration services so peers do not depend on internals.

## 7.7.5 — Add Boundary-Focused Tests

- Cover validated construction/config failures, path resolution via the public contract, no internal-member access, and upload behavior under invalid config.

## 7.7.6 — Update Docs and Shared-Feature Plan

- Update package docs and `SF01-Sharepoint-Docs.md` to describe hardened contracts and validated config requirements.

---

## Deliverables

- boundary audit
- tightened public service contracts
- config validation helpers
- updated tests and docs

---

## Acceptance Criteria Checklist

- [ ] No bracket/internal-member access remains in Tier-1 package code paths.
- [ ] Upload/folder resolution uses an explicit public contract.
- [ ] Required config is validated explicitly.
- [ ] Invalid config fails fast with clear behavior.
- [ ] Service boundaries are documented and clearer than before.
- [ ] Boundary-focused tests cover the new contract.

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
- tightened public service contracts
- config validation helpers
- updated tests and docs

Verification:
- build: PASS/FAIL
- lint: PASS/FAIL
- check-types: PASS/FAIL
- test / validation: PASS/FAIL

Notes:
- unresolved items:
- deferred items with rationale:
-->
```
