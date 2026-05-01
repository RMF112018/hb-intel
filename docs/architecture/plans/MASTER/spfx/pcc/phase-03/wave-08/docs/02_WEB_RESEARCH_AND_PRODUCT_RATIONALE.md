# Web Research and Product Rationale

### 3.1 Research source list

The following public sources informed this package. The local code agent does not need to browse these sources before implementation unless repo truth has changed or the user requests a refresh.

| Topic | Source | URL |
| --- | --- | --- |
| Construction safety program readiness | OSHA — Construction Management Industry / Safety and Health Programs | https://www.osha.gov/cmaa/safety-health-programs |
| Construction safety program elements | OSHA — Construction eTool / Safety and Health Program | https://www.osha.gov/etools/construction/safety-health-program |
| Hazard identification and inspection documentation | OSHA — Hazard Identification and Assessment | https://www.osha.gov/safety-management/hazard-identification |
| Hazard prevention/control and nonroutine work | OSHA — Hazard Prevention and Control | https://www.osha.gov/safety-management/hazard-prevention |
| Job Hazard Analysis | OSHA 3071 — Job Hazard Analysis | https://obis.osha.gov/Publications/osha3071.html |
| Front-end planning / project definition readiness | Construction Industry Institute — PDRI Overview | https://www.construction-institute.org/resources/knowledgebase/pdri-overview |
| PDRI building projects | Construction Industry Institute — PDRI for Building Projects | https://www.construction-institute.org/project-definition-rating-index-for-buildings |
| Construction management standards | CMAA — Construction Management Standards of Practice | https://www.cmaanet.org/bookstore/book/construction-management-standards-practice |
| Closeout guidelines | CMAA — Project Closeout Guidelines | https://www.cmaanet.org/bookstore/book/project-closeout-guidelines |
| Substantial completion closeout responsibilities | AIA Contract Documents — G704 Instructions | https://help.aiacontracts.com/hc/en-us/articles/1500009322461-Instructions-G704-2017-Certificate-of-Substantial-Completion |
| Digital inspection/checklist patterns | Procore — Project Inspections | https://support.procore.com/products/online/user-guide/project-level/inspections |
| Inspection templates/project customization | Procore Learn — Inspections Tool | https://learn.procore.com/inspections-tool |
| Closeout document collection/turnover package | Autodesk Construction Cloud — Construction Closeout | https://construction.autodesk.com/tools/closeout |
| Construction closeout document categories | Autodesk — Construction Project Closeout Guide | https://www.autodesk.com/blogs/construction/?p=3656 |
| SharePoint governance | Microsoft Learn — SharePoint Governance Overview | https://learn.microsoft.com/en-us/sharepoint/governance-overview |
| SharePoint information architecture / metadata | Microsoft Learn — Information management and governance in SharePoint | https://learn.microsoft.com/en-us/sharepoint/governance/information-management-and-governance-in-sharepoint |
| SharePoint document management lifecycle | Microsoft Support — Overview of document management in SharePoint | https://support.microsoft.com/en-us/office/overview-of-document-management-in-sharepoint-15e6e3a3-9d35-47af-b287-13aec95d247e |
| SPFx implementation posture | Microsoft Learn — Overview of SharePoint Framework | https://learn.microsoft.com/en-us/sharepoint/dev/spfx/sharepoint-framework-overview |
| SPFx enterprise guidance | Microsoft Learn — SharePoint Framework enterprise guidance | https://learn.microsoft.com/en-us/sharepoint/dev/spfx/enterprise-guidance |
| Graph API guardrails | Microsoft Learn — Microsoft Graph throttling guidance | https://learn.microsoft.com/en-us/graph/throttling |
| Graph API best practices | Microsoft Learn — Best practices for Microsoft Graph | https://learn.microsoft.com/en-us/graph/best-practices-concept |

### 3.2 Construction readiness concepts to integrate

#### OSHA-informed safety readiness

OSHA safety-program guidance emphasizes:

- management commitment;
- worker participation;
- hazard identification and assessment;
- hazard prevention and control;
- education/training;
- program evaluation and improvement;
- communication and coordination across employers on multi-employer worksites.

Wave 8 should translate these into framework fields and UI posture, not safety runtime:

- `safetyReadinessDomain`
- `hazardIdentificationRequired`
- `controlPlanStatus`
- `trainingEvidenceStatus`
- `multiEmployerCoordinationStatus`
- `inspectionCadencePosture`
- `correctiveActionReference`
- `nonroutineWorkRiskFlag`

