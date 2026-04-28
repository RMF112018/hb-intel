# HB Project Control Center — Target Architecture Blueprint

**Status:** Target Architecture Draft  
**Audience:** Executive Leadership, Operations, IT, Project Executives, Project Managers, Accounting, Field Operations, Safety/QAQC, and platform implementation teams  
**Repository context:** `RMF112018/hb-intel`  
**Reference example documents:** `docs/reference/example/`  
**Prepared for:** Hedrick Brothers Construction

---

## 1. Executive Summary

The Project Control Center is the proposed standard operating surface for every construction project team site created in SharePoint. The goal is to replace inconsistent manual project-site creation, scattered project documents, and low SharePoint adoption with a governed, branded, application-like project workspace that employees open every day to manage project information, actions, responsibilities, access, documents, external system links, and project-specific workflows.

This blueprint assumes the company will continue using best-in-class construction platforms such as Procore, Sage Intacct, Compass, Document Crunch, Adobe Sign, and Cupix. The Project Control Center is not intended to replace those systems. It is intended to organize them around the project, provide a consistent project-specific SharePoint architecture, and expose the daily project workflows that currently live in Excel, PDFs, emails, disconnected file folders, or individual user habits.

The Project Control Center should be implemented as a full-page SPFx shell, similar in strategy to the existing `hb-intel-homepage` application pattern in the repo. Each project site should receive the same template, the same pages, the same libraries, the same baseline lists, the same permission model, and the same Project Control Center app surface. Project-specific configuration should be handled inside the Project Control Center UI, not through native SharePoint edit modes or manual site administration.

---

## 2. Core Business Objective

Create symmetrical, governed SharePoint team sites for construction projects that:

- maintain least-privilege access control;
- separate project information by concern and lifecycle;
- reduce large-group access failures caused by sprawling synced libraries or manual permission drift;
- eliminate manual SharePoint site creation by project teams or SharePoint admins;
- make project sites useful enough that users open them daily;
- surface project-specific tasks, documents, responsibilities, risks, and external system links in one place;
- convert current project workflow artifacts into structured, searchable, auditable project data;
- support 3–10 new project sites per week without losing standardization or governance.

---

## 3. Architectural North Star

The Project Control Center should behave like a governed business application hosted on SharePoint.

SharePoint provides:

- secure site container;
- libraries;
- lists;
- metadata;
- permissions;
- pages;
- versioning;
- Microsoft 365 integration;
- Graph-accessible data substrate.

The Project Control Center provides:

- guided user experience;
- project command center;
- module navigation;
- role-aware task views;
- settings and configuration UI;
- team and access management;
- structured forms;
- workflow status;
- readiness gates;
- external system launchers;
- project intelligence;
- site health and drift detection.

Users should not need to understand SharePoint administration to successfully operate a project site.

---

## 4. Non-Negotiable UX and Governance Requirements

### 4.1 No Native SharePoint Edit Dependency

Normal project users should not need to use:

- SharePoint page **Edit** mode;
- web part property panes;
- list settings;
- library settings;
- content type settings;
- metadata column settings;
- manual view creation;
- SharePoint site permissions screens;
- advanced permissions;
- folder/item-level permission management;
- direct list-item editing except through governed app UI.

If a normal workflow requires a user to leave the Project Control Center and use native SharePoint settings, that workflow is not complete.

### 4.2 Surface-Managed Configuration

All configuration should be available through:

1. **Control Center Settings**  
   Centralized settings experience for project-level configuration.

2. **Module-Level Settings**  
   Feature-specific settings inside each module.

Settings should use guided forms, pickers, toggles, validation messages, warnings, role gates, and safe save flows. Users should see business language, not raw SharePoint implementation details.

### 4.3 Governed Team and Access Management

Team and access management must be handled inside the Project Control Center UI, similar in intent to Procore project access management.

Authorized users should be able to:

- add a user;
- search using the people picker foundation;
- select a project role;
- select a permission template;
- confirm access;
- trigger backend validation and group assignment;
- see success/failure in plain language;
- review project team membership;
- review external access;
- submit or approve access requests.

Users should not manually manage SharePoint groups, Entra groups, or library permissions.

---

## 5. Current Repo and Platform Context

### 5.1 Existing Repo Foundations

The repo already contains several relevant architectural foundations:

- `apps/estimating/` — existing Project Setup / New Project Request surface.
- `apps/accounting/` — accounting/project finalization context.
- `apps/hb-homepage/` and/or `hb-intel-homepage` strategy — full-page shell pattern with embedded modules.
- `backend/functions/` — Azure Functions backend integration layer.
- SPFx/Vite packaging orchestration for multiple app domains.
- Existing Microsoft Graph token acquisition patterns through SPFx context.
- Existing UI kit and homepage shell design doctrine.
- Existing people-picker foundation referred to as `hb-people-picker`.
- Existing Azure/Entra application posture built around:
  - Registered Application: `HB SharePoint Creator`
  - Application ID: `08c399eb-a394-4087-b859-659d493f8dc7`
  - Function App: `hb-intel-function-app`
  - Function App domain: `hb-intel-function-app-gbd6ecgrh7fsgscm.eastus2-01.azurewebsites.net`

### 5.2 Current External Platforms

The target architecture should respect existing systems of record and provide project-aware integration/launch surfaces for:

- Procore
- Sage Intacct
- Compass
- Document Crunch
- Adobe Sign
- Cupix
- Other project-specific platforms as needed

---

## 6. Project Site Provisioning Lifecycle

### 6.1 Intake and Approval Flow

```text
New Project Request
  └─ apps/estimating/
      ├─ Estimating Coordinator input
      ├─ Lead Estimator input
      ├─ Project Executive assignment
      └─ preliminary project metadata

Accounting Finalization
  └─ apps/accounting/
      ├─ official job number
      ├─ accounting setup
      ├─ Sage Intacct mapping
      ├─ project accountant assignment
      └─ final approval to provision

Provisioning Trigger
  └─ backend/functions/
      ├─ create SharePoint Team site
      ├─ apply template
      ├─ seed lists and libraries
      ├─ create/configure groups
      ├─ assign global read-only group
      ├─ seed Project Control Center records
      ├─ install/configure SPFx shell
      ├─ validate site health
      └─ write provisioning audit
```

### 6.2 Provisioning Principles

- Every project site starts from the same governed template.
- The template should be versioned.
- Provisioning should be repeatable and idempotent where possible.
- Post-provision validation is mandatory.
- Configuration records should be seeded automatically.
- Manual SharePoint admin work should be the exception, not the normal process.
- Project users should interact with business forms and settings, not raw SharePoint infrastructure.

### 6.3 Required Provisioning Outputs

Each project site should receive:

