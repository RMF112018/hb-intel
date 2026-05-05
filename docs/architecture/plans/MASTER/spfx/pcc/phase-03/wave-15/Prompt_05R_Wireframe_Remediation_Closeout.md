# Prompt 05R — Wireframe Remediation Closeout

## Corrective Statement

Prompt 05R corrects Prompt 05 wireframe incompleteness. The prior canonical wireframe files existed but were skeletal summaries. Prompt 05R replaces them with developer-ready UX specifications for all nine Wave 15 External Systems Launch Pad screens.

Prompt 05R does not claim full Wave 15 package completion.

## Scope and Boundary Attestation

This closeout covers wireframe/spec depth remediation only.

Not authorized in Prompt 05R:

- runtime command endpoints,
- SharePoint writes,
- external-system writes,
- tenant mutations,
- live integration actions,
- package.json or pnpm-lock.yaml mutation,
- manifest/version bump,
- runtime/source implementation.

These artifacts remain developer-ready UX specifications, not pixel-perfect final visual designs and not runtime implementation.

## Per-Screen Acceptance Matrix

Required sections for each row: purpose, personas, layout zones, component anatomy, actions, states, role/action visibility, responsive behavior, accessibility, read-model inputs, workflow transitions, acceptance criteria.

| Screen                       | Canonical file                                                                                                        | Purpose | Personas | Layout zones | Component anatomy | Actions | States | Role/action visibility | Responsive behavior | Accessibility | Read-model inputs | Workflow transitions | Acceptance criteria | Status |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------- | -------- | ------------ | ----------------- | ------- | ------ | ---------------------- | ------------------- | ------------- | ----------------- | -------------------- | ------------------- | ------ |
| Launch Pad Home              | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/01_launch_pad_home.md`              | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |
| Project Launch Links         | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/02_project_launch_links.md`         | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |
| Add/Edit Project Link Drawer | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/03_add_edit_project_link_drawer.md` | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |
| Custom Link Review Queue     | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/04_custom_link_review_queue.md`     | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |
| External System Registry     | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/05_external_system_registry.md`     | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |
| Mapping Source Health        | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/06_mapping_source_health.md`        | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |
| Mapping Review Detail        | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/07_mapping_review_detail.md`        | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |
| Audit History                | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/08_audit_history.md`                | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |
| HBI Source-Lineage Panel     | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/09_hbi_source_lineage_panel.md`     | yes     | yes      | yes          | yes               | yes     | yes    | yes                    | yes                 | yes           | yes               | yes                  | yes                 | pass   |

Gate result: all nine rows pass; Prompt 05R completeness gate satisfied.

## Standards Inheritance Evidence

- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/README.md` updated with doctrine inheritance and boundary language.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_SPFX_UX_Wireframes_And_Project_Link_Workflows.md` updated with standards inheritance and non-authorization boundary statements.

## Deferred Scope Statement

Prompt 05R does not close or claim completion for security, HBI implementation, dependency execution, or full Wave 15 package promotion.

## Validation and Immutability Evidence

Evidence commands executed:

- repo truth snapshots (`git status --short`, `git branch --show-current`, `git rev-parse HEAD`, `git log --oneline -n 5`),
- lockfile integrity (`md5 -q pnpm-lock.yaml` before and after),
- Prettier formatting for touched markdown,
- `pnpm format:check` (with drift note if unrelated failures occur),
- docs-only diff guard.
