# Phase-01 Definition-of-Done Adoption

**Adopted:** 2026-04-13
**Source of authority:** `docs/architecture/plans/MASTER/spfx/publisher/phase-01/03-Implementation-Deliverables-and-Definition-of-Done.md`
**Scope:** governs closure criteria for every Wave/Prompt in Phase-01 of the Project Spotlight publisher SPFx app.

This artifact binds the Phase-01 DoD as the closure contract for all remaining waves, maps each DoD topic to its implementing wave, and converts the closure rule into a concrete hosted-proof checklist that must pass before Phase-01 is declared complete.

---

## 1. Mandatory delivery artifact ledger

| # | Artifact | Implementing wave | Current status |
|---|----------|-------------------|----------------|
| 1 | Repo-truth findings note | Wave 1 | ✅ `evidence/wave-01-repo-truth-and-impact-map.md` |
| 2 | Implementation tracker | Wave 1 (initialized) | ✅ `evidence/implementation-tracker.md` (maintained across waves) |
| 3 | List provisioning scripts / updates | Wave 2 | ⬜️ |
| 4 | Typed domain contracts | Wave 2 | ⬜️ |
| 5 | Service / repository layer | Wave 3 | ⬜️ |
| 6 | XML-shell page-generation logic | Wave 4 | ⬜️ |
| 7 | Content-mapping layer | Wave 5 | ⬜️ |
| 8 | Page-binding logic | Wave 5 | ⬜️ |
| 9 | Authoring UI | Wave 6 | ⬜️ |
| 10 | Validation + preview | Wave 7 | ⬜️ |
| 11 | Team Viewer integration closure | Wave 8 | ⏸ TeamViewer webpart landed (commits `3bb8dd10`-`35b0f38c`); publisher-side integration pending Waves 4-5 |
| 12 | Automated test evidence | Wave 9 | ⬜️ |
| 13 | Hosted verification checklist with results | Wave 9 | ⬜️ (stub in `04-Hosted-Verification-Checklist.md`) |
| 14 | Final build / package proof | Wave 9 | ⬜️ |

## 2. Definition-of-done by topic

### A. List architecture (Wave 2)
- [ ] All required lists exist or are fully provisionable via `packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1` (or an equivalent scripted path).
- [ ] Field definitions align 1:1 with architecture doc `03-Exact-Field-Definitions.md`.
- [ ] Parent/child relationships are durable (stable keys `ArticleId`, `TeamMemberId`, `MediaId`, `BindingId`) and typed in TypeScript contracts.

### B. Service layer (Wave 3)
- [ ] No UI module references raw SharePoint REST payloads; all list I/O goes through typed services.
- [ ] Template resolution is a single pure function consuming post metadata and returning a deterministic template entry.
- [ ] Binding writes are encapsulated behind a service with idempotent semantics (create-or-update via stable key).

### C. XML-shell generation (Wave 4)
- [ ] A Project Spotlight page can be generated end-to-end from the saved XML template.
- [ ] `PageShellVersion` is stamped on every generated page binding row.
- [ ] No scattered page-composition code paths exist; the XML driver is the single compositor.

### D. Content mapping (Wave 5)
- [ ] OOB Page Title (banner), OOB Text (subhead), OOB Text (body), `teamViewer`, and OOB Image Gallery are all populated exclusively from structured list data.
- [ ] Optional blocks (e.g., gallery empty, subhead empty) have explicit declared behavior (suppress / render empty / fallback) documented in code and in `09-Editorial-Workflow-and-Lifecycle.md`.

### E. Page binding (Wave 5)
- [ ] Publish creates a `HB Article Destination Pages` row when none exists for the `ArticleId`.
- [ ] Republish updates the same binding row; page identity (`PageId`, `PageUrl`) is preserved unless an approved regeneration path is triggered.
- [ ] `PageShellVersion` + `RenderVersion` lineage is recorded on every write.

### F. UI and workflow (Wave 6)
- [ ] Posts can be authored, reviewed, published, and republished entirely from the authoring UI.
- [ ] Ordinary editorial workflows never require editing the destination SharePoint page directly.

### G. Validation and preview (Wave 7)
- [ ] Preview uses the same template resolver + content mapper as publish.
- [ ] Template-aware field requirements (from `08-Validation-Rules-by-Template.md`) block publish when unmet.

### H. Testing and hosted vetting (Wave 9)
- [ ] Automated tests cover the golden publish path plus at least the following failure modes: missing required field, template-not-found, page-creation-conflict, binding-row-update-conflict, team-viewer-empty.
- [ ] Hosted verification produces a live page on the ProjectSpotlight site matching the architecture-specified shell.

## 3. Closure gate (hosted proof)

Phase-01 will not be declared complete until a single hosted proof run captures all five facts simultaneously:

1. **Destination:** created page URL is under `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight/`.
2. **Shell blocks:** the rendered page contains, in order, OOB Page Title (banner), OOB Text (subhead), OOB Text (body), `teamViewer`, OOB Image Gallery — and nothing else in v1.
3. **Mapped content:** each block's content originates from list-backed structured data; no manual page editing fills any v1 block.
4. **Binding write:** a corresponding `HB Article Destination Pages` row exists with matching `PageId`, `PageUrl`, `PageTemplateKey`, `PageShellVersion`, `RenderVersion`.
5. **Republish behavior:** a second publish on the same article updates the same binding row, preserves `PageId` / `PageUrl`, increments `RenderVersion`, and re-applies mapped content without creating a duplicate page.

Hosted-proof evidence (screenshots + list row exports + request/response log) will be captured in `evidence/wave-09-hosted-verification.md` at Wave 9.

## 4. Claim discipline

- Do not mark any wave "complete" unless its DoD items above are individually checked and evidence-linked in the tracker.
- Do not claim Phase-01 closure unless all five hosted-proof facts are present in the Wave 9 evidence artifact.
- A green build is necessary but never sufficient for closure.
