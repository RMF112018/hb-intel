# Wave 16 Wireframes — Control Center Settings

## Purpose

Canonical wireframe index and UX contract reference for Wave 16 Control Center Settings.

## Scope Posture

- Wireframe and UX contract documentation only.
- Developer-ready UX-state workflow specification, not runtime implementation.
- No authorization for runtime/source/package/manifest/tenant/provisioning/live integration mutations.

## Screen Index

- `00_Wireframe_Index.md`
- `01_Settings_Home.md`
- `02_Category_Landing.md`
- `03_Settings_Table.md`
- `04_Setting_Detail_Drawer.md`
- `05_Change_Request_Drawer.md`
- `06_Approval_Handoff_Panel.md`
- `07_Audit_History.md`
- `08_Validation_Health.md`
- `09_Role_Visibility_Matrix.md`
- `10_Feature_Module_Flags.md`
- `11_External_Systems_Configuration.md`
- `12_Security_Secret_References.md`
- `13_HBI_Settings.md`
- `14_Mobile_Responsive.md`

## UX Contract Essentials

Required table columns:

- Setting
- Category
- Effective Value
- Effective Source
- Owner
- Validation
- Approval
- Last Updated
- Actions

Required drawer sections:

- Header
- Effective value
- Ownership
- Validation
- Edit policy
- Dependencies
- Audit preview
- HBI explanation
- Footer actions

Accessibility requirements:

- Keyboard focus returns to trigger after drawer/dialog close.
- Modal dialogs trap focus.
- Do not nest dialogs.
- Inline errors appear close to affected fields.
- Color is not the only status cue.
- Tables use accessible headers.

Test hook requirement:

- Include `data-pcc-settings-*` selectors for test automation.

## Boundary Statement

This wireframe set is documentation governance only and does not authorize runtime or tenant mutation.
