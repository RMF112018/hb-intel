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

## Conventions

- All files are Markdown, version-controlled, and updated with every code change ("Docs as code")
- Every significant architectural decision gets an ADR in `architecture/adr/`
- Documentation is a mandatory deliverable of every implementation phase
