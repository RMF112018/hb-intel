# 01-Backend-Topology-and-Persistence-Assessment

## Objective

Assess whether the current implementation actually honors the intended split topology:

- `/sites/Safety`
  - application host
  - upload UX
  - source workbook landing library
- `/sites/HBCentral`
  - authoritative structured records
  - `Projects`
  - `Legacy Project Fallback Registry`

## Repo-Truth Seams Inspected

### Application runtime / SharePoint entry

- `apps/safety/src/App.tsx`
- `apps/safety/src/main.tsx`
- `apps/safety/src/bootstrap.ts`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/src/pages/UploadPage.tsx`
- `apps/safety/src/pages/ReviewQueuePage.tsx`
- `apps/safety/src/router/routes.ts`
- `apps/safety/config/package-solution.json`

### Shared package / backend seams

- `packages/features/safety/src/index.ts`
- `packages/features/safety/src/factory.ts`
- `packages/features/safety/src/ports/ISafetyInspectionRepository.ts`
- `packages/features/safety/src/lists/descriptors.ts`
- `packages/features/safety/src/lists/safetyUploadLibrary.ts`
- `packages/features/safety/src/lists/fieldSchema.ts`
- `packages/features/safety/src/ingestion/runIngestionPipeline.ts`
- `packages/features/safety/src/adapters/mock/MockSafetyInspectionRepository.ts`
- `packages/features/safety/README.md`

## What the Code Claims

The package README and index state the intended Release 1 topology clearly:

- UX and upload library on `/sites/Safety`
- structured records on `/sites/HBCentral`
- project resolution against `Projects` and `Legacy Project Fallback Registry`
- current-user-auth cross-site writes in Release 1

That intent is coherent.

## What the App Actually Wires

`App.tsx` attempts to create the repository in **SharePoint mode** whenever a valid SPFx `spHttpClient` exists. `SafetyWebPart.tsx` always passes the SPFx context into the React app in hosted SharePoint use. That means the hosted path is not mock-only; it is supposed to execute real backend logic.

## Blocking Topology / Persistence Defect

### Missing real SharePoint adapter source seams

The package index and factory both declare/use these source paths:

- `packages/features/safety/src/adapters/sharepoint/SharePointSafetyInspectionRepository.ts`
- `packages/features/safety/src/adapters/sharepoint/spHttp.ts`
- `packages/features/safety/src/adapters/sharepoint/uploadToSafetyChecklistUploads.ts`

Those paths could **not** be resolved at the declared repo locations during direct file fetch.

That means the core hosted persistence seams that are supposed to:

- upload the workbook to `/sites/Safety/SafetyChecklistUploads`
- resolve projects against HBCentral source lists
- write structured rows to HBCentral lists
- support retry by re-reading retained uploads

are not presently proven as repo-truth source files in the active package at the exported boundary.

### Severity
**P0**

### Why this matters
The SPFx app is explicitly wired to enter SharePoint mode in hosted use. If the concrete SharePoint repository seam is absent at the declared source boundary, the hosted backend path is not operational.

## Descriptor Assessment

### What is correct
`descriptors.ts` correctly expresses that the five custom safety lists belong on `/sites/HBCentral`, and `safetyUploadLibrary.ts` correctly expresses that the upload library belongs on `/sites/Safety`.

### What is not production-wired
All list descriptors remain on the zero GUID fail-closed placeholder pattern, including the upload library descriptor.

This is directionally safer than silent misbinding, but it means the main branch is not deploy-ready without manual descriptor mutation.

### Additional topology weakness
The package contains explicit descriptors for the five custom safety lists, but **not** for the reference source lists called out as load-bearing in the README:

- `Projects`
- `Legacy Project Fallback Registry`

That is a structural gap because project resolution is a first-class backend requirement, but the package does not surface those source-list bindings in the same explicit, site-qualified way.

## Cross-Site Write Safety Assessment

### Positive
The intended topology is explicit, and the fail-closed zero-GUID posture is safer than permissive fallback.

### Negative
Because the real SharePoint repository seam was not retrievable, the audit could not prove:

- explicit upload-library write routing to `/sites/Safety`
- explicit structured-record writes to `/sites/HBCentral`
- correct reference-list queries against HBCentral
- correct cross-site REST endpoint composition
- correct permission/403 handling
- partial-write behavior across sites

## Conclusion

The topology **design intent** is sound, but the **repo-truth hosted persistence implementation is not proven and is currently not production-credible**.

## Required Remediation Direction

1. Restore or add the concrete SharePoint repository and upload-helper source seams at the declared package boundary.
2. Explicitly model the reference source lists (`Projects`, `Legacy Project Fallback Registry`) in the same site-qualified descriptor pattern.
3. Move descriptor binding out of zero-GUID-only source placeholders into a tenant-ready, provable provisioning/config seam.
4. Add verification that proves:
   - upload lands on `/sites/Safety`
   - structured rows land on `/sites/HBCentral`
   - wrong-site collapse is impossible
   - permission failures are surfaced, not swallowed
