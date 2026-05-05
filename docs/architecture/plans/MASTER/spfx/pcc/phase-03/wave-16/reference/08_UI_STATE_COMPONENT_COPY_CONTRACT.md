# 08 — UI State / Component / Copy Contract

## Component Tree Target

```text
PccControlCenterSettingsSurface
  SettingsSurfaceHeader
  SettingsHomeSummaryCards
  SettingsCategoryRailOrGrid
  SettingsToolbar
    SearchInput
    CategoryFilter
    ValidationFilter
    ApprovalFilter
    SourceOwnerFilter
  SettingsTable
    SettingsTableRow
    SettingsActionsMenu
  SettingDetailDrawer
    EffectiveValueSection
    OwnershipSection
    ValidationSection
    EditPolicySection
    DependencySection
    AuditPreviewSection
    HbiExplanationSection
    DrawerFooterActions
  ChangeRequestDrawer
  ApprovalHandoffPanel
  AuditHistoryPanel
  ValidationHealthPanel
  RoleVisibilityMatrixPanel
  FeatureModuleFlagsPanel
  ExternalSystemsConfigurationPanel
  SecuritySecretReferencesPanel
  HbiSettingsPanel
  SettingsMobileCards
```

## State Ownership

| State | Owner |
| --- | --- |
| Selected category | `PccControlCenterSettingsSurface` or view-model hook |
| Search query | local surface state |
| Filters | local surface state |
| Selected setting | local surface state |
| Detail drawer open/closed | local surface state |
| Change request drawer | local UI only / future-command-gated |
| Approval handoff panel | detail drawer or selected setting state |
| Audit detail row | audit panel state |
| Loading/error/degraded envelope | read-model hook / adapter |
| Mobile table-to-card mode | CSS/container query or existing PCC layout pattern |

## Table Behavior

- Default sort: blocked/warning/missing/pending approval first, then category, then display name.
- Search fields: setting display name, setting key, category, owner, source, validation status.
- Required columns: Setting, Category, Effective Value, Effective Source, Owner, Validation, Approval, Last Updated, Actions.
- Actions menu must show disabled actions with reasons.
- Table must provide accessible headers.
- For mobile, render cards rather than horizontal-scroll-only table when space is constrained.

## Drawer Behavior

- Detail drawer opens from row action or row activation.
- Focus moves to drawer heading or first meaningful static element.
- Escape closes drawer.
- Close returns focus to triggering row/action.
- Do not nest modal dialogs.
- If change request drawer is opened from detail drawer, either replace the panel or use a non-nested panel pattern consistent with repo UI conventions.
- Sticky footer actions are allowed on mobile.
- Color must not be the only status cue.

## Test Hook Map

| Element | Test Hook |
| --- | --- |
| Surface root | `data-pcc-settings-surface` |
| Header | `data-pcc-settings-header` |
| Summary card | `data-pcc-settings-summary-card` |
| Category card | `data-pcc-settings-category-card` |
| Table | `data-pcc-settings-table` |
| Table row | `data-pcc-settings-row` |
| Detail drawer | `data-pcc-settings-detail-drawer` |
| Change request drawer | `data-pcc-settings-change-request-drawer` |
| Approval handoff panel | `data-pcc-settings-approval-handoff` |
| Audit panel | `data-pcc-settings-audit-history` |
| Validation panel | `data-pcc-settings-validation-health` |
| Role matrix | `data-pcc-settings-role-matrix` |
| Secret references | `data-pcc-settings-secret-references` |
| HBI panel | `data-pcc-settings-hbi-policy` |
| Disabled reason | `data-pcc-settings-disabled-reason` |
| Redacted value | `data-pcc-settings-redacted-value` |

## Copy Catalog

| Situation | Required Copy |
| --- | --- |
| Preview/future command | `This action is designed for a future backend command and is not enabled in this wave.` |
| Read-only source-owned | `This setting is owned by its source system. PCC displays the effective posture only.` |
| Approval required | `Changes to this setting require approval before they can take effect.` |
| Admin verification | `IT or PCC Admin verification is required before this change can take effect.` |
| Secret reference | `Secret reference configured. Secret values are never displayed in PCC.` |
| No access | `Restricted by policy for your role.` |
| Backend unavailable | `Settings services are unavailable. Showing degraded settings posture.` |
| Validation blocked | `Validation blocked this setting. Resolve the listed issue before requesting a change.` |
| HBI refusal | `I cannot reveal, change, approve, or bypass protected settings. I can explain the current posture using available sources.` |
| Empty state | `No settings match the current filters.` |
| Missing config | `Required configuration is missing or incomplete.` |

## Mobile Rules

- At tablet/phone breakpoints, table rows become stacked setting cards.
- The first visible card fields: Setting, Effective Value, Validation, Approval, Owner.
- Secondary fields collapse into details.
- Filters become a compact drawer or stacked control group.
- Detail drawer becomes full-screen panel if needed.
- Footer actions remain visible but disabled actions must still show reasons.