Wave 8 must not implement incident management, inspection execution, OSHA compliance engine behavior, or safety-system integrations.

#### CII/PDRI-informed gate readiness

CII’s PDRI framing supports a readiness framework that evaluates completeness of project definition, identifies risk factors, captures mitigation actions, and can be used repeatedly before detailed design and construction.

Wave 8 should not create a PDRI clone. It should borrow the pattern:

- readiness is not just percent complete;
- readiness should be evaluated by domain/gate;
- incomplete scope, unresolved risk, missing evidence, or unassigned mitigation should drive posture;
- repeated gate checks are more useful than one static checklist.

This supports the Wave 8 principle: **domain posture and blockers are more important than one blended global score.**

#### CMAA/AIA-informed closeout readiness

CMAA’s closeout guidance emphasizes that closeout procedures are interconnected and interdependent and that parties must understand their closeout responsibilities. AIA substantial-completion guidance reinforces clear responsibility for remaining work, maintenance, utilities, insurance, and timelines.

Wave 8 should therefore define generic fields for:

- gate impact;
- dependent readiness items;
- owner/accountable persona;
- due date;
- evidence requirement;
- approval/acknowledgement posture;
- exception/waiver state;
- closeout/turnover linkage.

Wave 8 should avoid hardcoding the closeout checklist library. Wave 9 owns the closeout-specific item library.

#### Procore/Autodesk-informed checklist and closeout patterns

Procore and Autodesk product documentation show common product patterns:

- reusable templates customized at project level;
- sections and line items;
- comments/files/evidence on checklist items;
- conforming/deficient or pass/fail status;
- reporting and visibility;
- closeout document collection, review, approval, and turnover packaging;
- project-level customization without corrupting company-level template lineage.

Wave 8 should adopt the architectural pattern, not vendor runtime:

- template definition vs project-instance state;
- source lineage;
- evidence/reference hooks;
- item status/posture;
- project overrides with audit posture;
- lifecycle data reuse after item completion.

Wave 8 must not implement Procore writeback, Procore cloning, external runtime calls, or vendor-specific APIs.

#### Microsoft 365 / SharePoint governance implications

Microsoft SharePoint governance guidance emphasizes policies, roles, responsibilities, processes, information architecture, metadata, lifecycle governance, permissions, records, and compliance. SharePoint document management guidance reinforces lifecycle control from creation/review/publishing through retention/disposition.

Wave 8 should therefore:

- keep evidence storage/linking aligned to HB Document Control Center / SharePoint project record;
- expose structured readiness metadata without forcing users into raw SharePoint edit mode;
- treat evidence links as references, not file-operation ownership;
- preserve source-of-record boundaries;
- avoid direct Graph/PnP/SharePoint REST runtime in Wave 8;
- maintain no-tenant-mutation posture.

#### SPFx and Microsoft Graph implications

Microsoft SPFx guidance establishes SPFx as a browser-executed client-side model using modern TypeScript/JavaScript tooling and responsive Microsoft 365-hosted surfaces. Microsoft Graph guidance warns that high-volume and write-heavy operations increase throttling risk and recommends backoff/retry strategies for real runtime integrations.

Wave 8 should stay safely below that threshold:

- presentational SPFx only;
- fixture-first default;
- optional backend read-only mock route only;
- no direct Graph runtime;
- no writeback;
- no polling or scanning;
- no sync/mirror behavior;
- no external-system runtime.

### 3.3 Research-informed terminology improvements

Use this vocabulary consistently in code/docs/UI:

| Term | Use | Avoid |
| --- | --- | --- |
| Project Readiness Module Framework | Technical Wave 8 framework | Checklist engine, generic workflow engine |
| Project Readiness Center | User-facing Wave 8 shell | Project Startup Checklist, Wave 9 module name |
| readiness domain | Business concern grouping | generic category when domain is intended |
| lifecycle gate | Stage-gate readiness moment | arbitrary milestone |
| readiness item | Framework item abstraction | checklist row when not checklist-specific |
| source module | Module/system that owns detail | duplicated source of truth |
| source lineage | Traceability to originating source/template/module | raw import origin only |
| evidence reference | Link/reference to evidence stored elsewhere | file upload/storage in Wave 8 |
| blocker-first posture | Critical blockers override percent complete | simple completion score |
| confidence posture | Quality/availability of supporting data | completion confidence |
| read-only framework shell | Wave 8 execution posture | workflow runtime |
| project-instance override | Project-specific change with reason/audit posture | editing global template directly |

---