- standard libraries;
- standard lists;
- standard metadata;
- standard permissions;
- standard navigation;
- standard pages;
- Project Control Center landing page;
- Control Center Settings data;
- Team & Access configuration;
- module registry records;
- external system mapping placeholders;
- site health record;
- template version record;
- provisioning audit trail.

---

## 7. Project Site Type and Information Architecture

### 7.1 Recommended Site Type

Use a SharePoint team site pattern suitable for project collaboration and Microsoft 365 integration. The site should be project-specific, least-privilege controlled, and provisioned with a standard template.

### 7.2 Recommended Project Site Naming

Recommended naming should be formalized during implementation, but the site URL should be stable, project-number based, and human-readable.

Example:

```text
/sites/projects-{projectNumberSlug}
```

or:

```text
/sites/p-{projectNumberSlug}-{shortProjectNameSlug}
```

Avoid names that change when a project name changes.

### 7.3 Required Project Metadata

Each project site should carry a Project Profile record with:

- Project ID
- Project Number
- Project Name
- Client / Owner
- Project Address
- Region
- Market Sector
- Delivery Method
- Contract Type
- Project Size Band
- Complexity Rating
- Project Phase
- Project Executive
- Project Manager
- Superintendent
- Project Accountant
- Estimating Coordinator
- Lead Estimator
- Safety / QAQC lead
- Start Date
- Substantial Completion Date
- Final Completion Date
- Template Version
- Provisioning Run ID
- Created Date
- Source Request ID
- External System Mapping Status

---

## 8. Full-Page Project Control Center Shell

### 8.1 Recommended Repo Target

```text
apps/project-control-center/
  Full-page SPFx shell for project team sites

apps/document-control-center/
  Reusable document/file browser module

packages/project-site-template/
  Template schema, provisioning contract, list/library/page definitions

packages/project-workflows/
  Startup, closeout, permits, inspections, responsibilities, scorecards, lessons models

backend/functions/
  Provisioning orchestration, validation, access-control APIs, integrations
```

### 8.2 Shell Structure

```text
Project Control Center
├── Project Hero / Identity
├── Priority Actions Rail
├── Today / This Week
├── Readiness & Risk Rollups
├── My Responsibilities
├── Work Center Navigation
├── Embedded Modules
├── HBI Assistant
└── Control Center Settings
```

### 8.3 Design Intent

The home page should answer:

- What project am I in?
- What requires attention today?
- What changed recently?
- What is overdue?
- What do I own?
- Where are the documents?
- Which system should I open?
- Who has access?
- What is blocking startup, construction, closeout, or turnover?
- What project risks need escalation?

---

## 9. Project Control Center Module Map

### 9.1 Core Modules

```text
Project Control Center
├── Project Home / Command Center
├── Team & Access Center
├── Document Control Center
├── Project Directory / Team Center
├── Action Center
├── Project Controls Center
├── Contract & Compliance Center
├── Drawing & Model Center
├── Field Operations Center
├── Meeting & Communication Center
├── Risk / Issues / Decision Log
├── Procurement & Buyout Center
├── Startup Center
├── Permit & AHJ Center
├── Inspection Readiness Center
├── Responsibility Matrix Center
├── Subcontractor Performance Center
├── Lessons Learned Center
├── Closeout & Warranty Center
├── HBI Assistant
└── Control Center Settings / Site Health
```

### 9.2 Relationship Between Original Architecture and Uploaded Examples

The original Project Control Center structure remains the governing architecture. The uploaded example documents add operating detail, list schemas, workflows, readiness gates, and module enhancements.

The uploaded documents are not a replacement for the original structure. They should be converted into structured modules inside the broader work centers.

---

## 10. Reference Example Documents

The following example documents are assumed to be stored in the repo at:

```text
docs/reference/example/
```

| Example Document | Primary Architecture Use |
|---|---|
| `Project_Startup_Checklist(1).pdf` | Startup Center, Contract & Compliance, Field Operations, Action Center |
| `Project_Closeout_Checklist(1).pdf` | Closeout & Warranty Center, Document Control, Risk, Action Center |
| `Permit_Log_Template.xlsx` | Permit & AHJ Center |
| `10b_20260220_RequiredInspectionsList(1).xlsx` | Inspection Readiness Center |
| `Responsibility Matrix - Template(1).xlsx` | Responsibility Matrix Center, Team & Access, Action Center |
| `Responsibility Matrix - Owner Contract Template(1).xlsx` | Contract & Obligation Center |
| `06 20260307_SOP_SubScorecard-DRAFT(1).xlsx` | Subcontractor Performance Center, Procurement & Buyout, Closeout |
| `07 20260307_SOP_LessonsLearnedReport-DRAFT(1).xlsx` | Lessons Learned Center, Best Practices, HBI knowledge base |

---

## 11. Project Home / Command Center

### 11.1 Purpose

The Project Home is the daily landing surface for all project participants. It should be useful to project executives, PMs, supers, accounting, safety, QAQC, admins, and authorized leadership.

### 11.2 Recommended Home Cards

- Project Identity
- Priority Actions
- Today / This Week
- My Responsibilities
- Startup Readiness
- Permit Readiness
- Inspection Readiness
- Closeout Readiness
- Contract Obligation Status
- Subcontractor Evaluation Status
- Lessons Learned Capture Status
- Recent Documents
- Recent Decisions
- Open Risks / Issues
- External System Links
- Site Health

### 11.3 Example Rollup

```text
Project Readiness
├── Startup: 82% complete / 4 blocked
├── Permits: 3 pending / 1 expiring
├── Inspections: 5 scheduled / 2 failed
├── Contract Obligations: 6 open / 1 high risk
├── Closeout: 18% complete / 9 future requirements
└── My Responsibilities: 7 assigned / 2 overdue
```

---

## 12. Team & Access Center

### 12.1 Purpose

Provide Procore-like project team and access management inside the Project Control Center.

### 12.2 Required UX

User flow:

```text
Add User
  ├─ search user with people picker
  ├─ select user
  ├─ select project role
  ├─ select permission template
  ├─ review access summary
  ├─ confirm
  ├─ backend validates actor authority
  ├─ backend applies group membership
  └─ audit record is written
```

### 12.3 Access Management Rules

#### Global Read-Only Access

A predefined Entra group receives read-only access to every project site automatically.

Examples:

- IT department
- Vice Presidents and above
- other executive/oversight/audit roles

This group is applied during provisioning.

#### Preconstruction / Estimating Access Managers

During preconstruction and estimating, the following assigned roles can invite users and apply approved permission templates:

- Estimating Coordinator
- Lead Estimator
- Project Executive

#### Construction Access Managers

During construction, the following assigned roles can invite users and apply approved permission templates:

- Project Executive
- Project Manager
- Manager of Operational Excellence

