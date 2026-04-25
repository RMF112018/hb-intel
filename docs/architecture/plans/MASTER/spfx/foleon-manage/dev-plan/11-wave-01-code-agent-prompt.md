# 11 — Wave 01 Code-Agent Prompt: Backend Foundation

You are working in the live `hb-intel` repository on `main`.

## Objective

Implement the backend foundation for the Foleon Connector using the same Azure Functions app and security posture as the Safety Records workflow.

The goal is to create backend-governed Foleon routes that selected users can call from SPFx without granting those users direct SharePoint list editing responsibility.

## Required context

Read and follow:

- existing Safety Records backend route/auth patterns;
- current Functions app auth helpers;
- Graph write helpers;
- Foleon schema docs under `docs/reference/sharepoint/list-schemas/hbcentral/lists/`;
- Foleon app code under `apps/hb-intel-foleon`;
- UI/design docs only where relevant to route contracts returned to frontend.

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required routes

Implement route scaffolding and tests for:

```text
GET    /api/foleon/content
GET    /api/foleon/content/{id}
POST   /api/foleon/content
PATCH  /api/foleon/content/{id}
POST   /api/foleon/content/{id}/validate
POST   /api/foleon/content/{id}/publish
POST   /api/foleon/content/{id}/suppress
GET    /api/foleon/config
POST   /api/foleon/validate-sharepoint
```

Add stubs or explicit TODO contracts for placement/sync routes if not implemented in this wave.

## Required roles

Add Foleon-specific role constants:

```text
HBIntelFoleonViewer
HBIntelFoleonEditor
HBIntelFoleonPublisher
HBIntelFoleonAdmin
HBIntelFoleonOperator
```

Use backend route gates. Do not rely on frontend role hiding.

## Required implementation

- Add Foleon config validation.
- Add content DTOs.
- Add backend validation service.
- Add Graph mapper for `HB_FoleonContentRegistry`.
- Add eTag / if-match update protection.
- Add stable error model.
- Add correlation IDs.
- Add tests for every route gate.

## Required validation rules

Block publishing when:

- URL is missing;
- URL is not HTTPS;
- URL appears to be preview URL;
- origin is not allowlisted;
- `AllowEmbed` and `RequiresExternalOpen` conflict;
- display window is invalid.

## Tests required

Run and report repo-consistent commands for:

- backend typecheck;
- backend tests;
- targeted Foleon route tests;
- no-secret scan if available.

## Final response required

Return:

1. implementation summary;
2. files changed;
3. role-gate matrix;
4. routes implemented;
5. validation rules implemented;
6. test results;
7. remaining Wave 02 frontend requirements;
8. risks or follow-ups.
