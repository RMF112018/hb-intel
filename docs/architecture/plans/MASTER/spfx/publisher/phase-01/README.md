# Project Spotlight Publisher App — Implementation Prompt Package

## Purpose

This package is a **code-agent execution package** for implementing the **Project Spotlight publisher application** in the live local HB Intel repo.

It is based on the approved Project Spotlight architecture package located at:

- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/`

The canonical Project Spotlight XML page template is assumed to be saved in that same folder and must be treated as a **first-class implementation authority** for page-shell generation.

## Primary implementation objective

Build a **single-destination Project Spotlight publishing application** that:

- stores structured post data in SharePoint list infrastructure
- resolves template and validation behavior from the Project Spotlight template registry
- creates and maintains durable page bindings
- publishes each approved post as a **new page** on:
  - `https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight`
- uses the saved Project Spotlight XML template as the **canonical v1 page-shell source**

## What this package includes

- `00-Plan-Summary.md`
- `01-Execution-Sequence-and-Wave-Map.md`
- `02-Architecture-Authority-and-Operating-Rules.md`
- `03-Implementation-Deliverables-and-Definition-of-Done.md`
- `04-Hosted-Verification-Checklist.md`
- `05-Prompt-01-Repo-Truth-and-Impact-Map.md`
- `06-Prompt-02-List-Provisioning-and-Domain-Contracts.md`
- `07-Prompt-03-Service-Layer-and-Template-Resolution.md`
- `08-Prompt-04-XML-Shell-Page-Generation-Engine.md`
- `09-Prompt-05-Content-Mapping-and-Page-Binding.md`
- `10-Prompt-06-Authoring-UI-and-Workflow.md`
- `11-Prompt-07-Validation-Preview-and-Governance.md`
- `12-Prompt-08-TeamViewer-Integration-and-Renderer-Closure.md`
- `13-Prompt-09-Testing-Hosted-Vetting-and-Build-Proof.md`
- `14-Decision-Log-and-Open-Questions.md`

## Execution posture

This package is intentionally sequenced.

The local code agent should:

1. execute one prompt at a time
2. fully close the objective of that prompt before moving on
3. update docs and evidence as work proceeds
4. avoid unrelated refactors
5. prove closure with concrete repo evidence, not assumptions

## Core operating rules

- Do not re-read files that are already in active context unless needed to confirm drift, dependency impact, or uncertainty after changes.
- Do not allow the implementation to drift back into a dual-destination article-publisher model.
- Do not treat the Project Spotlight XML file as a loose reference or inspiration artifact.
- Do not make the SharePoint destination page the source of editorial truth.
- Do not normalize raw manual page editing as the primary authoring model.
- Do not force `hbSignatureHero` into the v1 shell unless the implementation intentionally introduces a new approved shell variant.

## Recommended use

Start with:

- `00-Plan-Summary.md`
- `01-Execution-Sequence-and-Wave-Map.md`
- `02-Architecture-Authority-and-Operating-Rules.md`

Then run the prompt series in order.