### 12.4 Permission Templates

Permission templates are business concepts mapped to SharePoint/Entra implementation details behind the scenes.

Recommended templates:

- Project Viewer / Read Only
- Project Team Member
- Project Management
- Field Operations
- Project Accounting
- Safety / QAQC
- Executive Oversight
- External Design Team
- Owner / Client Viewer
- Subcontractor Limited Access, if required
- Project Control Center Admin

Each template should define:

- display name;
- business description;
- mapped SharePoint group;
- mapped Entra group, if used;
- allowed modules;
- allowed libraries;
- external-user allowance;
- approval requirement;
- phase restrictions;
- assigner role restrictions;
- expiration defaults;
- audit requirements.

### 12.5 Data Lists

#### Project Access Configuration

- Project ID
- Site ID
- Site URL
- Project Phase
- Global Read-Only Group ID
- Template Version
- Default Permission Templates
- External Access Allowed
- Access Review Frequency
- Last Access Review Date

#### Project Team Assignments

- Project ID
- User Object ID
- UPN
- Display Name
- Email
- Company
- Project Role
- Permission Template
- Phase Added
- Added By
- Added Date
- Effective Date
- Expiration Date
- Status
- Notes

#### Project Access Audit

- Project ID
- Action Type
- Actor
- Target User / Group
- Permission Template
- Previous Value
- New Value
- Timestamp
- Result
- Failure Reason

#### Access Requests

- Project ID
- Requested User
- Requested By
- Requested Permission Template
- Business Justification
- Status
- Approved By
- Approved Date
- Rejected By
- Rejected Date
- Notes

---

## 13. Document Control Center

### 13.1 Purpose

Provide a single project-aware document surface for project libraries, user OneDrive context, recent project documents, controlled document views, and workflow evidence.

### 13.2 Views

- Project Libraries
- My OneDrive
- Shared With Me
- Recent Project Documents
- Drawings and Specifications
- Contracts and Compliance
- Permits and Inspections
- Field Documentation
- Meeting Minutes
- Closeout Documents
- As-Builts
- Warranties
- O&M Manuals
- Lessons Learned Attachments

### 13.3 Phase 1 Capabilities

- Browse project document libraries
- Browse signed-in user OneDrive
- Open files
- Download files
- Copy safe links
- View metadata
- Navigate folders with breadcrumbs
- Lazy-load children
- Show permission/access states
- Show configuration errors
- Avoid write operations until governance is implemented

### 13.4 Integration With Other Modules

Checklist items, permit rows, inspection records, subcontractor scorecards, lessons learned entries, contract obligations, and closeout tasks should all support evidence links into project document libraries.

### 13.5 Recommended Graph Posture

Phase 1 should use delegated permissions and signed-in user context. Candidate read-only Graph permissions should be validated before implementation, but the working model is:

- file access for user-accessible files;
- site/library access for configured project document libraries;
- no app-only tenant-wide file crawling;
- no persistence of temporary download URLs.

---

## 14. Project Directory / Team Center

### 14.1 Purpose

Provide fast access to project contacts, responsibilities, companies, and role assignments.

### 14.2 Recommended Features

- Internal project team
- Owner contacts
- Architect/engineer contacts
- Consultants
- Subcontractors
- Project accountant
- Safety/QAQC contacts
- Emergency contacts
- Distribution groups
- “Who owns this?” lookup
- Contact by role
- Contact by company
- Contact by responsibility
- Role assignment history

### 14.3 Data Sources

- Project Team Assignments
- Project Companies
- Project Contacts
- Responsibility Matrix
- Access Configuration

---

## 15. Responsibility Matrix Center

### 15.1 Purpose

Convert the current PM and field responsibility matrix templates into structured, role-aware, project-specific accountability data.

### 15.2 Current Example Coverage

The PM responsibility matrix includes responsibilities across:

- owner notices;
- contracts;
- prime contract change orders;
- subcontract change orders;
- subcontractor SOV review;
- change orders and invoices;
- invoice approvals;
- credit card and expense approvals;
- OCIP credits/enrollment;
- payment applications;
- release of funds;
- monthly financial reports;
- schedule updates;
- daily internal huddles;
- team collaboration;
- buyout tracking;
- subcontract SOWs;
- project roles for PX, Sr. PM, PM2, PM1, PA, QAQC, and Project Accountant.

The field responsibility matrix includes responsibilities across:

- overall job lead;
- monthly schedule updates;
- three-week lookaheads;
- subcontractor pay app review;
- site work;
- landscape;
- hardscape;
- utilities;
- courtyard and road work;
- MEP for units, amenities, exteriors, and courtyard;
- interiors through drywall and completion;
- exterior envelope;
- flooring;
- painting;
- trim-out;
- QAQC submittal and envelope review;
- superintendent-driven QAQC coordination.

### 15.3 Required Features

- Template-driven responsibility matrix
- Project-specific role assignment
- RACI-style view
- Personal “My Responsibilities” view
- Role-based filtering
- Support role assignments
- Sign-off role assignments
- Recurring responsibility rules
- Handoff workflow when a staff member changes roles
- Integration into Action Center

### 15.4 Data Lists

#### Project Responsibility Matrix

- Project ID
- Workstream
- Task / Responsibility
- Primary Role
- Primary Person
- Support Roles
- Support People
- Sign-Off Role
- Frequency
- Due Rule
- Related Module
- Related System
- Active
- Notes

#### Project Role Assignments

- Project ID
- Role
- Person
- Start Date
- End Date
- Responsibility Scope
- Backup Person
- Assignment Status

---

## 16. Action Center

### 16.1 Purpose

Aggregate all project work requiring attention into one role-aware task surface.

### 16.2 Sources

- Startup tasks
- Permit tasks
- Inspection tasks
- Contract obligations
- Responsibility matrix recurring tasks
- Access requests
- Closeout tasks
- Subcontractor evaluations
- Lessons learned assignments
- Risk/issue follow-ups
- Meeting action items
- External system tasks where integrations support them

### 16.3 Features

- My Actions
- Team Actions
- Overdue
- Due This Week
- Awaiting Approval
- Blocked
- By Module
- By Responsible Role
- By Project Phase
- Escalation view for PX/PM
- Action audit trail

### 16.4 Data List

#### Project Action Items

- Project ID
- Action Source
- Source Record ID
- Title
- Description
- Assigned Role
- Assigned User
- Due Date
- Priority
- Status
- Related Module
- Related Document
- Related External System
- Created By
- Created Date
- Completed By
- Completed Date
- Escalation Status

---

## 17. Project Startup Center

### 17.1 Purpose

Convert the startup checklist into an operational project launch module.

### 17.2 Example Coverage

The startup checklist covers:

