# 02 – Procore Package Synthesis

## Package role
The attached Procore package is a serious design input, not implementation truth for the repo. Its main value is that it resolves the canonical-model problem in a way that is consistent with how HB Intel should treat Procore analytically.

## Canonical model shape
The package defines a layered canonical model with:
- hierarchy anchors around company and project
- conformed dimensions such as user, vendor, WBS, location, custom-field definition, department, trade, and permission-template concepts
- bridges for project-user, project-vendor, attachments, approvers, and other many-to-many joins
- financial facts and snapshots
- project-management facts
- quality/safety facts
- field-execution facts
- document metadata and revision entities
- history/snapshot recommendations
- star-schema recommendations for project health, cost/change, operational burden, and labor/productivity

## Scope variants in the package
The package separates three scope levels:

### Minimum viable integration
Best for:
- executive dashboards
- PX cost/change exposure
- issue burden and project-health views

### Recommended practical model
Adds:
- inspections/checklists
- daily-log headers and key segments
- document metadata
- workflows
- timecards / production
- project role / permission bridges

This is the package’s recommended target because it supports true project-control-center behavior without immediately overbuilding.

### Full strategic model
Adds:
- broader coordination / equipment / telemetry / deep archival / lower-frequency or higher-complexity subject areas

## Most important package constraints on implementation
The package is clear on several architecture decisions that should govern HB Intel:

1. **Do not mirror the full Procore model into SharePoint lists.**
2. **Use external raw landing plus external canonical relational storage.**
3. **Use SharePoint for curated summaries, queues, dictionaries, and collaborative experience surfaces.**
4. **Preserve native Procore IDs and lineage while issuing canonical surrogate keys.**
5. **Use snapshots for trend reporting and current-state facts for work queues.**
6. **Prioritize foundation masters, then financial core, then project-management core, then quality/safety, then field execution.**

## Fit against HB Intel
The package aligns well with the repo’s native-integration doctrine:
- backend-owned ingestion and publication
- downstream consumers using repositories/read models
- thin canonical core over direct consumer access to raw source data

The package materially changes the practical implementation plan only in one major way:
- it makes it clear that Azure Table + SharePoint alone is insufficient for the long-term Procore analytical model
- a relational canonical store is required if the integration is to be credible
