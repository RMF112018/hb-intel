# 02 — Subject-Matter Research

## Research Summary

### Foleon Platform / API

Foleon provides a RESTful API using standard HTTP behavior and JSON responses, with separate concepts for Docs/editions and Projects. Authentication is bearer-token based. The Manager should therefore treat Foleon as the source system for content availability and metadata, not as an authoring environment embedded in HB Intel.

Practical rule: **sync and place Foleon content; do not recreate Foleon authoring.**

### Foleon Embed / Viewer Behavior

Foleon embed behavior depends on usable source URLs and source-site embed permissions. The Manager must distinguish:

- published URL,
- embed URL,
- preview/review URL,
- external-open-only content,
- blocked embed condition.

Practical rule: **preview must be explicit about whether it is showing the HB Central reader, the Foleon viewer, or an external-only fallback.**

### SharePoint SPFx Host Constraints

SPFx runs inside SharePoint page chrome and must respect host-owned navigation, page width, edit mode, section constraints, and webpart container behavior. Premium SPFx work must use the page canvas confidently but cannot pretend it owns the full application shell.

Practical rule: **do not add fake shell chrome; build a strong hosted work surface inside the SharePoint canvas.**

### Microsoft Graph List Integration

Microsoft Graph list items represent SharePoint list records. Column values are accessed through the `fieldValueSet` dictionary, and list item APIs provide list, get, create, update, delete, and column-value operations.

Practical rule: **keep SharePoint list persistence behind the Function App; keep the SPFx UI focused on task-specific view models.**

### Microsoft Identity / Backend Credentials

Client credential patterns are appropriate for server-to-server work, but secrets must remain server-side and production workloads should prefer stronger credentials where feasible. Delegated user access from SPFx should remain bearer-token based and permission-scoped.

Practical rule: **do not move Foleon OAuth secrets or Microsoft Graph app credentials into SPFx.**

### CMS / Editorial Workflow Patterns

Modern CMS workflows separate draft/staged/live states, provide pre-publish review, expose preview before production, support scheduled publishing, and simplify the content editor interface so content managers can work without affecting design or system configuration.

Practical rule: **use editorial states and workflow language: New, Needs review, Ready, Staged, Live, Scheduled, Blocked.**

## Design Rules for the Foleon Manager

1. The first screen must answer: **what needs attention now?**
2. Content inbox must be primary, not secondary.
3. Lane board must show HB Central destinations as the operating model.
4. Placement must feel like assigning content to a lane, not editing a list item.
5. Preview must be a first-class validation step.
6. Technical diagnostics must be available but not visually dominant.
7. Blocked states must identify:
   - what is wrong,
   - who can fix it,
   - next action,
   - whether it is a Foleon, HB Central placement, or backend/admin issue.
8. The UI must support marketing users who understand campaigns and content, not backend list schemas.
9. The design must preserve registry-first runtime configuration, redacted diagnostics, safe-config gates, and authorization boundaries.
10. Accessibility and keyboard flow must be designed, not added after the fact.