- owner contract review;
- split savings;
- contingency usage parameters;
- liquidated damages;
- allowances;
- bonding / SDI;
- accounting setup;
- Procore setup;
- estimating turnover;
- budget roll from estimating/accounting to Procore;
- project signs;
- drawings/specifications in Procore;
- owner contract with SOV/pay app;
- subcontractor COIs;
- owner certificate of insurance;
- Notice of Commencement;
- job files;
- management and logistics plan;
- project schedule;
- submittal register;
- closeout setup;
- preconstruction meetings with AHJ and owner;
- threshold/testing company verification;
- photo/video surveys;
- vibration monitoring;
- subcontract writing;
- buyout tracking;
- NTO;
- builder’s risk;
- safety plan and SDS notebook;
- utilities;
- services and equipment;
- permits posted on jobsite.

### 17.3 Features

- Startup readiness dashboard
- Startup checklist by category
- Mobilization readiness gate
- Accounting setup status
- Procore setup status
- Contract risk setup
- Insurance/bonding status
- NOC/NTO status
- Safety plan setup
- Services/equipment setup
- Permits-posted tracker
- Evidence attachments
- Auto-generated actions

### 17.4 Data List

#### Project Startup Tasks

- Project ID
- Task Number
- Task Category
- Task Description
- Required / Conditional / N/A
- Responsible Role
- Responsible Person
- Due Date
- Status
- Completed Date
- Completed By
- Evidence Required
- Evidence Link
- Related System
- Startup Gate Impact
- Notes

---

## 18. Permit & AHJ Center

### 18.1 Purpose

Convert the permit log into a project permit register and AHJ management module.

### 18.2 Example Coverage

The permit log includes:

- permit sequence;
- sub reference;
- permit type;
- location;
- permit number;
- description;
- responsible contractor;
- address;
- date required;
- date submitted;
- date received;
- date expires;
- status;
- AHJ;
- comments.

Example permit types and descriptions include:

- mass grading;
- engineering;
- construction field office;
- irrigation;
- pool deck;
- swimming pool;
- pool barrier;
- gazebos;
- site wall;
- site lighting;
- landscape;
- hardscape;
- dog park/playground fencing;
- monument sign;
- master building;
- electrical sub;
- plumbing sub;
- mechanical sub;
- fire sprinkler;
- fire alarm;
- access control;
- low voltage;
- roofing;
- elevator;
- BDA.

### 18.3 Features

- Permit register
- Status board
- Permit expiration alerts
- Responsible contractor view
- AHJ view
- Permit document links
- Posted-on-jobsite status
- Permit closeout status
- Connection to inspections
- Location/building grouping

### 18.4 Data List

#### Project Permits

- Project ID
- Permit Sequence Number
- Sub Reference
- Permit Type
- Location / Building / Area
- Permit Number
- Permit Description
- Responsible Contractor
- Address
- AHJ
- Date Required
- Date Submitted
- Date Received
- Date Expires
- Status
- Permit Document Link
- Related Inspection Group
- Comments

---

## 19. Inspection Readiness Center

### 19.1 Purpose

Convert the required inspections workbook into a structured inspection planning, call-in, result, and verification module.

### 19.2 Example Coverage

The required inspections list includes fields for:

- inspection;
- code;
- date called in;
- result;
- comment;
- verified online.

It includes inspection groups and examples such as:

- NOC/recorded;
- fire preliminary;
- civil preliminary;
- landscape preliminary;
- elevation certification;
- building footer;
- slab;
- filled cells;
- tie beams;
- waterproofing;
- door/window bucks;
- storefront;
- truss;
- wall sheathing;
- drywall;
- framing;
- fire penetration;
- insulation;
- low voltage;
- fire alarm;
- fire sprinkler;
- high voltage electrical;
- mechanical;
- plumbing;
- tree removal;
- irrigation;
- storm drainage;
- site wall/fencing;
- dumpster enclosure;
- exterior light poles;
- awnings;
- patio pavers;
- landscaping;
- asphalt paving;
- roofing.

### 19.3 Features

- Required inspection template by project type
- Inspection call-in tracking
- Scheduled inspections
- Passed/failed/partial result tracking
- Online verification flag
- Reinspection tracking
- Evidence/document links
- Failed inspection corrective actions
- Blocks-cover-up flag
- Blocks-CO/TCO flag
- Connection to Permit & AHJ Center
- Connection to Closeout & Turnover Center

### 19.4 Data List

#### Project Required Inspections

- Project ID
- Inspection Group
- Inspection Name
- Inspection Code
- Permit Number
- Related Permit ID
- Location / Building / Area
- Date Called In
- Scheduled Date
- Result
- Verified Online
- Verification Date
- AHJ
- Inspector
- Comments
- Evidence Link
- Blocks Cover-Up
- Blocks CO/TCO
- Blocks Closeout

---

## 20. Contract & Compliance Center

### 20.1 Purpose

Manage contract terms, obligations, risk clauses, notices, insurance, bonds, responsibilities, and external contract systems.

### 20.2 Example Sources

- Startup checklist owner contract review
- Owner Contract / GMP Responsibility Matrix
- Document Crunch
- Adobe Sign
- Insurance and COI tracking
- NOC/NTO requirements
- Bonding/SDI requirements

### 20.3 Owner Contract Responsibility Matrix

The owner contract matrix includes:

- article;
- page;
- responsible party;
- description;
- responsibility legend:
  - `O` = Owner Activity
  - `A/E` = Architect / Engineer Activity
  - `C` = Contractor Activity

### 20.4 Features

- Prime contract obligation register
- Contract article/page reference
- Owner / A/E / Contractor responsibility mapping
- LDs tracking
- Contingency usage parameters
- Split savings terms
- Allowance tracking
- Notice requirements
- Insurance requirements
- Bonding/SDI requirements
- Document Crunch review links
- Adobe Sign envelope tracking
- Owner notice workflow
- Contract risk flags

### 20.5 Data List

#### Contract Obligation Register

- Project ID
- Contract Document
- Article / Section
- Page
- Responsible Party
- Obligation Description
- Trigger Event
- Required Action
- Due Date
- Risk Level
- Responsible HB Role
- Status
- Evidence Link
- Document Crunch Link
- Adobe Sign Link
- Notes

---

## 21. Drawing & Model Center

### 21.1 Purpose

Create a project-specific access point for drawings, specifications, models, as-builts, surveys, reality capture, and design coordination references.

### 21.2 Features

- Current drawing set
- Superseded drawings
- Specifications
- Permit plans
- ASIs / CCDs / sketches
- As-built tracker
- Final survey / elevation certificate tracker
- Form board survey tracker
- Engineer certification tracker
- Cupix walkthrough launcher
- Photo/video survey records
- Vibration monitoring records
- Links to Procore drawing/spec modules
- Design team contacts

