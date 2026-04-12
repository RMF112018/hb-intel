# Search, Discovery, and Trust Model

## Objective

Ensure the application is faster to use than the current document-library experience while preserving the sense that users are entering a governed operating system, not a raw document search experience.

## Discovery model

MVP uses an equal blend of:

- structured browse
- search/command

Browse should remain strong.
Search should remain prominent.

## Search-first principles

- packages rank before source files
- users should land in governed context first
- child packages may appear independently where designated
- source items should appear inside package context whenever possible

## Public browse dimensions

Public browse should support:

- role
- lifecycle stage
- corridor package
- supporting package
- promoted child standard

## Search result priority

Recommended default order:

1. corridor packages
2. promoted child packages
3. relevant supporting packages
4. nested child packages
5. source items nested beneath their package context

## Suggested filters/facets

- role
- lifecycle stage
- package type
- supporting domain
- source item type
- freshness/trust status

## Command layer behavior

The command/search bar should support:

- package names
- common operational terms
- source item types
- likely user intent phrases
- role/scenario shortcuts where practical

Examples of likely future patterns:

- startup checklist
- turnover matrix
- buyout log
- OAC agenda
- superintendent startup
- financial reporting template
- legal notice form

## Trust model

Trust must be visible enough to increase confidence, but not so heavy that the public app feels administrative.

Recommended public trust markers:

- Published status
- Effective date
- Last reviewed date
- Primary advisory owner
- caution label when linked sources need review

## Stale-source handling

Public behavior:

- stale source items remain visible
- stale items display visible caution/review-needed labeling
- users are not silently blocked from seeing them

Companion behavior:

- freshness warnings surfaced prominently
- publish/keep-live allowed through explicit central override
- override reasons stored internally

## File consumption behavior

Hybrid by file type.

Suggested classification logic:

- preview-friendly narrative reference -> in-app preview when useful
- active tracker/template -> native open
- form requiring editing/completion -> native open
- complex Excel workbook -> native open
- short narrative PDF -> preview first when beneficial

## No personalization rule

Search and discovery should not depend on personal preferences, pins, or saved dashboards in MVP.
The system should remain standardized and centrally governed.

## Signals to capture for improvement

Public-side signals:

- package views
- search terms
- zero-result searches
- abandoned search paths
- source-item open behavior
- feedback submissions

Companion-side signals:

- packages receiving the most feedback
- packages frequently found through search rather than browse
- areas with repeated no-result or low-confidence searches
- stale-package concentration
- coverage gaps by role/stage/corridor
