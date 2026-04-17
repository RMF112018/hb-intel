# Gap Register

| Area | Verified current state | Gap | Severity | Required resolution |
|---|---|---|---|---|
| Public webpart existence | `PriorityActionsRail` is present and mounted in `apps/hb-webparts` | Presence alone does not prove spec compliance or schema-backed runtime behavior | High | Refactor public rail against explicit contracts, shared surface family, and documented list schemas |
| Admin webpart | No `priorityActionsRailAdmin` folder is visible in the current `src/webparts` listing | Full admin product is missing | Critical | Create new admin webpart, manifest, mount wiring, writer seams, validation, and preview |
| List runtime read adapters | Schema docs explicitly say direct public list-read adapter remains pending | Public runtime likely not fully bound to canonical list truth | Critical | Implement descriptors, readers, resolvers, mappers, and normalization |
| List write seams | No verified existing dedicated write stack for Priority Actions | Admin cannot be benchmark-grade without explicit writes | Critical | Implement save, reorder, archive, validate, and refresh seams |
| Shared surface family | Spec requires governed `packages/ui-kit/src/homepage/surfaces/priority-rail/` family; existence not proven in audited repo seams | Shared preview/public render contract likely missing | High | Build promoted shared rail surface exports with variants and states |
| Authoring precedent reuse | `HbHeroBannerAdmin` exists | Pattern reuse path exists but is not yet applied to Priority Actions | Medium | Use hero admin as structural precedent, not as visual clone |
| Breakpoint governance | Doctrine now requires shell-level and application-level breakpoint contracts | Public rail/admin preview likely need explicit breakpoint contract hardening | High | Encode and validate layout modes, visible-count caps, overflow rules, and narrowest stable states |
| Proof and closure | Proof-case seam exists for public rail only | No verified benchmark scorecard or hosted closure evidence for the target implementation | High | Produce hosted screenshots, runtime validation, scorecard, and checklist completion |