### 21.3 Data Lists

#### Drawing Register

- Project ID
- Drawing Number
- Drawing Title
- Discipline
- Current Revision
- Issue Date
- Status
- Source System
- File Link
- Procore Link
- Notes

#### Survey and Certification Register

- Project ID
- Certification Type
- Required For
- Responsible Party
- Due Date
- Received Date
- Status
- File Link
- Notes

---

## 22. Field Operations Center

### 22.1 Purpose

Provide superintendent and field teams with a practical daily field surface.

### 22.2 Features

- Field readiness dashboard
- Daily work plan
- Lookahead schedule
- Required inspections
- Jobsite permits posted
- Safety plan and SDS notebook access
- Site logistics
- Utilities and services
- Trailer / field office setup
- Sanitary and temporary facilities
- First aid and fire extinguisher readiness
- Field photos
- Site observations
- Issue escalation
- Mobile/tablet-friendly views

### 22.3 Source Enhancements

This module pulls directly from:

- Project Startup Checklist
- Required Inspections List
- Permit Log
- Responsibility Matrix - Field
- Safety / QAQC workflows
- Procore daily logs, if integrated

---

## 23. Meeting & Communication Center

### 23.1 Purpose

Centralize meeting records, agendas, minutes, action items, project communications, and formal decision tracking.

### 23.2 Features

- Estimating-to-operations turnover meeting
- Preconstruction meeting with AHJ
- Preconstruction meeting with owner
- OAC meeting minutes
- Subcontractor meeting minutes
- Internal project huddles
- Punch list meeting
- Owner turnover meeting
- Meeting action items
- Decision log integration
- Public relations announcement workflow
- Owner recommendation letter workflow
- Letter of appreciation workflow

### 23.3 Data Lists

#### Meeting Register

- Project ID
- Meeting Type
- Meeting Date
- Organizer
- Attendees
- Agenda Link
- Minutes Link
- Related Actions
- Related Decisions
- Status

#### Decision Log

- Project ID
- Decision Title
- Decision Description
- Decision Owner
- Required By
- Decision Date
- Impact
- Related Meeting
- Related RFI / Change / Drawing
- Status

---

## 24. Risk / Issues / Decision Log

### 24.1 Purpose

Create executive and project-team visibility into unresolved project risk, blockers, issues, constraints, and decisions.

### 24.2 Risk Sources

- Liquidated damages exposure
- Special contract terms
- Allowance or contingency uncertainty
- Permit delays
- AHJ dependencies
- Failed or partial inspections
- Builder’s risk verification
- Vibration monitoring need
- Photo/video survey need
- CO/TCO blockers
- Lien/final payment timing
- Late owner decisions
- Subcontractor performance issues
- Lessons learned significant/critical impacts

### 24.3 Data Lists

#### Project Risks

- Project ID
- Risk Title
- Risk Category
- Description
- Probability
- Impact
- Risk Level
- Owner
- Mitigation Plan
- Due Date
- Status
- Related Module
- Related Document
- Escalation Required

#### Project Issues

- Project ID
- Issue Title
- Description
- Source
- Responsible Role
- Responsible Person
- Due Date
- Status
- Related Module
- Related System
- Resolution Notes

---

## 25. Project Controls Center

### 25.1 Purpose

Provide schedule, budget, cost, change, procurement, milestone, and readiness visibility.

### 25.2 Features

- Milestone tracker
- Schedule summary
- Lookahead snapshot
- Budget summary
- Cost report link
- Change event summary
- Pay application status
- Forecast / cost-to-complete summary
- Procurement log
- Buyout status
- Allowance log
- Startup readiness gates
- Closeout readiness gates
- Cost variance report closeout status
- Sage Intacct links
- Procore links

### 25.3 Integrations

- Sage Intacct for official financials
- Procore for project management records
- Internal HB Intel summaries where normalized data is available

---

## 26. Procurement & Buyout Center

### 26.1 Purpose

Manage subcontract buyout, procurement priorities, vendor qualification, long-lead exposure, and owner-provided items.

### 26.2 Features

- Buyout tracking log
- Subcontract status
- Long-lead item tracking
- Owner-provided item tracking
- Subcontract writing in Procore
- Compass vendor/prequalification links
- Subcontractor evaluation history
- Rebid recommendation visibility
- Procurement-related lessons learned

### 26.3 Data Lists

#### Buyout Log

- Project ID
- Package
- Trade
- Scope
- Budget
- Target Award Date
- Current Status
- Selected Subcontractor
- Compass Link
- Procore Commitment Link
- Risk Notes

#### Procurement Log

- Project ID
- Item
- Related Trade
- Required Date
- Lead Time
- Responsible Party
- Status
- Vendor/Subcontractor
- Related Submittal
- Related Schedule Activity
- Notes

---

## 27. Subcontractor Performance Center

### 27.1 Purpose

Convert the subcontractor performance scorecard into a structured closeout and future procurement dataset.

### 27.2 Example Scorecard Categories

The scorecard uses weighted performance categories:

- Safety & Compliance — 20%
- Quality of Work — 20%
- Schedule Performance — 20%
- Cost Management — 15%
- Communication & Management — 15%
- Workforce & Labor — 10%

The scorecard includes detailed evaluation criteria for safety plan adherence, PPE/toolbox participation, housekeeping, incident rate, corrective actions, workmanship, plan/spec/submittal compliance, first-time inspection pass rate, closeout documentation, mobilization, lookahead reliability, baseline schedule progress, recovery effort, coordination, budget adherence, change order timeliness, back-charge exposure, financial stability, billing quality, responsiveness, foreman/superintendent leadership, submittal quality, meeting participation, issue escalation, staffing, skill level, labor compliance, and sub-tier management.

### 27.3 Features

- Subcontractor evaluation form
- Weighted scoring
- Rating band
- PM/Super/PX signature/approval
- Rebid recommendation
- Key strengths
- Areas for improvement
- Notable incidents
- Compass integration candidate
- Historical performance dashboard
- Closeout gate requirement

### 27.4 Data Lists

#### Subcontractor Evaluations

- Project ID
- Subcontractor
- Trade / Scope
- Contract Value
- Final Cost
- Scheduled Completion
- Actual Completion
- Evaluator
- Evaluation Date
- Safety Score
- Quality Score
- Schedule Score
- Cost Management Score
- Communication Score
- Workforce Score
- Overall Weighted Score
- Rating Band
- Recommend Rebidding
- Key Strengths
- Areas for Improvement
- Notable Incidents
- PM Signature
- Superintendent Signature
- PX Approval

#### Subcontractor Evaluation Criteria

- Criterion ID
- Category
- Criterion
- Evidence Guidance
- Weight
- Active

---

## 28. Lessons Learned Center

