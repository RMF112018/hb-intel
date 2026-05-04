# Research Source Summary — Estimating Workbench

## Platform Research Applied

- Microsoft SPFx is the recommended SharePoint customization/extensibility model and supports client-side SharePoint development, SharePoint data integration, Teams/Viva extension, automatic hosting, responsive components, and standard web tooling.
- Microsoft SPFx provides `SPHttpClient` for SharePoint REST. Microsoft documents that raw REST becomes cumbersome/error-prone for complex GET/POST/batching and identifies PnPjs as a type-safer fluent alternative, while noting PnPjs is open-source/community-supported and adds dependency/bundle considerations.
- SharePoint Online supports very large lists in theory, but list view threshold/query design requires indexed columns and filtered views. Estimating line-item and bid-leveling data must be partitioned, indexed, paginated, and virtualized.
- TanStack Table is headless and works with virtualization libraries; TanStack's docs show virtualized rows and 50,000-row examples using TanStack Virtual. This fits estimate-builder grids better than a monolithic spreadsheet clone.
- Fluent UI React components are Microsoft-aligned and MIT licensed, but the repo already has `@hbc/ui-kit`; direct Fluent dependency should be introduced only through/wrapped by UI-kit architecture.
- Ajv supports JSON Schema validation and TypeScript utility types. It is a suitable dev/tooling validator for the reference JSON artifacts if JSON Schema is introduced.
- SheetJS CE can parse workbook data and is suitable only for template migration/tooling after security/staleness review; active project workbook import is explicitly not MVP scope.
- HyperFormula is a headless spreadsheet formula engine, but it requires GPLv3 or proprietary licensing. It is deferred unless HB approves a license posture.
- fast-check supports property-based testing with seeded random input generation and shrinking. It is useful as a dev dependency for validating line-item/handoff invariants if implementation adds calculation utilities.

## Source URL Artifact

See `reference/source_research_urls.json`.
