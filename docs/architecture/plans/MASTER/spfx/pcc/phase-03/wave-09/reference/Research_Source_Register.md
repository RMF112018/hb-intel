# Web Research Findings and Product Rationale

## Research Sources

The package uses public industry and official-product research to improve the Wave 9 implementation strategy. URLs are included for local-agent verification.

- OSHA — Hazard Identification and Assessment: https://www.osha.gov/safety-management/hazard-identification
- OSHA — Hazard Prevention and Control: https://www.osha.gov/safety-management/hazard-prevention
- OSHA — Multi-Employer Citation Policy: https://www.osha.gov/enforcement/directives/cpl-02-00-124
- CII — Project Definition Rating Index Overview: https://www.construction-institute.org/resources/knowledgebase/pdri-overview
- CII — PDRI for Building Projects: https://www.construction-institute.org/resources/publication/r-d-product/pdri-project-definition-rating-index-building-proj
- CMAA — Project Closeout Guidelines: https://www.cmaanet.org/bookstore/book/project-closeout-guidelines
- AIA — G704 Certificate of Substantial Completion instructions: https://help.aiacontracts.com/hc/en-us/articles/1500009322461-Instructions-G704-2017-Certificate-of-Substantial-Completion
- AIA — G706A Contractor’s Affidavit of Release of Liens summary: https://help.aiacontracts.com/hc/en-us/articles/1500009446521-Summary-G706A-1994-Contractor-s-Affidavit-of-Release-of-Liens
- Procore — Project Inspections: https://support.procore.com/products/online/user-guide/project-level/inspections
- Procore — Create a Project Level Inspection Template: https://support.procore.com/products/online/user-guide/project-level/inspections/tutorials/create-a-project-level-inspection-template
- Autodesk — Construction Project Closeout Checklist and Guide: https://www.autodesk.com/blogs/construction/?p=3656
- Microsoft — SharePoint governance overview: https://learn.microsoft.com/en-us/sharepoint/governance-overview
- Microsoft — Information management and governance in SharePoint: https://learn.microsoft.com/en-us/sharepoint/governance/information-management-and-governance-in-sharepoint
- Microsoft — Microsoft Graph throttling guidance: https://learn.microsoft.com/en-us/graph/throttling
- Microsoft — Microsoft Graph permissions overview: https://learn.microsoft.com/en-us/graph/permissions-overview
- Microsoft — SPFx property pane configuration: https://learn.microsoft.com/en-us/sharepoint/dev/spfx/web-parts/basics/integrate-with-property-pane

## Research-Informed Principles

### 1. Readiness is not checklist completion alone

CII’s PDRI framing supports evaluating completeness, risk factors, and mitigation actions before major project phase gates. Wave 9 should therefore represent gate readiness as a structured posture model with blockers, mitigation items, and source confidence—not a raw percent-complete bar.

### 2. Safety readiness needs hazard lifecycle semantics

OSHA guidance emphasizes proactive, ongoing hazard identification, periodic inspections, severity/likelihood assessment, and hazard prevention/control plans. Wave 9 safety items should be capable of recurring inspection posture, failed-item handling, corrective-action signals, and multi-employer accountability references without becoming a Safety runtime.

### 3. Multi-employer construction work requires accountability context

OSHA’s multi-employer policy distinguishes creating, exposing, correcting, and controlling employers. Wave 9 should not attempt legal determinations, but safety-readiness and risk models should have enough fields to represent owner/subcontractor/design/AHJ/external dependency blockers.

### 4. Closeout begins before closeout

CMAA and AIA closeout/substantial completion guidance support responsibility clarity, interdependent closeout procedures, completion/correction lists, occupancy/utilities/insurance responsibility, warranties, liens, and final documents. Wave 9 should surface “Future Closeout Exposure” during active construction rather than waiting until turnover.

### 5. Templates must be reusable but project-adjustable

Procore’s inspection pattern supports company/project templates, logical sections, line items, attachments, comments, permissions, and project-level customization. Wave 9 should preserve canonical source definitions while allowing project-instance overrides in fixtures/read models without mutating master template definitions.

### 6. SharePoint should remain a governed evidence system, not a raw edit surface

Microsoft SharePoint governance emphasizes policies, roles, responsibilities, processes, metadata, authoritative versions, records, search/navigation, and lifecycle governance. Wave 9 should link evidence/document requirements to HB Document Control Center and SharePoint project record posture, not force non-experts into raw SharePoint edit screens.

### 7. Live Microsoft Graph work remains inappropriate for Wave 9

Microsoft Graph throttling and least-privilege permission guidance support the repo’s no-live-runtime posture. Wave 9 should avoid polling, bulk Graph scans, high-privilege permissions, writeback, and app-only broad access.

## Product Rationale

Wave 9 should solve the user’s core problem: checklist workflows currently die inside Procore or static documents and provide limited lifecycle utility. The module should convert source checklist content into durable lifecycle controls that remain useful for PMs, PXs, Superintendents, Safety/QAQC, Accounting, and executives throughout startup, active construction, closeout, turnover, warranty, and lessons learned.