### 28.1 Purpose

Convert project closeout lessons into structured knowledge capture, searchable best practices, and process-improvement routing.

### 28.2 Example Form Coverage

The lessons learned workbook includes:

- project identification;
- delivery method;
- market sector;
- project size band;
- complexity rating;
- individual lesson entries;
- situation;
- impact;
- root cause;
- response;
- recommendation;
- supporting references;
- project-level summary;
- best practices to replicate;
- process improvement recommendations;
- approval workflow;
- lessons database;
- reference guide;
- category definitions;
- writing standards.

### 28.3 Lesson Categories

- Pre-Construction
- Estimating & Bid
- Procurement
- Schedule
- Cost / Budget
- Safety
- Quality
- Subcontractors
- Design / RFIs
- Owner / Client
- Technology / BIM
- Workforce / Labor
- Commissioning
- Closeout / Turnover
- Other

### 28.4 Impact Magnitude

The lessons template defines impact magnitude thresholds by cost and schedule impact:

- Minor
- Moderate
- Significant
- Critical

### 28.5 Features

- Capture lessons during the project, not only at closeout
- Lesson entry form
- Category tagging
- Keywords/tags
- Impact scoring
- Root cause and recommendation fields
- Supporting document references
- PX/leadership review
- Convert lesson to best practice
- Route process improvement recommendation
- HBI searchable knowledge base

### 28.6 Data Lists

#### Project Lessons Learned

- Project ID
- Lesson Number
- Category
- Phase Encountered
- Situation
- Impact Description
- Cost Impact
- Schedule Impact Days
- Impact Magnitude
- Root Cause
- Response
- Recommendation
- Applicability Rating
- Keywords
- Supporting Document Links
- Created By
- Created Date
- Reviewed By
- PX Approved
- VP Ops Approved
- Companywide Best Practice Candidate

#### Best Practices Library

- Practice Title
- Category
- Description
- Conditions for Use
- Owner Department
- Source Project
- Source Lesson
- Approved By
- Active / Retired
- Related Templates / Standards

#### Process Improvement Recommendations

- Recommendation
- Owner Department
- Priority
- Effort
- Status
- Source Project
- Source Lesson
- Assigned Owner
- Due Date
- Resolution Notes

---

## 29. Closeout & Warranty Center

### 29.1 Purpose

Make closeout visible and structured from day one of the project.

### 29.2 Example Checklist Coverage

The closeout checklist includes:

- fire alarm/elevator phone lines;
- RFI closure;
- submittal approval;
- change order approval;
- as-built requests;
- soil investigation/certification;
- termite letters;
- insulation certificate;
- form board survey;
- tie-in survey;
- final survey/elevation certificate;
- fire-treated lumber letter;
- fire alarm monitoring letter;
- structural engineer certification;
- substantial completion affidavit;
- engineer certification for paving/utilities;
- threshold inspection reports;
- landscape acceptance letter;
- building department plan changes approval;
- health department approval;
- utility approval;
- demo, plumbing, HVAC, electrical, fire alarm, fire sprinkler, and building finals;
- pre-CO checklist;
- CO/CC;
- owner turnover;
- punch list;
- as-builts;
- owner warranties;
- O&M manuals;
- attic stock;
- final payment forms;
- last contractual work date;
- 80-day flag;
- 88-day lien filing trigger;
- releases of lien;
- recommendation letter;
- project files returned;
- project recap;
- subcontractor evaluation;
- cost variance report;
- lessons learned;
- PBC closeout requirements.

### 29.3 Features

- Closeout readiness dashboard
- Pre-CO checklist
- Turnover package builder
- Closeout document tracker
- Inspection final readiness
- Certificate tracker
- Warranty/O&M/attic stock tracker
- Punch list status
- Final payment forms
- Lien/final payment watchlist
- PX closeout package
- Subcontractor evaluation gate
- Lessons learned gate

### 29.4 Data Lists

#### Project Closeout Tasks

- Project ID
- Section
- Item Number
- Closeout Item
- Required / Conditional / N/A
- Responsible Role
- Responsible Person
- Due Date
- Status
- Evidence Required
- Evidence Document Link
- Related AHJ
- Related Inspection
- Completed Date
- Completed By
- Notes

#### Closeout Documents Register

- Project ID
- Document Type
- Required By
- Responsible Party
- Source Company
- Required For CO
- Required For Turnover
- Required For Final Payment
- Received Date
- Reviewed Date
- Accepted Date
- File Link
- Status
- Notes

#### Lien / Final Payment Watchlist

- Project ID
- Last Contractual Work Date
- 80-Day Warning Date
- 88-Day Lien Filing Deadline
- Final Payment Received
- Release of Liens Received
- Owner Notice Sent
- Status
- Legal/Risk Notes

---

## 30. HBI Assistant

### 30.1 Purpose

Provide a project-aware assistant grounded in project-site data, project-accessible documents, and integrated system summaries.

### 30.2 Example Queries

- What startup items are still blocking mobilization?
- Which permits are not received?
- What inspections are required before CO?
- What inspections failed this week?
- What closeout documents are missing?
- Who owns waterproofing inspections?
- Which subcontractors need evaluation?
- Summarize open lessons learned.
- Which contract obligations are owner responsibilities?
- What are the lien/final payment deadlines?
- Find the latest structural drawings.
- Prepare an OAC agenda draft.
- Summarize changes since yesterday.
- Show external users with access to this project.

### 30.3 Guardrails

- HBI should use project-accessible data only.
- HBI should not bypass user permissions.
- HBI should not use tenant-wide file crawling unless a separate governed architecture is approved.
- Answers should link to source records/documents where possible.
- Sensitive diagnostics should be redacted.

---

## 31. Control Center Settings

### 31.1 Purpose

Give authorized users a way to configure the project site without using native SharePoint administration.

### 31.2 Settings Sections

```text
Control Center Settings
├── General Project Profile
├── Modules & Navigation
├── Project Team / Roles
├── Team & Access
├── Libraries & Document Areas
├── External Integrations
├── Startup / Closeout Templates
├── Permits & Inspections
├── Responsibility Matrix
├── Notifications / Escalations
├── Access Requests
├── HBI Settings
└── Template Health / Validation
```

### 31.3 UX Requirements

- Role-gated settings
- Guided forms
- Friendly labels
- Plain-language validation
- Safe save workflow
- Audit trail
- No raw internal field names
- No raw SharePoint list/library settings
- Preview changes before publish
- Clear indication when a setting affects permissions or visibility

### 31.4 Settings Data List

#### Project Control Center Settings

- Project ID
- Site URL
- Active Modules
- Module Labels
- Default Landing View
- Project Phase
- External System Links
- Procore Project ID
- Sage Project ID
- Compass Project/Vendor References
- Document Crunch Project Link
- Adobe Sign Project References
- Cupix Project Link
- Default Library Mapping
- Default View Mapping
- HBI Enabled
- Template Version
- Last Updated By
- Last Updated Date

