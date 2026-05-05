# Read-Model-Only Exclusions

The following should not be provisioned as standalone SharePoint lists unless a later implementation decision requires persisted snapshots.

| Exclusion | Reason |
|---|---|
| `PccReadModelEnvelope<T>` | Transport envelope, not durable business state. |
| `PccProjectHomeReadModel` | Dashboard composition derived from underlying lists. |
| `PccWorkCenterRegistryReadModel` | Derived from module/work-center registries. |
| `PccPriorityActionsReadModel` | Derived from priority action sources/candidates/suppressions. |
| `PccDocumentControlReadModel` | Derived from source registry, references, actions, and health. |
| `PccExternalLinksReadModel` | Derived from launch links and mappings. |
| `PccSiteHealthReadModel` | Derived from site health checks/findings/repair requests. |
| `PccTeamAccessReadModel` | Derived from team members, access assignments, and requests. |
| `PccApprovalsReadModel` | Derived from approval/checkpoint lists. |
| Summary/count/analytics records | Store source records; compute summaries. |
