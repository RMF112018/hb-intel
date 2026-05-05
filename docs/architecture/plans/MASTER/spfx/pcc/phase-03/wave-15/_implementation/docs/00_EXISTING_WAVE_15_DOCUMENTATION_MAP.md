# Existing Wave 15 Documentation Map

## Canonical Wave 15 Identity

- Phase: PCC Phase 3
- Wave: 15
- Feature name: `External Systems Launch Pad`
- Internal module/domain posture: `External Systems`
- User-facing purpose: governed external-system access, project-specific launch links, mapping visibility, source-health posture, review queues, audit visibility, and HBI source-lineage explanation.

## Canonical Blueprint Paths

The implementation agent must verify these paths locally before editing runtime files:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_External_Systems_Launch_Pad_Target_Architecture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_System_Of_Record_And_Source_Lineage.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_HBCentral_Schema_Audit.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Field_Level_Data_Contracts.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_SharePoint_Storage_And_Indexing_Posture.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Wave14_And_Priority_Actions_Handoff.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Security_Secrets_Audit_And_HBI_Guardrails.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_Dependency_Package_And_Test_Strategy.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/Wave_15_TODO_NonBlocking_Items.md
```

## Canonical SharePoint Schema Paths

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/pcc-external-system-definitions.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/pcc-external-url-policy-registry.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/pcc-project-external-launch-links.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/pcc-project-external-system-mappings.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/pcc-external-object-references.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/pcc-external-review-items.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/pcc-external-system-health-snapshots.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/pcc-external-system-audit-events.md
```

## Canonical Wireframe Paths

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/README.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/01_launch_pad_home.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/02_project_launch_links.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/03_add_edit_project_link_drawer.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/04_custom_link_review_queue.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/05_external_system_registry.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/06_mapping_source_health.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/07_mapping_review_detail.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/08_audit_history.md
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/wireframes/09_hbi_source_lineage_panel.md
```

## Canonical Plan / Artifact Paths

```text
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/README.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/Prompt_07_Final_Wave15_Closeout_And_Auditor_Handoff.md
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_system_registry_contract.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_url_policy_contract.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_system_degraded_state_matrix.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_system_role_action_matrix.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/external_system_audit_event_taxonomy.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/hbi_allowed_refused_behavior.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/sharepoint_list_schemas.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/sharepoint_index_strategy.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/validation_gates.json
docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-15/artifacts/wave15_scope_boundary_matrix.json
```

## Important Disposition Notes

- Prompt 07 final closeout states no runtime feature completion is claimed.
- Prompt 07 final closeout states no runtime/source changes, no package/lockfile changes, no manifest/version bump, no tenant mutation, and no live integration execution were performed.
- Prompt 05/05R wireframes are implementation guidance, not authorization for write endpoints.
- Prompt 06 security/HBI/dependency artifacts are governance contracts, not runtime authorization.
- `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-15/sharepoint-schemas/README.md` is the canonical schema overview. The older package-source file `docs/06_SharePoint_List_Schema_Overview.md` may exist only in `_doc-updates` and should not be treated as the promoted canonical path.

## Implementation Relevance

The current runtime must be treated as incomplete for Wave 15. Existing external-system runtime is older preview behavior and must be extended, not assumed finished.