---

## 32. Site Health and Drift Detection

### 32.1 Purpose

Detect whether a provisioned project site still matches the governed template.

### 32.2 Health Checks

- Site exists
- Required pages exist
- Required libraries exist
- Required lists exist
- Required fields exist
- Required content types exist, if used
- Required permission groups exist
- Global read-only group applied
- Project Control Center app installed
- Settings records exist
- Module registry records exist
- External mapping placeholders exist
- No unexpected broken permission inheritance in governed areas
- Template version matches current supported version
- Required views exist or app-generated views work
- Site navigation matches expected state

### 32.3 Repair Actions

Authorized admins may trigger repair actions where safe:

- recreate missing list;
- recreate missing library;
- restore missing field;
- reseed module registry;
- reapply default navigation;
- refresh permission group mapping;
- re-run validation;
- open support ticket for unsafe drift.

All repairs must be audited.

---

## 33. Standard Document Libraries

### 33.1 Recommended Baseline

```text
01_Project_Administration
02_Contracts_and_Compliance
03_Drawings_and_Specifications
04_Permits_and_Inspections
05_RFIs_Submittals_and_Direction
06_Field_Operations
07_Meetings_and_Communications
08_Project_Controls_and_Financials
09_Photos_Videos_and_Reality_Capture
10_Closeout_and_Turnover
11_Lessons_Learned_and_Reports
99_Archive
```

### 33.2 Library Design Principles

- Use separate libraries where permission, lifecycle, sync, or confidentiality needs differ.
- Avoid one massive mixed-permission library.
- Avoid frequent folder-level unique permissions.
- Prefer library-level security boundaries.
- Avoid making users manage metadata manually.
- Expose metadata through app UI and controlled forms.
- Provide project-friendly views in the Document Control Center rather than requiring users to create SharePoint views.

---

## 34. Standard SharePoint Lists

### 34.1 Governance and Configuration

- Project Profile
- Project Control Center Settings
- Project Module Registry
- Project Site Health
- Project Provisioning Audit
- Project Access Configuration
- Project Access Audit
- Access Requests

### 34.2 Team and Responsibilities

- Project Team Assignments
- Project Companies
- Project Contacts
- Project Roles
- Project Responsibility Matrix
- Contract Responsibility Matrix

### 34.3 Daily Operations

- Project Action Items
- Project Decisions
- Project Issues
- Project Risks
- Meeting Register
- Project Links

### 34.4 Startup

- Project Startup Tasks
- Startup Gate Checklist
- Project Services and Equipment
- Preconstruction Meeting Log

### 34.5 Permits and Inspections

- Project Permits
- AHJ Contacts
- Project Required Inspections
- Inspection Results
- Inspection Deficiencies
- Corrective Actions
- Permit Closeout Requirements

### 34.6 Contracts and Compliance

- Contract Obligation Register
- Insurance and COI Register
- Bonding and SDI Register
- Notice Register
- Adobe Sign Envelope Tracker
- Document Crunch Review Tracker

### 34.7 Project Controls

- Milestones
- Buyout Log
- Procurement Log
- Allowance Log
- Change Event Summary
- Pay Application Tracker
- Financial Reporting Checklist

### 34.8 Documents

- Document Register
- Drawing Register
- Submittal Register
- RFI Register
- As-Built Tracker
- Closeout Document Register
- Survey and Certification Register

### 34.9 Subcontractors

- Subcontractor Evaluations
- Subcontractor Evaluation Criteria
- Subcontractor Performance History
- Subcontractor Rebid Recommendations

### 34.10 Closeout and Knowledge Capture

- Project Closeout Tasks
- Turnover Package Items
- Warranty Items
- O&M Manual Tracker
- Attic Stock Tracker
- Lien and Final Payment Watchlist
- Project Lessons Learned
- Best Practices Library
- Process Improvement Recommendations

---

## 35. Permission and Access Architecture

### 35.1 Core Principle

Permissions should be governed by role and template, not by ad hoc manual SharePoint administration.

### 35.2 Baseline Permission Groups

Recommended baseline SharePoint groups or mapped group concepts:

- Project Owners / Admins
- Project Management
- Field Operations
- Project Accounting
- Safety / QAQC
- Estimating / Preconstruction
- Executive Oversight
- Global Read-Only
- External Design Team
- Owner / Client Viewer
- Subcontractor Limited Access, if used
- Read-Only Visitors

### 35.3 Global Read-Only Group

A predefined Entra group should be granted read-only access to all project sites.

This should include:

- IT department;
- Vice Presidents and above;
- other centrally approved oversight users.

### 35.4 Phase-Based Access Managers

#### Preconstruction / Estimating

Authorized add-user roles:

- Estimating Coordinator
- Lead Estimator
- Project Executive

#### Construction

Authorized add-user roles:

- Project Executive
- Project Manager
- Manager of Operational Excellence

### 35.5 Access Mutation Flow

```text
User initiates add/change access
  └─ Project Control Center UI
      ├─ validate user role
      ├─ validate project phase
      ├─ validate permission template
      ├─ submit request to backend/functions
      └─ show pending/success/error state

backend/functions
  ├─ validate actor
  ├─ validate project context
  ├─ map permission template to group
  ├─ apply membership change
  ├─ write Project Access Audit record
  └─ return plain-language result
```

### 35.6 Access Guardrails

- No arbitrary permission grant UI.
- No raw SharePoint group selection for normal users.
- No item/folder-level permission management by project teams.
- No phase-rule bypass.
- No access change without audit logging.
- No hidden dependency on native SharePoint permissions screens.
- No raw Graph/SharePoint error dumps in the UI.

---

## 36. External Integration Architecture

### 36.1 Integration Pattern

The Project Control Center should provide three levels of integration:

1. **Launch Links**  
   Low-cost, high-value deep links to project-specific records in external systems.

2. **Status Cards**  
   API-backed summaries where practical.

3. **Workflow Sync / Automation**  
   Future controlled integration where business value justifies it.

### 36.2 Integration Candidates

| Platform | Candidate Uses |
|---|---|
| Procore | RFIs, submittals, drawings/specs, change events, daily logs, inspections, directory, commitments, punch, schedule |
| Sage Intacct | job setup, budget, cost reporting, commitments, pay apps, invoices, final payment |
| Compass | subcontractor prequalification, vendor profile, trade capacity, performance history |
| Document Crunch | prime contract review, subcontract review, obligation extraction, risk clauses, notice requirements |
| Adobe Sign | prime contract execution, subcontract execution, change order signatures, lien releases |
| Cupix | existing conditions, progress capture, turnover/warranty visual records, location-based photo/video context |

