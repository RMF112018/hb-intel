# Core vs Extended Scope Recommendation

## 1. Minimum viable integration model

### Included
- company
- project
- user
- vendor
- WBS / cost codes / sub jobs
- budget views current + snapshots
- change events
- budget changes
- commitments + line items
- requisitions
- direct costs
- prime contracts + owner invoices
- RFIs
- submittals
- observations
- punch items
- incidents
- current project KPI snapshots

### Excluded / deferred
- drawings and specifications metadata
- meetings, forms, correspondence
- inspections/checklist items
- daily logs segmented detail
- timecards and production quantities
- workflows
- equipment / telematics
- coordination issues

### Analytical value
High immediate value for:
- cost/change exposure
- portfolio health
- issue burden
- executive dashboards

### Complexity
Moderate

### Best-fit use cases
- executive dashboards
- PX portfolio reviews
- cost/change benchmarking
- high-level project health

## 2. Recommended practical model

### Included
Everything in minimum viable, plus:
- correspondences
- meetings
- forms
- inspections/checklists + items
- daily log headers + key segmented detail
- timecard entries
- actual production quantities
- drawings/specifications/document metadata
- workflow instances/activity
- project roles / permission / responsibility bridges

### Excluded / deferred
- full binary sync of documents
- telematics/gps
- niche alert/environmental resources
- rarely used configuration helpers

### Analytical value
Very high.
Supports:
- operational drilldown
- document/field/quality/cost correlations
- PM/PX dashboards
- approval bottleneck analysis
- labor-to-budget analytics

### Complexity
High but pragmatic

### Best-fit use cases
- full project control center
- cross-project performance benchmarking
- operational portfolio analytics
- PM/Supt/PX role-based intelligence

## 3. Full strategic enterprise model

### Included
Everything in recommended practical, plus:
- coordination issues and activity history
- action plans and change histories
- equipment utilization and maintenance
- equipment project assignment
- telematics/gps where available and valuable
- broader workflow template/manager metadata
- extended document upload / markup plumbing
- additional compliance and environmental resources
- deeper custom-field and fieldset governance layers
- raw payload archival and replay framework

### Analytical value
Maximum long-term extensibility and digital twin readiness.

### Complexity
Very high

### Risks
- overbuilding before user adoption
- storage and governance sprawl
- more fragile initial sync if too many lower-value domains are included too early

### Best-fit use cases
- enterprise data platform
- broad self-perform and equipment analytics
- advanced VDC / coordination intelligence
- AI/agentic reasoning on project operations

## Recommendation
Start with the **Recommended practical model**.
It preserves the relational structures that matter most, creates strong executive value quickly, and still supports future expansion into richer field/equipment/document domains.