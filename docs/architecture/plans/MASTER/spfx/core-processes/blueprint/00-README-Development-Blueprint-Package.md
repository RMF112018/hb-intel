# Core Processes / Followed By All
## Development Blueprint Package

## Purpose

This package translates the approved concept into a practical development blueprint for a new **SPFx-hosted Core Processes / Followed By All application** for Hedrick Brothers Construction.

The blueprint assumes:

- the application is hosted in the SharePoint tenant
- the MVP is a **global standards administration and operating-map application**
- the MVP is **not yet** a project-by-project workflow tool
- the public experience is delivered as a **full-bleed SPFx shell**
- the application is built around the **PM / Superintendent / PX triad**
- the current HB Procedures Manual library remains the underlying source-document layer
- structured app metadata, governance, curation, and package logic sit on top of that library
- centralized administration controls drafting, editing, and publishing for the MVP

## Package contents

1. `01-Blueprint-Overview-and-Decision-Lock.md`
2. `02-Information-Architecture-and-Content-Model.md`
3. `03-Public-App-Blueprint.md`
4. `04-Admin-Companion-Blueprint.md`
5. `05-SharePoint-SPFx-Architecture-and-Solution-Shape.md`
6. `06-MVP-Package-Scaffold-and-Content-Mapping.md`
7. `07-Search-Discovery-and-Trust-Model.md`
8. `08-Delivery-Waves-Backlog-and-Validation.md`

## How to use this package

- Use **01** as the authoritative concept and decision lock.
- Use **02** and **06** to define data structures, content modeling, and governance objects.
- Use **03** and **04** to drive wireframes, UI architecture, and user journeys.
- Use **05** to establish the technical boundary, SPFx solution shape, and SharePoint storage design.
- Use **07** to define search, browse, source-item typing, trust markers, and freshness behavior.
- Use **08** to guide phased implementation, backlog creation, and validation planning.

## Recommended next use

This blueprint is intended to be suitable for:

- internal strategy review
- UI/UX wireframing
- SharePoint information architecture planning
- SPFx implementation planning
- backlog decomposition into development epics and stories
- future prompt generation for code-agent execution
