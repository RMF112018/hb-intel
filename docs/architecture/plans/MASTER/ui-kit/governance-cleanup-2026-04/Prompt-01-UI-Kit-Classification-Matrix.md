# Prompt 01 UI-Kit Classification Matrix

Classification scope: all `docs/reference/ui-kit/*.md` plus doctrine docs in `docs/reference/ui-kit/doctrine/*.md`.

## Classification Key

- `binding doctrine`
- `runtime overlay`
- `standard`
- `pattern`
- `component reference`
- `audit/evidence`
- `historical/planning`
- `deprecated`
- `unknown`

## Matrix

| File                                                                       | Classification      | Rationale                                                                 |
| -------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------- |
| `docs/reference/ui-kit/README.md`                                          | standard            | Top-level governance index and routing standard.                          |
| `docs/reference/ui-kit/entry-points.md`                                    | standard            | Authoritative entry-point and import-policy standard.                     |
| `docs/reference/ui-kit/deprecated-tokens.md`                               | deprecated          | Explicit deprecation-oriented token reference.                            |
| `docs/reference/ui-kit/accessibility-patterns.md`                          | pattern             | Prescriptive accessibility implementation patterns.                       |
| `docs/reference/ui-kit/UI-Kit-Adaptive-Data-Surface-Patterns.md`           | pattern             | Named cross-surface pattern guidance.                                     |
| `docs/reference/ui-kit/UI-Kit-Wave1-Page-Patterns.md`                      | pattern             | Page composition pattern set.                                             |
| `docs/reference/ui-kit/Productive-Lane-Standard.md`                        | standard            | Lane-level normative standard.                                            |
| `docs/reference/ui-kit/Presentation-Lane-Standard.md`                      | standard            | Lane-level normative standard.                                            |
| `docs/reference/ui-kit/UI-System-Layer-Model.md`                           | standard            | Foundational layer model and role definitions.                            |
| `docs/reference/ui-kit/UI-Kit-Visual-Language-Guide.md`                    | standard            | Visual-language rule guidance referenced as Layer 3 authority.            |
| `docs/reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md`              | standard            | Composition rules and usage guardrails.                                   |
| `docs/reference/ui-kit/UI-Kit-Visual-Hierarchy-and-Depth-Standards.md`     | standard            | Explicit visual hierarchy standard.                                       |
| `docs/reference/ui-kit/UI-Kit-Field-Readability-Standards.md`              | standard            | Explicit readability standard.                                            |
| `docs/reference/ui-kit/UI-Kit-Mold-Breaker-Principles.md`                  | standard            | Governing principles with normative direction.                            |
| `docs/reference/ui-kit/complexity-sensitivity.md`                          | unknown             | Governance-adjacent but not clearly labeled as doctrine/standard/pattern. |
| `docs/reference/ui-kit/UI-Kit-Accessibility-Findings.md`                   | audit/evidence      | Findings/evidence artifact.                                               |
| `docs/reference/ui-kit/UI-Kit-Application-Standards-Conformance-Report.md` | audit/evidence      | Conformance report artifact.                                              |
| `docs/reference/ui-kit/UI-Kit-Competitive-Benchmark-Matrix.md`             | audit/evidence      | Benchmarking evidence matrix.                                             |
| `docs/reference/ui-kit/UI-Kit-Component-Maturity-Matrix.md`                | audit/evidence      | Maturity scoring/evidence matrix.                                         |
| `docs/reference/ui-kit/UI-Kit-Composition-Review.md`                       | audit/evidence      | Review/evidence narrative.                                                |
| `docs/reference/ui-kit/UI-Kit-Production-Readiness-Scorecard.md`           | audit/evidence      | Scorecard evidence artifact.                                              |
| `docs/reference/ui-kit/UI-Kit-Verification-Coverage-Plan.md`               | historical/planning | Validation planning artifact, not binding doctrine.                       |
| `docs/reference/ui-kit/UI-Kit-Wave1-Consumer-Map.md`                       | historical/planning | Wave-scoped planning/routing artifact.                                    |
| `docs/reference/ui-kit/UI-Kit-Release-Notes.md`                            | historical/planning | Historical changelog artifact.                                            |
| `docs/reference/ui-kit/UI-Kit-Residual-Debt-Register.md`                   | historical/planning | Debt tracking/planning register.                                          |
| `docs/reference/ui-kit/reference-audit-2026-03-06.md`                      | audit/evidence      | Dated audit evidence file.                                                |
| `docs/reference/ui-kit/homepage-webpart-benchmark.md`                      | audit/evidence      | Benchmark/evidence-oriented homepage file.                                |
| `docs/reference/ui-kit/DashboardLayout.md`                                 | component reference | Layout component usage reference.                                         |
| `docs/reference/ui-kit/ListLayout.md`                                      | component reference | Layout component usage reference.                                         |
| `docs/reference/ui-kit/WorkspacePageShell.md`                              | component reference | Shell component usage reference.                                          |
| `docs/reference/ui-kit/HbcAppShell.md`                                     | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcApprovalStepper.md`                              | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcBanner.md`                                       | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcBarChart.md`                                     | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcBottomNav.md`                                    | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcBreadcrumbs.md`                                  | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcButton.md`                                       | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcCalendarGrid.md`                                 | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcCard.md`                                         | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcChart.md`                                        | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcCommandBar.md`                                   | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcCommandPalette.md`                               | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcConfirmDialog.md`                                | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcConnectivityBar.md`                              | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcDataTable.md`                                    | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcDescriptionList.md`                              | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcDonutChart.md`                                   | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcDrawingViewer.md`                                | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcEmptyState.md`                                   | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcErrorBoundary.md`                                | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcForm.md`                                         | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcHeader.md`                                       | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcInput.md`                                        | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcKpiCard.md`                                      | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcLineChart.md`                                    | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcModal.md`                                        | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcPagination.md`                                   | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcPanel.md`                                        | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcPeoplePicker.md`                                 | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcPhotoGrid.md`                                    | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcPopover.md`                                      | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcRichTextEditor.md`                               | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcScoreBar.md`                                     | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcSearch.md`                                       | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcSegmentedControl.md`                             | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcSidebar.md`                                      | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcSpinner.md`                                      | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcStatusBadge.md`                                  | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcTabs.md`                                         | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcTearsheet.md`                                    | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcTextArea.md`                                     | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcToast.md`                                        | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcToastContainer.md`                               | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcToastProvider.md`                                | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcTooltip.md`                                      | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcTree.md`                                         | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/HbcTypography.md`                                   | component reference | Component/API reference.                                                  |
| `docs/reference/ui-kit/doctrine/README.md`                                 | historical/planning | Currently a short draft-style note, not a full doctrine index standard.   |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`    | binding doctrine    | Primary runtime governing standard for SPFx surfaces.                     |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`      | runtime overlay     | Homepage-specific overlay atop SPFx governing standard.                   |
| `docs/reference/ui-kit/doctrine/UI-Doctrine-PWA-Governing-Standard.md`     | binding doctrine    | Primary runtime governing standard for PWA surfaces.                      |

## Ambiguity Notes

- `complexity-sensitivity.md` is marked `unknown` pending explicit governance-status header in later prompts.
- `docs/reference/ui-kit/doctrine/README.md` is marked `historical/planning` because current body reads as update-note content rather than a durable doctrine map.