### 36.3 External System Mapping List

#### Project External System Mappings

- Project ID
- System Name
- External Project ID
- External URL
- Integration Status
- Last Verified
- Verified By
- Mapping Notes

---

## 37. Data Relationship Model

```text
Project Profile
├── Project Control Center Settings
├── Project Team Assignments
│   ├── Project Access Configuration
│   └── Project Responsibility Matrix
├── Startup Tasks
│   ├── Contract Review Items
│   ├── Insurance / Bonding / NOC / NTO
│   └── Services / Permits Posted
├── Permits
│   └── Required Inspections
│       ├── Inspection Results
│       └── Corrective Actions
├── Contract Obligations
│   ├── Notices
│   ├── Document Crunch Reviews
│   └── Adobe Sign Envelopes
├── Project Documents
│   ├── Drawing Register
│   ├── Submittal Register
│   ├── RFI Register
│   ├── Survey / Certification Register
│   └── Closeout Document Register
├── Project Controls
│   ├── Milestones
│   ├── Buyout Log
│   ├── Procurement Log
│   └── Pay Application Tracker
├── Closeout Tasks
│   ├── Turnover Package
│   ├── Warranty Items
│   ├── Lien Watchlist
│   └── PX Closeout Package
├── Subcontractor Evaluations
│   └── Subcontractor Performance History
└── Lessons Learned
    ├── Best Practices
    └── Process Improvements
```

---

## 38. Recommended Implementation Roadmap

### Phase 0 — Architecture Freeze

- Approve this target architecture.
- Finalize project site information architecture.
- Finalize list/library schema baseline.
- Finalize permission templates.
- Finalize Control Center Settings requirements.
- Finalize Team & Access model.
- Decide how to model project phases.

### Phase 1 — Project Site Template Contract

Build:

- `packages/project-site-template/`
- schema definitions;
- list definitions;
- library definitions;
- permission group templates;
- page definitions;
- module registry;
- settings seed data;
- site health validation contract;
- provisioning audit model.

### Phase 2 — Provisioning Workflow

Build or extend:

- estimating-to-accounting handoff;
- accounting final approval;
- backend/functions provisioning endpoint;
- site creation;
- template application;
- permissions and global read-only group;
- Project Control Center page creation;
- validation and audit records.

### Phase 3 — Project Control Center Shell

Build:

- `apps/project-control-center/`
- full-page SPFx shell;
- project hero;
- priority actions rail;
- Today / This Week panel;
- readiness rollups;
- module navigation;
- Control Center Settings entry point;
- Site Health entry point.

### Phase 4 — Adoption MVP Modules

Build:

- Team & Access Center
- Document Control Center
- Startup Center
- Responsibility Matrix Center
- Permit & AHJ Center
- Inspection Readiness Center
- Action Center

### Phase 5 — Risk and Closeout Modules

Build:

- Contract & Compliance Center
- Closeout & Warranty Center
- Subcontractor Performance Center
- Lessons Learned Center
- Risk / Issues / Decision Log

### Phase 6 — Integrations

Build:

- project-specific launch links;
- Procore status cards;
- Sage project financial summaries;
- Compass vendor/prequalification links;
- Document Crunch obligation references;
- Adobe Sign envelope tracking;
- Cupix visual capture links.

### Phase 7 — HBI Project Intelligence

Build:

- project-aware assistant;
- grounded source linking;
- open items summary;
- project changes summary;
- document finding;
- meeting agenda drafting;
- closeout readiness explanation;
- lessons learned retrieval.

---

## 39. MVP Recommendation

The first useful production pilot should include:

1. Project site provisioning from estimating/accounting handoff.
2. Standard project site template with baseline libraries and lists.
3. Project Control Center Home.
4. Team & Access Center.
5. Document Control Center.
6. Startup Center.
7. Responsibility Matrix Center.
8. Permit & AHJ Center.
9. Inspection Readiness Center.
10. Site Health / Template Validation.

This set directly addresses:

- adoption;
- access control;
- startup consistency;
- document organization;
- field readiness;
- project-site standardization;
- reduced SharePoint admin burden.

---

## 40. Success Criteria

### 40.1 User Adoption

- Project users open the Project Control Center daily.
- Project teams use the site as the starting point for project work.
- Users can find project documents without SharePoint training.
- Users can identify responsibilities without asking around.
- Users can request/access project systems from a clear project home page.

### 40.2 Governance

- Every project site is provisioned from the same template.
- Template version is tracked.
- Site health is visible.
- Drift is detected.
- Access changes are audited.
- Project users do not manually manage SharePoint settings.

### 40.3 Operations

- Startup readiness is measurable.
- Permit status is visible.
- Required inspections are trackable.
- Closeout begins at startup.
- Lien/final payment deadlines are visible.
- Lessons learned are captured and reusable.
- Subcontractor performance is captured for future buyout.

### 40.4 Technical

- SPFx shell is packageable and deployable.
- Backend provisioning is repeatable.
- Graph/API permissions are documented and governed.
- External integrations are mapped by project.
- Site repair and validation are available to authorized admins.

---

## 41. Open Decisions

> **MVP Freeze Amendment (2026-04-28).** Items 1, 2, 3, 4, 5, 6, 9, and 10 below are now **frozen for MVP** and governed by the [Standard Project Site Template Contract](./Standard_Project_Site_Template_Contract.md) §22.1. Refer to the contract for the resolved values; the list below is preserved as historical context. Items 7, 8, 11, and 12 remain open and are tracked in the contract's §22.2 Remaining Open list (or as noted below).

The following decisions should be resolved before implementation:

1. Exact project site URL naming convention.
2. Whether each project site is connected to a Microsoft 365 Group / Teams team.
3. Standard external-user policy by project type.
4. Whether owner/client access is allowed in the first release.
5. Whether subcontractor access is allowed in the first release.
6. Whether permission templates map to SharePoint groups, Entra groups, or both.
7. How project phase is controlled and updated.
8. Which external systems are launch-link only in the first release.
9. Which lists are stored per project site versus centrally at HB Central.
10. Whether closeout/lessons/subcontractor performance data should sync to a central enterprise repository.
11. Whether HBI assistant is enabled in the MVP or deferred.
12. Whether write-enabled Document Control actions are included in the MVP or deferred.

---

## 42. Recommended Guiding Statement

The Project Control Center is not a SharePoint page. It is a project operations application hosted on a standardized SharePoint site.

The site template provides the secure, repeatable project container. The Project Control Center provides the daily user experience, business workflows, settings, access management, and project intelligence that make the site useful.

The uploaded example documents should be treated as legacy workflow artifacts to convert into structured, governed project modules — not files to simply store in SharePoint.

