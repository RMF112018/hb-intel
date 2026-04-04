# 12 — Closure and Validation Checklist

## Repo-truth closure checklist

Use this checklist any time one of the four in-scope apps or their shared dependencies changes.

### A. App/package reality
- [ ] Confirm the four app folders still exist and still represent the same business surfaces.
- [ ] Confirm whether `apps/estimating` still packages as `@hbc/spfx-project-setup` / `hb-intel-project-setup`.
- [ ] Confirm `apps/project-sites` still reads directly from SharePoint and not from a new API layer.

### B. Shared package/resource reality
- [ ] Re-check shared package dependencies in each app `package.json`.
- [ ] Re-check whether Estimating and Accounting still declare `webApiPermissionRequests`.
- [ ] Re-check whether Admin still lacks a manifest-level API permission declaration.

### C. Backend host boundaries
- [ ] Re-read `backend/functions/src/hosts/project-setup/RELEASE-SCOPE.md`.
- [ ] Re-read `backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md`.
- [ ] Confirm whether Admin provisioning oversight is still using provisioning-domain routes/models.
- [ ] Confirm whether any Admin pages now consume admin-native run/config/evidence APIs directly.

### D. Shared data / source-of-truth boundaries
- [ ] Re-check `packages/models/src/provisioning/IProvisioning.ts` for changes to:
  - [ ] `projectId`
  - [ ] `projectNumber`
  - [ ] `siteUrl`
  - [ ] `department`
  - [ ] `year`
- [ ] Re-check `packages/models/src/admin-control-plane/*` for lifecycle/failure vocabulary drift.
- [ ] Re-check the `Projects` list mapping used by Project Sites.
- [ ] Confirm whether `pid` still equals `projectNumber`.

### E. Documentation drift checks
- [ ] Compare Project Sites manifest/package wording against live code behavior.
- [ ] Compare current-state-map statements against current app/page/backend code.
- [ ] Confirm subset-focused source-of-truth docs still point to the right authorities.

### F. Operational validation
- [ ] Validate Admin auth in a packaged SPFx environment, not only in local/dev runtime.
- [ ] Validate Project Sites against the actual HBCentral `Projects` list schema.
- [ ] Validate that large-list/filter assumptions still align with SharePoint indexing guidance.

## Go / no-go standard for future updates

### Go
- shared dependencies are explicitly documented
- `Projects` list projection ownership is known
- admin/provisioning overlap is intentional and documented
- no stale/conflicting subset docs remain

### No-go
- package/runtime auth assumptions differ from manifest/release docs
- Project Sites depends on undocumented schema drift
- source-of-truth for project identity fields is unclear
- new shared data overlap is introduced without classification
