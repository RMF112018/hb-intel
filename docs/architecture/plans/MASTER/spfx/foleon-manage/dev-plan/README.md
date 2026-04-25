# Foleon Connector Development Plan Package

## Purpose

This package defines the development plan for a governed **Foleon Connector** application that lets a selected user group manage Foleon content without directly interacting with SharePoint lists.

The application must follow the same security, backend-governance, validation, rollout, and proof posture used by the existing `safety-record` workflow, using the same Azure Functions backend app.

## Target outcome

Selected Marketing / Communications / HB Central admin users manage Foleon content through a premium SPFx connector surface. The connector calls governed backend routes in the existing Functions app. The backend validates permissions, talks to the Foleon API, validates content and embed posture, and writes to HBCentral SharePoint lists through Microsoft Graph.

## Package files

| File | Purpose |
|---|---|
| `00-objective-and-decision-record.md` | Governing decision and target architecture |
| `01-product-scope-and-personas.md` | Users, workflows, and functional scope |
| `02-system-architecture.md` | SPFx + Azure Functions + Graph + Foleon API architecture |
| `03-backend-api-contract.md` | Backend routes, auth gates, DTOs, validation, errors |
| `04-data-model-and-sharepoint-contract.md` | SharePoint lists, field ownership, writes, GUID behavior |
| `05-frontend-ux-and-design-standard.md` | SPFx design doctrine, IA, flows, states, breakpoints |
| `06-security-auth-and-permissions.md` | Entra roles, backend enforcement, secrets, auditability |
| `07-foleon-api-sync-and-validation.md` | Foleon API sync, token flow, URL/embed validation |
| `08-implementation-waves-and-cpm-plan.md` | Critical-path development sequence |
| `09-testing-validation-and-release-proof.md` | Acceptance tests, hosted proof, package truth, audit score |
| `10-risk-register-and-open-decisions.md` | Risks, blockers, decisions, mitigations |
| `11-wave-01-code-agent-prompt.md` | Implementation prompt for backend foundation |
| `12-wave-02-code-agent-prompt.md` | Implementation prompt for connector UI |
| `13-wave-03-code-agent-prompt.md` | Implementation prompt for sync, placements, validation, release proof |


## Source references

### Repo/document authority
- `docs/reference/spfx-surfaces/**`
- `docs/reference/spfx-surfaces/benchmark/**`
- `docs/reference/ui-kit/doctrine/`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md`
- `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-content-registry.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-homepage-placements.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-interaction-events.md`
- `docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-sync-runs.md`

### External references
- Foleon API overview: https://developers.foleon.com/apis
- Foleon OAuth token endpoint: https://developers.foleon.com/apis/authentication/obtainoauthtoken
- Microsoft Azure App Service / Functions authentication: https://learn.microsoft.com/en-us/azure/app-service/configure-authentication-provider-aad
- Microsoft App Service authentication and authorization overview: https://learn.microsoft.com/en-us/azure/app-service/overview-authentication-authorization
- Microsoft Graph list item update / eTag concurrency: https://learn.microsoft.com/en-us/graph/api/listitem-update?view=graph-rest-1.0
