# 09 — Non-Goals and Hard Stops

## Non-Goals

Do not implement:

- backend route changes
- Azure Function changes
- database or fixture business model changes
- live SharePoint, Procore, Sage, Document Crunch, Adobe Sign, Graph, PnP, or HBI integration
- enabled launch links
- save flows
- repair flows
- approval/rejection/waiver/escalation execution
- access request submission
- role or permission mutation
- package installation
- dependency upgrades
- lockfile modifications
- app-catalog deployment
- tenant configuration changes
- major shell redesign outside card/bento contract needs

## Hard Stops

Stop and report instead of continuing if:

1. `pnpm-lock.yaml` changes.
2. The implementation requires backend mutation to satisfy UI tests.
3. A routed surface loses its active panel marker.
4. A card wrapper is introduced between `PccBentoGrid` and `PccDashboardCard`.
5. TypeScript requires changing `@hbc/models` business contracts.
6. Tests show multiple Tier 1 command cards in one route.
7. Hosted evidence shows SharePoint edit mode collision.
8. A disabled/inert action becomes executable.
9. A card title loses accessible labeling.
10. Build/test failures cannot be resolved inside the declared UI scope.

## Allowed Adjustments

Allowed:

- app-local UI prop additions
- CSS module updates
- app-local test helper updates
- route/surface test additions
- card prop migration
- adding data markers
- adding `rail` and `detail` footprint map entries
- documentation and closeout files
