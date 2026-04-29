# Prompt 06 — Wave 2 Document Control, External Systems, and Site Health Frames

## Role

You are executing this prompt in the live `RMF112018/hb-intel` repository.

Treat the current repository as the source of truth. Do not assume files from memory are current. Do not repeatedly re-read files that are still within your current context unless the file may have changed or this prompt specifically requires a freshness check.

Work to closure. Do not defer required analysis. Do not ask broad clarification questions. Do not implement outside the allowed scope. If repo truth conflicts with this prompt, stop before code changes and document the conflict clearly.

## Objective

Implement Wave 2 preview frames for the following Project Control Center surfaces:

1. Documents / Document Control;
2. External Systems;
3. Site Health.

These are **UI preview frames only** for Phase 3 Wave 2. They must use Wave 1 read-model contracts, shared PCC model constants, fixtures, and app-local preview data where necessary.

Do **not** implement live operational behavior in this prompt. Do **not** introduce live Microsoft Graph, PnP, SharePoint REST, Procore, Document Crunch, Adobe Sign, backend API, tenant, provisioning, scanner, repair-runner, workflow-execution, approval-execution, file-operation, sync, mirror, write-back, or mutation behavior.

This prompt must correct the Document Control product posture: Document Control is **not merely a launcher**. It is a two-lane module whose future-state architecture is:

1. a functional Microsoft file-management surface for SharePoint Drive and OneDrive; and
2. an external document-system access hub for Procore Files, Document Crunch, Adobe Sign, and similar external platforms.

Wave 2 must preview that architecture without implementing live operations.

---

## Governing Context

Before making code changes, inspect the relevant current files and confirm the active app/package state.

Required repo-truth checks:

