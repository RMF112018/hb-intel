# 10 — Risk Register and Open Decisions

## Risk register

| ID | Risk | Severity | Mitigation |
|---|---|---:|---|
| R-01 | Backend route gates drift from Safety Records pattern | High | Reuse shared auth helper; role-matrix tests |
| R-02 | Foleon API credentials leak to SPFx | Critical | Backend-only secrets; package scan for secret strings |
| R-03 | Users bypass connector and edit lists directly | Medium | Restrict list permissions; communicate connector workflow; audit changes |
| R-04 | Foleon API does not expose needed embed/publish metadata | Medium | Support manual override fields; validate URL/origin locally |
| R-05 | Homepage placement records become inconsistent with content records | High | Backend writes `ContentLookup` and `ContentIdCache` together |
| R-06 | Sync overwrites HB-authored metadata | High | Field ownership model and conflict policy |
| R-07 | UI becomes generic admin grid | High | Enforce doctrine audit and scorecard before closure |
| R-08 | Compact modes become unusable | High | Breakpoint spec and hosted evidence required |
| R-09 | Graph write permission too broad | Medium | Use existing app posture where possible; document scope justification |
| R-10 | Foleon custom domains/origins not configured correctly | High | Accepted-origin validation and admin diagnostics |
| R-11 | List provisioning remains unstable | High | Use controlled provisioning/validation command; avoid CustomSchema package path |
| R-12 | Sync run volume grows without retention | Medium | Retention policy and aggregate snapshots in later phase |

## Open decisions

### D-01 — UI package boundary

Options:

1. Extend existing `apps/hb-intel-foleon` with connector/admin route.
2. Create separate `apps/hb-foleon-connector` package.

Recommendation: start inside `apps/hb-intel-foleon` if the architecture stays clean. Split later if package governance or permissions require separation.

### D-02 — Role names

Recommended names:

```text
HBIntelFoleonViewer
HBIntelFoleonEditor
HBIntelFoleonPublisher
HBIntelFoleonAdmin
HBIntelFoleonOperator
```

Confirm naming convention against current Safety roles before implementation.

### D-03 — Foleon API sync depth

Start with Docs sync. Add Projects sync after Docs mapping is stable. Add Analytics snapshots in a later phase.

### D-04 — Direct list permissions

Recommendation: selected admins retain emergency list access; normal editors use connector only.

### D-05 — Approval workflow

Initial version can support role-based publish action. Formal review/approval queue can be a later enhancement unless business process requires it immediately.

### D-06 — Backend event telemetry

Initial connector telemetry can use backend logs and SyncRuns. Future enhancement can write connector interaction events if needed.

## Known non-goals

- Do not replace Foleon authoring.
- Do not create a full CMS.
- Do not make SharePoint lists the primary UX.
- Do not expose backend secrets.
- Do not force all Foleon content into homepage placement.
- Do not build analytics dashboards until sync and content lifecycle are stable.
