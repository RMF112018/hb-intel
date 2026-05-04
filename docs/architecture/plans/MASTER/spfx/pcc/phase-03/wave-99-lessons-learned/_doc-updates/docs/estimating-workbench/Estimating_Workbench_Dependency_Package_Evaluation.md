# Estimating Workbench Dependency Package Evaluation
## Wave 13G Authority Lock

All Estimating Workbench documentation, UX/wireframe framing, dependency evaluation, model contracts, SharePoint schema contracts, SPFx surface contracts, read-model/command contracts, test gates, and subsequent runtime implementation prompts are governed under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

The wireframe authority path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/
```

The developer-contract target path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

This Wave 13G authority supersedes any earlier implication that Estimating Workbench implementation work should move to a separate future wave. Future implementation may be split into 13G sub-prompts or phases, but it remains under Wave 13G unless a later approved architecture decision explicitly supersedes this path.

Wave 13G documentation and prompts do not, by themselves, authorize production rollout, tenant mutation, package installation, lockfile mutation, Procore/Sage writeback, or active project workbook import.

```json
{
  "decision": "documentation package includes compatible dependency candidates, but documentation update prompts must not install packages or mutate pnpm-lock.yaml",
  "repoConfirmedExisting": [
    {
      "package": "@pnp/queryable",
      "repoStatus": "present in root devDependencies",
      "use": "PnP ecosystem foundation for future SharePoint fluent API"
    },
    {
      "package": "@playwright/test",
      "repoStatus": "present",
      "use": "hosted/visual/e2e validation"
    },
    {
      "package": "vitest",
      "repoStatus": "present root and PCC app",
      "use": "unit and contract tests"
    },
    {
      "package": "@testing-library/react",
      "repoStatus": "present in apps/project-control-center",
      "use": "component tests"
    },
    {
      "package": "typescript",
      "repoStatus": "present",
      "use": "strict model contracts"
    },
    {
      "package": "prettier",
      "repoStatus": "present",
      "use": "doc/json formatting gate"
    }
  ],
  "candidatePackages": [
    {
      "package": "@pnp/sp",
      "status": "adopt_after_dependency_gate",
      "why": "type-safer fluent SharePoint list API and batching; pairs with existing @pnp/queryable",
      "guardrails": [
        "selective imports only",
        "document no-SLA/open-source support caveat",
        "bundle impact review"
      ]
    },
    {
      "package": "@tanstack/react-table",
      "status": "adopt_after_ui_prototype_gate",
      "why": "headless table/grid model, strong TypeScript support, works with React 18",
      "guardrails": [
        "must pair with virtualization",
        "not a spreadsheet engine",
        "wrap in HB UI components"
      ]
    },
    {
      "package": "@tanstack/react-virtual",
      "status": "adopt_with_react_table",
      "why": "virtualized rows/columns for large estimate line-item grids",
      "guardrails": [
        "required for line-item grids over 500 rows",
        "test scroll/focus/accessibility"
      ]
    },
    {
      "package": "@fluentui/react-components",
      "status": "use_only_through_ui_kit_or_after_ui_architecture_approval",
      "why": "Microsoft Fluent UI React components; compatible with SharePoint/M365 visual language",
      "guardrails": [
        "prefer @hbc/ui-kit wrappers",
        "avoid direct duplicate design-system dependency if ui-kit already owns components"
      ]
    },
    {
      "package": "zod",
      "status": "optional_after_model_validation_gate",
      "why": "runtime validation and type inference for command payloads/forms",
      "guardrails": [
        "do not duplicate package-model contracts",
        "lock patch/minor strategy"
      ]
    },
    {
      "package": "ajv",
      "status": "adopt_for_reference_json_validation_tooling_if_json_schema_added",
      "why": "JSON Schema validation with TypeScript utilities",
      "guardrails": [
        "dev/tooling first, not UI runtime"
      ]
    },
    {
      "package": "exceljs",
      "status": "adopt_for_server_or_tooling_exports_after_export_poc",
      "why": "Excel workbook generation/export and workbook management",
      "guardrails": [
        "do not use for active workbook import MVP",
        "validate browser bundle impact"
      ]
    },
    {
      "package": "xlsx",
      "status": "evaluate_for_template_migration_tooling_only",
      "why": "SheetJS CE can parse spreadsheet data for template migration; Apache-2.0",
      "guardrails": [
        "security/staleness review",
        "no active-project import",
        "do not rely on formula evaluation"
      ]
    },
    {
      "package": "hyperformula",
      "status": "defer_license_gate",
      "why": "headless spreadsheet formula engine with Excel-like functions",
      "guardrails": [
        "GPLv3/proprietary license decision required",
        "not MVP default",
        "no install until legal/license approval"
      ]
    },
    {
      "package": "fast-check",
      "status": "adopt_as_dev_dependency_for_property_tests_if_implementation_adds_new validation utilities",
      "why": "property-based testing can stress line-item calculations and handoff invariants",
      "guardrails": [
        "devDependency only",
        "seeded deterministic tests"
      ]
    }
  ]
}
```