- `apps/project-control-center/`
- `apps/project-control-center/src/PccApp.tsx`
- existing PCC surface/frame files created by earlier Wave 2 prompts;
- `packages/models/src/pcc/`
- `packages/models/src/pcc/index.ts`
- Document Control source registry exports, if present;
- external system catalog and launch-link model exports;
- Site Health read-model and fixture exports;
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/`
- `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-02/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/dashboard/dashboard-basis-of-design.png`

Use existing local patterns in `apps/project-control-center/` from Prompts 02–05. Do not create a parallel architecture. Do not create a new app. Do not move PCC into `apps/project-sites/`, `apps/hb-webparts/`, or `packages/spfx` unless the prompt sequence has explicitly authorized that work. This prompt does not authorize that move.

---

## Scope Summary

### In Scope

- Add or update preview-frame components inside `apps/project-control-center/` for:
  - Documents / Document Control;
  - External Systems;
  - Site Health.
- Use existing `@hbc/models/pcc` constants, fixture data, and read-model contracts wherever available.
- Add app-local preview data only when shared models do not yet expose enough display data.
- Add tests proving the frames render from model/fixture/preview data and do not introduce live-operation paths.
- Add or update the Prompt 06 closeout documentation under:
  - `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Prompt_06_Closeout.md`

### Out of Scope

Do not implement or introduce:

- live Microsoft Graph calls;
- live PnP calls;
- SharePoint REST calls;
- OneDrive live calls;
- Procore runtime, SDK, credentials, secrets, sync, mirror, or write-back;
- Document Crunch runtime, SDK, credentials, secrets, sync, mirror, or write-back;
- Adobe Sign runtime, SDK, credentials, secrets, signature execution, sync, mirror, or write-back;
- upload execution;
- download execution;
- copy-link execution;
- open-file execution that depends on live runtime data;
- approval execution;
- rejection execution;
- file mutation;
- folder mutation;
- permission mutation;
- document workflow execution;
- document sync;
- document mirroring;
- backend API routes;
- Azure Functions changes;
- provisioning/template package changes;
- tenant mutation;
- scanner execution;
- repair-runner execution;
- app catalog packaging;
- `.sppkg` generation;
- CI/CD changes;
- package/manifest version bumps unless explicitly authorized by a later prompt.

---

## Documents / Document Control — Corrected Product Model

Implement the Document Control preview frame as a **two-lane module**.

### Lane 1 — Microsoft Files Lane

Applies to:

- SharePoint Drive;
- OneDrive.

Future-state intent:

The Project Control Center Document Control module is intended to become a functional Microsoft file-management surface powered by Microsoft Graph. It should eventually allow authorized users to manage project files stored in Microsoft 365 without duplicating those files into a separate PCC store.

Future-state capabilities include:

- browse project libraries and folders;
- view file/folder metadata;
- open files;
- upload files;
- download files;
- copy/share links;
- display approval status;
- support governed approval actions only where separately authorized by a later implementation gate;
- respect existing Microsoft 365 permissions;
- avoid duplicating Microsoft files into a PCC-controlled file store.

Wave 2 implementation requirements:

- Render SharePoint Drive and OneDrive as the **Microsoft Files** lane.
- Show file-management affordances as **preview-only disabled actions**, not live actions.
- Display labels such as:
  - Browse;
  - Open;
  - Upload;
  - Download;
  - Copy/Share Link;
  - Approval Status.
- Clearly label these actions as future Graph-backed capabilities.
- Use shared PCC model constants/registries if available. If current shared models only define source identity, create app-local preview metadata derived from those source identities.
- Do not create Graph clients.
- Do not import `@microsoft/microsoft-graph-client`.
- Do not import `@pnp/sp`.
- Do not import SharePoint REST utilities.
- Do not call Graph, PnP, SharePoint, OneDrive, or file APIs.
- Do not implement active buttons that perform file operations.
- Do not implement file upload/download/copy-link/open execution.
- Do not implement approval execution.

The UI must make it obvious that Microsoft Files is a future operational lane, not merely a launch card.

### Lane 2 — External Document Systems Lane

Applies to:

- Procore Files;
- Document Crunch;
- Adobe Sign;
- future external document/file systems.

Future-state intent:

The Project Control Center Document Control module should provide access and visibility into files, records, or document workflows that users are allowed to access in external systems. PCC is not the system of record for those external files and should not copy, mirror, sync, or mutate them unless a later approved integration explicitly authorizes it.

Wave 2 implementation requirements:

- Render Procore Files, Document Crunch, and Adobe Sign in an **External Document Systems** lane.
- Render launch-link and missing-configuration states only.
- Display permission-aware preview language, such as:
  - “Access depends on your permissions in the source system.”
  - “Configured launch links will open the source platform.”
  - “Missing configuration prevents launch.”
- Use `EXTERNAL_SYSTEM_CATALOG`, `ILaunchLink`, related fixtures, or app-local preview data derived from shared model constants.
- Do not call external APIs.
- Do not store or reference secrets.
- Do not add SDKs.
- Do not sync files.
- Do not mirror files.
- Do not write back to external platforms.
- Do not claim PCC can manage external files directly in Wave 2.

### Required Document Control UI Structure

The Document Control frame must contain:

1. title/header identifying the surface as **Document Control** or **Document Control Center**;
2. explanatory copy stating this is a preview-only frame;
3. Microsoft Files lane:
   - SharePoint Drive card;
   - OneDrive card;
   - disabled/preview-only file-management action chips or buttons;
   - future Graph-backed label or cue;
4. External Document Systems lane:
   - Procore Files card;
   - Document Crunch card;
   - Adobe Sign card;
   - launch/missing-config cues;
5. guardrail cue confirming no live document operations are active in Wave 2.

Do not reduce Document Control to only a set of launch cards. The Microsoft lane must visually communicate the intended future file-management capability.

---

## External Systems Surface

Implement External Systems as a launch-link and missing-configuration preview surface.

Use:

- `EXTERNAL_SYSTEM_CATALOG`;
- `ILaunchLink`;
- existing external-system fixtures/read-models;
- app-local preview data only when shared data is insufficient.

Expected frame behavior:

- show configured systems;
- show launch-link-style cards;
- show missing-configuration states;
- show unavailable-fixture states if fixture data is missing;
- show preview-only language;
- avoid live external API calls.

Do not:

- call external APIs;
- add Procore runtime;
- add Document Crunch runtime;
- add Adobe Sign runtime;
- add secrets;
- add credentials;
- add token storage;
- sync data;
- mirror data;
- mutate external systems.

The External Systems surface is broader than the External Document Systems lane inside Document Control. It may include broader project-system connections, but must remain launch/missing-config preview only in Wave 2.

---

## Site Health Surface

Implement Site Health as a read-model summary preview frame.

Expected frame behavior:

- show overall status;
- show severity counts;
- show drift indicators if fixture data exists;
- show missing-config cues;
- show unavailable-fixture state if fixture data is missing;
- show repair-request entry as a placeholder only;
- show clear preview-only language.

Do not implement:

- scanners;
- repair runners;
- Graph probes;
- PnP probes;
- SharePoint REST probes;
- backend persistence;
- tenant checks;
- permission mutation;
- repair execution;
- live diagnostics.

The repair-request entry must be visibly non-operational in Wave 2.

---

## UI / UX Requirements

Maintain alignment with the Wave 2 PCC UI direction:

- dark navy/blue project intelligence context;
- HB orange navigation/accent system;
- premium project-control command-center feel;
- flexible bento/masonry card composition where appropriate;
- compact operational density;
- clear hierarchy;
- preview/fallback states that feel intentional, not broken;
- responsive behavior across desktop, tablet, and constrained widths;
- no homepage paired-row layout inheritance;
- no fake SharePoint chrome duplication.

Use existing `@hbc/ui-kit` primitives and tokens where they are already available and appropriate in the app. If a pattern is not yet exposed by `@hbc/ui-kit`, keep implementation app-local and do not create new reusable primitives as part of this prompt.

Do not create a generic equal-card enterprise grid if the existing Prompt 03–05 PCC shell already established a bento/premium layout direction. Continue that direction.

---

## Data / Model Requirements

Use shared model contracts first.

Expected shared sources to inspect and reuse where present:

- PCC MVP surface definitions;
- Document Control source registry;
- external system catalog;
- launch-link types;
- Site Health read-models;
- Site Health fixtures;
- PCC fixtures aggregate;
- personas/capabilities only as display hints, never as authorization gates.

If app-local preview data is required:

- keep it inside `apps/project-control-center/`;
- derive names and IDs from shared constants where possible;
- document why app-local data was necessary;
- keep it deterministic;
- do not create new canonical taxonomy that conflicts with `@hbc/models/pcc`.

---

## Tests Required

Add or update tests under `apps/project-control-center/` confirming the following.

### Document Control Tests

Tests must confirm:

- the Document Control frame renders two lanes:
  - Microsoft Files;
  - External Document Systems;
- SharePoint Drive and OneDrive render under the Microsoft Files lane;
- Microsoft file-management actions render as disabled or preview-only;
- Microsoft file-management actions include at least:
  - Browse;
  - Open;
  - Upload;
  - Download;
  - Copy Link;
  - Approval Status;
- Procore Files, Document Crunch, and Adobe Sign render under the External Document Systems lane;
- external document systems render launch/missing-config cues only;
- no Graph/PnP/client/import/API/file-operation execution path is introduced by the Document Control frame.

### External Systems Tests

Tests must confirm:

- external-system launch-link and missing-configuration states render;
- external-system cards derive from shared model constants, fixtures, or clearly documented preview data;
- no live external API, SDK, secret, sync, mirror, or write-back path exists.

### Site Health Tests

Tests must confirm:

- Site Health summary renders from fixture/read-model data;
- overall status renders;
- severity counts render;
- drift indicators render when fixture data exists;
- missing-config or unavailable-fixture states render when data is missing;
- repair-request entry renders as a placeholder only;
- no scanner, repair-runner, Graph/PnP probe, backend, tenant, or persistence path exists.

### Boundary Tests / Static Guards

Add or update static guard tests where consistent with the app’s current testing pattern to ensure no forbidden runtime paths exist in `apps/project-control-center/src/`.

Forbidden terms/imports to guard against, as applicable:

- `@microsoft/microsoft-graph-client`;
- `@pnp/sp`;
- `sp.web`;
- `_api/web`;
- `GraphClient`;
- `MSGraphClient`;
- `ProcoreClient`;
- `DocumentCrunch` SDK/client imports;
- `AdobeSign` SDK/client imports;
- upload execution functions;
- sync/mirror/write-back execution functions;
- repair-runner execution;
- scanner execution.

Do not create brittle tests that fail only because explanatory UI copy includes the words “Graph” or “Procore.” Guard imports, execution paths, client construction, SDK references, and mutation verbs in executable code rather than banning product copy.

---

## Validation Commands

Run the following from the repo root:

```bash
git status --short
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center build
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/spfx-project-control-center lint
```

If command names have changed in the current repo, inspect `apps/project-control-center/package.json` and run the equivalent package-scoped commands. Do not substitute app-catalog packaging, tenant smoke tests, Graph/PnP checks, or deployment commands.

Do not run install/add/update commands unless strictly necessary. If `pnpm-lock.yaml` changes, stop and inspect why. Accept lockfile changes only if they are strictly required by the authorized app-local work and do not introduce resolved-version churn. Document the result.

---

## Closeout Deliverable

Create or update:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-2/Wave_2_Prompt_06_Closeout.md
```

