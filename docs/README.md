# HB Intel Documentation

Navigation index for the HB Intel documentation suite. All documentation follows the [Diataxis framework](https://diataxis.fr/) with clear audience separation.

## Documentation Structure

| Section | Purpose | Audience |
|---------|---------|----------|
| [Tutorials](./tutorials/) | Learning-oriented, step-by-step onboarding | New developers, new users |
| [How-To Guides](./how-to/) | Goal-oriented practical guides | Users, Administrators, Developers |
| [Reference](./reference/) | Technical facts, API specs, config, glossary | Developers, Operations |
| [Explanation](./explanation/) | Conceptual and architectural understanding | All audiences |
| [User Guide](./user-guide/) | End-user manual | End users |
| [Administrator Guide](./administrator-guide/) | Operations and admin procedures | Administrators |
| [Maintenance](./maintenance/) | Runbooks (backup, patching, monitoring, DR) | Operations |
| [Troubleshooting](./troubleshooting/) | Known issues and common errors | All audiences |
| [Architecture](./architecture/) | Blueprints, ADRs, diagrams, plans | Developers, Architects |
| [Release Notes](./release-notes/) | Per-version change notes | All audiences |
| [Security](./security/) | Compliance and security documentation | Administrators, Security |
| [FAQ](./faq.md) | Frequently asked questions | All audiences |

## Current-State Architecture

- **[Current-State Architecture Map](./architecture/blueprint/current-state-map.md)** — Authoritative reference for the present implementation state of the monorepo. When this document differs from historical plans, it governs present truth.

## Blueprint & Program Navigation

- **[HB Intel Unified Blueprint](./architecture/blueprint/HB-Intel-Unified-Blueprint.md)** — The master summary architecture and program narrative for HB Intel. Covers product thesis, operating principles, target architecture, current-state summary, role/device model, provisioning doctrine, all 20 interview-locked doctrine decisions, shared-feature primitives, delivery history, and the active roadmap. **Start here** for a complete picture of what HB Intel is and where it is going.

- **[HB Intel Delivery Roadmap](./architecture/blueprint/HB-Intel-Dev-Roadmap.md)** — Consolidated execution delivery roadmap. Defines the wave structure (Foundation/Wave 0 → Wave 1 → Wave 2 → Wave 3 → Convergence), dual-stream SPFx/PWA sequencing doctrine, readiness gates (app pilot, MVP-complete, PWA MVP, SPFx retirement), and long-range convergence strategy. **Read after the Unified Blueprint** for delivery sequence and sprint-level planning context.

- **[Master Plan Set](./architecture/plans/MASTER/README.md)** — Program-level planning index covering all eight development phases and the plan-stack crosswalk. Start here for program structure, milestones, Phase 1 deliverables, and navigation between plan families.

## Development Plan Library

- **[Master Plan Set](./architecture/plans/MASTER/README.md)** — Program-level planning index covering all eight development phases. Phase 0 and Phase 1 planning are complete; Phases 2–7 are forward-planning drafts. Start here for program structure, milestones, and Phase 1 deliverables.

- **[MVP / Wave 0 Execution Plans](./architecture/plans/MVP/)** — Active sprint-level execution plans for the pre-Phase-1 implementation baseline. Organized into six groups (G1–G6) covering contracts and configuration, backend hardening, shared platform wiring, SPFx surfaces, hosted PWA surfaces, and admin observability.

- **Phase 7 Domain Plans** — Feature-level plans for BD, Estimating, Project Hub, Admin, and Breakout Webparts. Pending Wave 1 activation. Located in `plans/ph7-business-development/`, `plans/ph7-estimating/`, `plans/ph7-project-hub/`, and related directories.

## Locked Architecture Documents

- [Blueprint V4](./architecture/blueprint/HB-Intel-Blueprint-V4.md) — Complete target architecture (read-only, comment-only updates)
- [Foundation Plan](./architecture/plans/hb-intel-foundation-plan.md) — Exhaustive implementation instructions (read-only, comment-only updates)

## ADR Index

| ADR | Status | File |
|-----|--------|------|
| ADR-0001 | Accepted | [ADR-0001-monorepo-bootstrap.md](./architecture/adr/ADR-0001-monorepo-bootstrap.md) |
| ADR-0002 | Accepted | [ADR-0002-ports-adapters-data-access.md](./architecture/adr/ADR-0002-ports-adapters-data-access.md) |
| ADR-0003 | Accepted | [ADR-0003-shell-navigation-zustand.md](./architecture/adr/ADR-0003-shell-navigation-zustand.md) |
| ADR-0004 | Accepted | [ADR-0004-ui-kit-design-system.md](./architecture/adr/ADR-0004-ui-kit-design-system.md) |
| ADR-0005 | Accepted | [ADR-0005-dev-harness.md](./architecture/adr/ADR-0005-dev-harness.md) |
| ADR-0006 | Accepted | [ADR-0006-pwa-standalone.md](./architecture/adr/ADR-0006-pwa-standalone.md) |
| ADR-0007 | Accepted | [ADR-0007-spfx-vite-first.md](./architecture/adr/ADR-0007-spfx-vite-first.md) |
| ADR-0008 | Accepted | [ADR-0008-hb-site-control-mobile.md](./architecture/adr/ADR-0008-hb-site-control-mobile.md) |
| ADR-0009 | Accepted | [ADR-0009-backend-functions.md](./architecture/adr/ADR-0009-backend-functions.md) |
| ADR-0010 | Accepted | [ADR-0010-ci-cd-pipeline.md](./architecture/adr/ADR-0010-ci-cd-pipeline.md) |
| ADR-0011 | Accepted | [ADR-0011-verification-deployment.md](./architecture/adr/ADR-0011-verification-deployment.md) |
| ADR-0012 | Accepted | [ADR-0012-models-comprehensive-structure.md](./architecture/adr/ADR-0012-models-comprehensive-structure.md) |
| ADR-0013 | Accepted | [ADR-0013-data-access-comprehensive-rebuild.md](./architecture/adr/ADR-0013-data-access-comprehensive-rebuild.md) |
| ADR-0014 | Accepted | [ADR-0014-query-hooks-comprehensive.md](./architecture/adr/ADR-0014-query-hooks-comprehensive.md) |
| ADR-0015 | Not Issued (Reserved Gap) | Reserved numbering gap retained to preserve historical ADR continuity. |
| ADR-0016 | Accepted | [ADR-0016-ui-design-system-foundation.md](./architecture/adr/ADR-0016-ui-design-system-foundation.md) |
| ADR-0017 | Accepted | [ADR-0017-ui-global-shell.md](./architecture/adr/ADR-0017-ui-global-shell.md) |
| ADR-0018 | Accepted | [ADR-0018-ui-page-layout-taxonomy.md](./architecture/adr/ADR-0018-ui-page-layout-taxonomy.md) |
| ADR-0019 | Accepted | [ADR-0019-ui-component-library-priority.md](./architecture/adr/ADR-0019-ui-component-library-priority.md) |
| ADR-0020 | Accepted | [ADR-0020-data-visualization-table-system.md](./architecture/adr/ADR-0020-data-visualization-table-system.md) |
| ADR-0021 | Accepted | [ADR-0021-ui-overlay-surface-system.md](./architecture/adr/ADR-0021-ui-overlay-surface-system.md) |
| ADR-0022 | Accepted | [ADR-0022-ui-messaging-feedback-system.md](./architecture/adr/ADR-0022-ui-messaging-feedback-system.md) |
| ADR-0023 | Accepted | [ADR-0023-ui-navigation-system.md](./architecture/adr/ADR-0023-ui-navigation-system.md) |
| ADR-0024 | Accepted | [ADR-0024-ui-form-architecture.md](./architecture/adr/ADR-0024-ui-form-architecture.md) |
| ADR-0025 | Accepted | [ADR-0025-ui-interaction-pattern-library.md](./architecture/adr/ADR-0025-ui-interaction-pattern-library.md) |
| ADR-0026 | Accepted | [ADR-0026-ui-module-specific-patterns.md](./architecture/adr/ADR-0026-ui-module-specific-patterns.md) |
| ADR-0027 | Accepted | [ADR-0027-ui-field-mode-implementation.md](./architecture/adr/ADR-0027-ui-field-mode-implementation.md) |
| ADR-0028 | Accepted | [ADR-0028-ui-responsive-bottom-nav.md](./architecture/adr/ADR-0028-ui-responsive-bottom-nav.md) |
| ADR-0029 | Accepted | [ADR-0029-ui-ngx-modernization.md](./architecture/adr/ADR-0029-ui-ngx-modernization.md) |
| ADR-0030 | Accepted | [ADR-0030-ui-kit-final-implementation.md](./architecture/adr/ADR-0030-ui-kit-final-implementation.md) |
| ADR-0031 | Accepted | [ADR-0031-ui-storybook-configuration.md](./architecture/adr/ADR-0031-ui-storybook-configuration.md) |
| ADR-0032 | Accepted | [ADR-0032-phase4-complete-qa-qc-review.md](./architecture/adr/ADR-0032-phase4-complete-qa-qc-review.md) |
| ADR-0033 | Accepted | [ADR-0033-ui-kit-app-wiring.md](./architecture/adr/ADR-0033-ui-kit-app-wiring.md) |
| ADR-0034 | Accepted | [ADR-0034-audit-remediation.md](./architecture/adr/ADR-0034-audit-remediation.md) |
| ADR-0035 | Accepted | [ADR-0035-build-packaging-foundation.md](./architecture/adr/ADR-0035-build-packaging-foundation.md) |
| ADR-0036 | Accepted | [ADR-0036-shell-completion-and-workspacepageshell.md](./architecture/adr/ADR-0036-shell-completion-and-workspacepageshell.md) |
| ADR-0037 | Accepted | [ADR-0037-layout-variant-system.md](./architecture/adr/ADR-0037-layout-variant-system.md) |
| ADR-0038 | Accepted | [ADR-0038-command-bar-and-page-actions.md](./architecture/adr/ADR-0038-command-bar-and-page-actions.md) |
| ADR-0039 | Accepted | [ADR-0039-navigation-and-active-state.md](./architecture/adr/ADR-0039-navigation-and-active-state.md) |
| ADR-0040 | Accepted | [ADR-0040-theme-and-token-enforcement.md](./architecture/adr/ADR-0040-theme-and-token-enforcement.md) |
| ADR-0041 | Accepted | [ADR-0041-data-loading-and-state-handling.md](./architecture/adr/ADR-0041-data-loading-and-state-handling.md) |
| ADR-0042 | Accepted | [ADR-0042-form-architecture.md](./architecture/adr/ADR-0042-form-architecture.md) |
| ADR-0043 | Accepted | [ADR-0043-notifications-and-feedback.md](./architecture/adr/ADR-0043-notifications-and-feedback.md) |
| ADR-0044 | Accepted | [ADR-0044-mobile-and-field-mode.md](./architecture/adr/ADR-0044-mobile-and-field-mode.md) |
| ADR-0045 | Accepted | [ADR-0045-component-consumption-enforcement.md](./architecture/adr/ADR-0045-component-consumption-enforcement.md) |
| ADR-0046 | Accepted | [ADR-0046-integration-verification-and-acceptance.md](./architecture/adr/ADR-0046-integration-verification-and-acceptance.md) |
| ADR-0047 | Accepted | [ADR-0047-menu-and-overlay-theme-adaptation.md](./architecture/adr/ADR-0047-menu-and-overlay-theme-adaptation.md) |
| ADR-0048 | Accepted | [ADR-0048-navigation-and-active-state-synchronization.md](./architecture/adr/ADR-0048-navigation-and-active-state-synchronization.md) |
| ADR-0049 | Accepted | [ADR-0049-form-validation-architecture-finalization.md](./architecture/adr/ADR-0049-form-validation-architecture-finalization.md) |
| ADR-0050 | Accepted | [ADR-0050-developer-harness-documentation-and-e2e-expansion.md](./architecture/adr/ADR-0050-developer-harness-documentation-and-e2e-expansion.md) |
| ADR-0051 | Accepted | [ADR-0051-build-pipeline-bundle-reporting-and-polish.md](./architecture/adr/ADR-0051-build-pipeline-bundle-reporting-and-polish.md) |
| ADR-0052 | Accepted | [ADR-0052-integration-verification-and-acceptance-final.md](./architecture/adr/ADR-0052-integration-verification-and-acceptance-final.md) |
| ADR-0053 | Accepted | [ADR-0053-auth-dual-mode-foundation.md](./architecture/adr/ADR-0053-auth-dual-mode-foundation.md) |
| ADR-0054 | Accepted | [ADR-0054-shell-navigation-foundation.md](./architecture/adr/ADR-0054-shell-navigation-foundation.md) |
| ADR-0055 | Accepted | [ADR-0055-dual-mode-authentication-architecture.md](./architecture/adr/ADR-0055-dual-mode-authentication-architecture.md) |
| ADR-0056 | Accepted | [ADR-0056-central-auth-session-permission-state.md](./architecture/adr/ADR-0056-central-auth-session-permission-state.md) |
| ADR-0057 | Accepted | [ADR-0057-role-mapping-and-authorization-governance.md](./architecture/adr/ADR-0057-role-mapping-and-authorization-governance.md) |
| ADR-0058 | Accepted | [ADR-0058-shell-composition-and-core-layout-architecture.md](./architecture/adr/ADR-0058-shell-composition-and-core-layout-architecture.md) |
| ADR-0059 | Accepted | [ADR-0059-unified-shell-status-connectivity-bar-integration.md](./architecture/adr/ADR-0059-unified-shell-status-connectivity-bar-integration.md) |
| ADR-0060 | Accepted | [ADR-0060-controlled-degraded-mode.md](./architecture/adr/ADR-0060-controlled-degraded-mode.md) |
| ADR-0061 | Accepted | [ADR-0061-guards-redirects-and-recovery-surfaces.md](./architecture/adr/ADR-0061-guards-redirects-and-recovery-surfaces.md) |
| ADR-0062 | Accepted | [ADR-0062-protected-feature-registration-contract.md](./architecture/adr/ADR-0062-protected-feature-registration-contract.md) |
| ADR-0063 | Accepted | [ADR-0063-access-control-backend-and-data-model.md](./architecture/adr/ADR-0063-access-control-backend-and-data-model.md) |
| ADR-0064 | Accepted | [ADR-0064-minimal-production-admin-ux.md](./architecture/adr/ADR-0064-minimal-production-admin-ux.md) |
| ADR-0065 | Accepted | [ADR-0065-approval-renewal-and-emergency-access-workflows.md](./architecture/adr/ADR-0065-approval-renewal-and-emergency-access-workflows.md) |
| ADR-0066 | Accepted | [ADR-0066-audit-retention-and-traceability.md](./architecture/adr/ADR-0066-audit-retention-and-traceability.md) |
| ADR-0067 | Accepted | [ADR-0067-spfx-boundary-and-hosting-integration.md](./architecture/adr/ADR-0067-spfx-boundary-and-hosting-integration.md) |
| ADR-0068 | Accepted | [ADR-0068-performance-baseline-and-startup-budgets.md](./architecture/adr/ADR-0068-performance-baseline-and-startup-budgets.md) |
| ADR-0069 | Accepted | [ADR-0069-testing-strategy-and-validation-matrix.md](./architecture/adr/ADR-0069-testing-strategy-and-validation-matrix.md) |
| ADR-0070 | Accepted | [ADR-0070-phase-5-final-release-gating-and-sign-off.md](./architecture/adr/ADR-0070-phase-5-final-release-gating-and-sign-off.md) |
| ADR-0071 | Accepted | [ADR-0071-phase-5-documentation-package-and-release-sign-off.md](./architecture/adr/ADR-0071-phase-5-documentation-package-and-release-sign-off.md) |
| ADR-0072 | Accepted | [ADR-0072-phase-5-final-acceptance-criteria-and-sign-off.md](./architecture/adr/ADR-0072-phase-5-final-acceptance-criteria-and-sign-off.md) |
| ADR-PH5C-01 | Accepted | [ADR-PH5C-01-dev-auth-bypass.md](./architecture/adr/ADR-PH5C-01-dev-auth-bypass.md) |
| ADR-0073 | Accepted | [ADR-0073-phase-5c-final-verification-and-sign-off.md](./architecture/adr/ADR-0073-phase-5c-final-verification-and-sign-off.md) |
| ADR-0074 | Accepted | [ADR-0074-shimmer-utility-convention.md](./architecture/adr/ADR-0074-shimmer-utility-convention.md) |
| ADR-0075 | Accepted | [ADR-0075-dev-auth-bypass-storybook-boundary.md](./architecture/adr/ADR-0075-dev-auth-bypass-storybook-boundary.md) |
| ADR-0076 | Accepted | [ADR-0076-project-identifier-model.md](./architecture/adr/ADR-0076-project-identifier-model.md) |
| ADR-0077 | Accepted | [ADR-0077-provisioning-package-boundary.md](./architecture/adr/ADR-0077-provisioning-package-boundary.md) |
| ADR-0078 | Accepted | [ADR-0078-security-managed-identity.md](./architecture/adr/ADR-0078-security-managed-identity.md) |
| ADR-0079 | Accepted | [ADR-0079-shared-feature-packages.md](./architecture/adr/ADR-0079-shared-feature-packages.md) |
| ADR-0080 | Accepted | [ADR-0080-bic-next-move-platform-primitive.md](./architecture/adr/ADR-0080-bic-next-move-platform-primitive.md) |
| ADR-0081 | Accepted | [ADR-0081-complexity-dial-platform-primitive.md](./architecture/adr/ADR-0081-complexity-dial-platform-primitive.md) |
| ADR-0082 | Accepted | [ADR-0082-sharepoint-docs-pre-provisioning-storage.md](./architecture/adr/ADR-0082-sharepoint-docs-pre-provisioning-storage.md) |
| ADR-0083 | Accepted | [ADR-0083-release-readiness-taxonomy.md](./architecture/adr/ADR-0083-release-readiness-taxonomy.md) |
| ADR-0084 | Accepted | [ADR-0084-current-state-governance-model.md](./architecture/adr/ADR-0084-current-state-governance-model.md) |
| ADR-0085 | Accepted | [ADR-0085-test-governance-normalization.md](./architecture/adr/ADR-0085-test-governance-normalization.md) |
| ADR-0088 | Accepted | [ADR-0088-hbc-theme-context.md](./architecture/adr/ADR-0088-hbc-theme-context.md) |
| ADR-0089 | Accepted | [ADR-0089-fluent-tokens-over-hbc-constants.md](./architecture/adr/ADR-0089-fluent-tokens-over-hbc-constants.md) |
| ADR-0090 | Accepted | [ADR-0090-signalr-per-project-groups.md](./architecture/adr/ADR-0090-signalr-per-project-groups.md) |
| ADR-0091 | Accepted | [ADR-0091-phase-7-final-verification.md](./architecture/adr/ADR-0091-phase-7-final-verification.md) |
| ADR-0094 | Accepted | [ADR-0094-versioned-record-platform-primitive.md](./architecture/adr/ADR-0094-versioned-record-platform-primitive.md) |
| ADR-0095 | Accepted | [0095-stub-detection-enforcement-standard.md](./architecture/adr/0095-stub-detection-enforcement-standard.md) |
| ADR-0096 | Accepted | [ADR-0096-field-annotations-platform-primitive.md](./architecture/adr/ADR-0096-field-annotations-platform-primitive.md) |
| ADR-0097 | Accepted | [ADR-0097-workflow-handoff-platform-primitive.md](./architecture/adr/ADR-0097-workflow-handoff-platform-primitive.md) |
| ADR-0098 | Accepted | [ADR-0098-data-seeding-import-primitive.md](./architecture/adr/ADR-0098-data-seeding-import-primitive.md) |
| ADR-0099 | Accepted | [0099-notification-intelligence-tiered-model.md](./architecture/adr/0099-notification-intelligence-tiered-model.md) |
| ADR-0100 | Accepted | [ADR-0100-smart-empty-state-platform-primitive.md](./architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md) |
| ADR-0101 | Accepted | [ADR-0101-session-state-offline-persistence.md](./architecture/adr/ADR-0101-session-state-offline-persistence.md) |
| ADR-0102 | Accepted | [ADR-0102-project-canvas-role-based-dashboard.md](./architecture/adr/ADR-0102-project-canvas-role-based-dashboard.md) |
| ADR-0103 | Accepted | [0103-related-items-unified-work-graph.md](./architecture/adr/0103-related-items-unified-work-graph.md) |
| ADR-0104 | Accepted | [ADR-0104-ai-assist-azure-foundry-integration.md](./architecture/adr/ADR-0104-ai-assist-azure-foundry-integration.md) |
| ADR-0106 | Accepted | [ADR-0106-admin-intelligence-layer.md](./architecture/adr/ADR-0106-admin-intelligence-layer.md) |
| ADR-0107 | Accepted | [ADR-0107-estimating-bid-readiness-signal.md](./architecture/adr/ADR-0107-estimating-bid-readiness-signal.md) |
| ADR-0108 | Accepted | [ADR-0108-bd-score-benchmark-ghost-overlay.md](./architecture/adr/ADR-0108-bd-score-benchmark-ghost-overlay.md) |
| ADR-0109 | Accepted | [ADR-0109-bd-heritage-living-strategic-intelligence.md](./architecture/adr/ADR-0109-bd-heritage-living-strategic-intelligence.md) |
| ADR-0110 | Accepted | [ADR-0110-project-health-pulse-multi-dimension-indicator.md](./architecture/adr/ADR-0110-project-health-pulse-multi-dimension-indicator.md) |
| ADR-0111 | Accepted | [ADR-0111-health-indicator-readiness-primitive-runtime.md](./architecture/adr/ADR-0111-health-indicator-readiness-primitive-runtime.md) |
| ADR-0112 | Accepted | [ADR-0112-score-benchmark-primitive-runtime.md](./architecture/adr/ADR-0112-score-benchmark-primitive-runtime.md) |
| ADR-0113 | Accepted | [ADR-0113-strategic-intelligence-primitive-runtime.md](./architecture/adr/ADR-0113-strategic-intelligence-primitive-runtime.md) |
| ADR-0114 | Accepted | [ADR-0114-resolve-score-benchmark-post-bid-autopsy-circular-dependency.md](./architecture/adr/ADR-0114-resolve-score-benchmark-post-bid-autopsy-circular-dependency.md) |
| ADR-0115 | Accepted | [ADR-0115-my-work-feed-architecture.md](./architecture/adr/ADR-0115-my-work-feed-architecture.md) |

## Reference Documents

- [Platform Primitives Registry](./reference/platform-primitives.md) — Tier-1 shared-feature packages: policy, decision tree, adoption matrix, and non-duplication rule
- [Package Testing Matrix](./reference/package-testing-matrix.md) — P1 package test governance: environments, coverage thresholds, CI jobs
- [UI Kit Complexity Sensitivity](./reference/ui-kit/complexity-sensitivity.md) — Complexity Dial sensitivity configuration reference
- [Release-Readiness Taxonomy](./reference/release-readiness-taxonomy.md) — Three-level readiness vocabulary and usage rules
- [Release Sign-Off Template](./architecture/release/release-signoff-template.md) — Staged sign-off model for phase releases
- [Estimating Bid Readiness API](./reference/estimating/api.md) — SF18 adapter-over-primitive API contracts and testing exports
- [Estimating Bid Readiness Adoption Guide](./how-to/developer/estimating-bid-readiness-adoption-guide.md) — Integration and validation guidance for downstream consumers
- [BD Score Benchmark API](./reference/bd-score-benchmark/api.md) — SF19 primitive + adapter API contracts and testing exports
- [BD Score Benchmark Adoption Guide](./how-to/developer/bd-score-benchmark-adoption-guide.md) — Integration and validation guidance for downstream consumers
- [BD Heritage Strategic Intelligence API](./reference/bd-heritage-strategic-intelligence/api.md) — SF20 primitive + adapter API contracts and testing exports
- [BD Heritage Strategic Intelligence Adoption Guide](./how-to/developer/bd-heritage-strategic-intelligence-adoption-guide.md) — Integration and validation guidance for downstream consumers
- [My Work Feed API](./reference/my-work-feed/api.md) — SF29 multi-source aggregation feed API contracts and testing exports
- [My Work Feed Adoption Guide](./how-to/developer/my-work-feed-adoption-guide.md) — Integration and validation guidance for downstream consumers
- [Native Integration Backbone Implementation Guide](./how-to/developer/native-integration-backbone-implementation-guide.md) — Implementation and adoption guide for the integration-driven data layer, publication boundary, and downstream consumer model

### Provisioning Reference

- [Site Template Specification](./reference/provisioning/site-template.md) — Core libraries, template file manifest, add-on packs, department pruning model, and template versioning scheme
- [Saga Steps Reference](./reference/provisioning/saga-steps.md) — Step-by-step provisioning saga contract with idempotency and compensation details
- [Entra ID Group Model](./reference/provisioning/entra-id-group-model.md) — Three-group permission model (Leaders/Team/Viewers), naming conventions, initial membership, and Graph API scope
- [Notification Event Matrix](./reference/provisioning/notification-event-matrix.md) — 8-event provisioning notification contract, recipient resolution, and pipeline integration pattern

### Data Model Reference

- [PID Field Contract](./reference/data-model/pid-contract.md) — PID relational column specification and alignment rationale for all G2 workflow-family lists
- [Workflow-Family Ownership Map](./reference/data-model/workflow-family-map.md) — G2 workflow family ownership matrix, parent/child structures, and cross-reference rules
- [Workflow List Schemas](./reference/data-model/workflow-list-schemas.md) — Consolidated G2 list schema reference (scaffold; populated by T02–T06)

### Configuration Reference

- [Wave 0 Config Registry](./reference/configuration/wave-0-config-registry.md) — Two-bucket governance model, complete environment variable registry, environment separation matrix, and fail-fast validation reference
- [Sites.Selected Validation](./reference/configuration/sites-selected-validation.md) — Permission model validation (Sites.Selected vs. FullControl fallback), staging test cases, IT/Security engagement template, and G2 entry condition matrix

### Auth & Shell Reference

- [Architecture Contracts](./reference/auth-shell-architecture-contracts.md)
- [Governance and Policies](./reference/auth-shell-governance-and-policies.md)
- [Store Contracts and State Diagrams](./reference/auth-shell-store-contracts-and-state-diagrams.md)
- [Provider Adapter and Runtime Modes](./reference/auth-shell-provider-adapter-and-runtime-modes.md)
- [Deferred Scope Roadmap](./reference/auth-shell-deferred-scope-roadmap.md)
- [Validation and Release Package](./reference/auth-shell-validation-and-release-package.md)

## Document Classification System

All HB Intel architecture documents are classified to prevent confusion between present truth, active plans, historical context, and deferred scope. The authoritative classification matrix lives in **[§2 of the Current-State Architecture Map](./architecture/blueprint/current-state-map.md#2-document-classification-matrix)**.

**Six classes are in use:**

| Class | What it means | Where to find it |
|-------|--------------|-----------------|
| **Canonical Current-State** | What the repo currently contains — governs present truth | `current-state-map.md`, `docs/README.md` |
| **Canonical Normative Plan** | What must be built next in an active phase | Blueprint V4, MVP/Wave 0 plans (`plans/MVP/`), PH7.13 stub enforcement, PH7 domain plans (pending Wave 1) |
| **Historical Foundational** | Completed phase planning; locked for audit trail | PH4–PH6 plans, Foundation Plan, SF01–SF03 shared-feature plans |
| **Deferred Scope** | Planned work assigned to a future phase but not yet activated | SF04–SF06 plans (~19 docs), PH7-RM-* plans (9 files, assigned to Phase 3), SF16 plans (Phase 5) |
| **Superseded / Archived Reference** | Replaced by a newer document or approach | Old PH7 root-level plans (deleted from git index) |
| **Permanent Decision Rationale** | Locked architectural decisions — ADRs | `docs/architecture/adr/` (76 indexed; see §2.2 for catalog conflict detail) |

**Living Reference (Diátaxis)** is used for the 200+ operational docs in the Diátaxis quadrant tree (`tutorials/`, `how-to/`, `reference/`, `explanation/`, etc.). These are classified by their quadrant placement — no inline banner needed.

**Reading order for a given topic:**
1. Start with `current-state-map.md` (Canonical Current-State) — what exists today.
2. Consult the active execution plans in `plans/MVP/` (Canonical Normative Plan) — the current implementation baseline.
   - For Phase 1 planning deliverables (schemas, contracts, test plans), see `plans/MASTER/phase-1-deliverables/`.
3. If historical context is needed, check completed phase plans PH4–PH6, the Foundation Plan, or `ph7-remediation/` PH7.1–PH7.12 (signed off 2026-03-09) (Historical Foundational).
4. For locked decisions, check `docs/architecture/adr/` (Permanent Decision Rationale).
5. Ignore Deferred Scope and Superseded documents for current implementation work.

Tier 1 inline banners appear immediately below the H1 title of high-risk documents that could be misread as authoritative current-state when they are not. All other documents are classified by their row in the §2 matrix.

## Conventions

- All files are Markdown, version-controlled, and updated with every code change ("Docs as code")
- Every significant architectural decision gets an ADR in `architecture/adr/`
- Documentation is a mandatory deliverable of every implementation phase