The closeout must include:

1. summary of implemented files;
2. confirmation that Document Control was implemented as a two-lane preview model:
   - Microsoft Files Management Lane;
   - External Document Systems Lane;
3. confirmation that Microsoft file-management actions are preview-only and disabled/non-executing in Wave 2;
4. confirmation that live Microsoft Graph-backed file operations are deferred to a later approved wave;
5. confirmation that external document systems are launch/missing-config only in Wave 2;
6. confirmation that no Procore, Document Crunch, or Adobe Sign API/runtime/SDK/secrets/sync/mirror/write-back paths were introduced;
7. confirmation that Site Health is read-model/fixture summary only;
8. confirmation that no scanner, repair runner, Graph/PnP probe, tenant probe, backend persistence, or mutation path was introduced;
9. validation command results;
10. lockfile status;
11. explicit list of files changed;
12. any app-local preview data added and why it was needed;
13. note that the future-state Microsoft file-management lane will require a later Graph-backed implementation plan, authorization model, permission posture, tenant consent review, and security review before live operations are introduced.

---

## Expected Commit Summary

Use a scoped commit summary similar to:

```text
feat(spfx-project-control-center): add document control and site health preview frames
```

## Expected Commit Description

The commit description must state that this is Wave 2 Prompt 06 preview UI only and must explicitly confirm:

- Document Control now reflects the intended two-lane product model;
- SharePoint Drive and OneDrive are previewed as future Microsoft Graph-backed file-management surfaces;
- Procore Files, Document Crunch, and Adobe Sign are previewed as external document-system access points;
- no live file operations, external runtime, backend, tenant, scanner, repair, provisioning, or deployment behavior was introduced;
- all package-scoped validation commands passed or any failure is documented as unrelated/pre-existing.

---

## Final Guardrails

Do not treat this prompt as authorization to build the live Document Control module.

This prompt only corrects and previews the architecture:

- Microsoft files are future managed surfaces;
- external systems are access/visibility surfaces;
- all live operations remain deferred.

If implementing the requested preview would require live Graph, PnP, Procore, Document Crunch, Adobe Sign, backend, tenant, provisioning, scanner, repair, or deployment behavior, stop and document the conflict before code changes.
