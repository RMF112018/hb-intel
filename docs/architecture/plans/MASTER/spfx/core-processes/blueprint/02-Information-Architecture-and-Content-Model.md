# Information Architecture and Content Model

## IA objective

Establish an application structure that sits cleanly on top of the current SharePoint procedures-manual library while translating the legacy content into a more useful operating model.

The IA must support:

- role-first public navigation
- lifecycle awareness
- handoff clarity
- corridor + child-package hierarchy
- central package governance
- hybrid structured content plus source-document references

## Primary objects

### 1. Corridor Package

A top-level operating package that represents a major corridor of work.

Examples:

- Preconstruction / Estimating Turnover into Operations
- Project Startup / Mobilization / Responsibility Setup
- Subcontractor Buyout / Procurement Coordination
- Active Execution Controls
- Safety
- Legal
- Project Accounting
- Quality Control

### 2. Child Package

A sub-process package or standard module that sits under a corridor package.

Examples:

- startup turnover checklist
- contract turnover review
- buyout handoff standard
- superintendent startup package
- OAC preparation standard
- monthly financial reporting standard

Child packages may be:

- discoverable only within parent
- promoted for independent discovery
- publish-independent
- parent-locked

### 3. Source Item Reference

A governed reference to an existing source file in SharePoint.

Source item references are not just document links.
They should be enriched with metadata so the app can filter, prioritize, and present them well.

### 4. Role Overlay

A role-specific interpretation layer applied to a shared package.

Roles for MVP:

- PM
- Superintendent
- PX

A role overlay should not create a second conflicting standard.
It should express:

- what this role is responsible for
- what this role should review first
- what this role must hand off or receive
- what common misses matter most to this role

### 5. Lifecycle Association

Each package must have:

- one primary lifecycle stage
- optional secondary lifecycle associations

This keeps the operating map clean while allowing realistic cross-stage standards.

### 6. Advisory Ownership

Each package should have:

- one primary advisory owner
- one or more secondary consulted stakeholders as needed

Advisory ownership is not the same as authoring or publishing authority.
MVP authoring/publishing stays centralized.

### 7. Feedback Record

A structured intake object for package feedback.

Fields should support:

- package
- child package if applicable
- role
- lifecycle stage
- issue type
- urgency
- freeform note
- optional supporting link or file
- submitted by
- submitted date
- status / triage outcome

## Required package spine

Every governed package must include the following minimum structure:

- Purpose
- Trigger / When to Use
- Roles Involved
- Key Handoffs
- Required Artifacts
- Start-Here Steps
- Common Misses / Escalation Points
- Linked Source Documents

## Optional package modules

Optional modules may include:

- PM overlay
- Superintendent overlay
- PX overlay
- supporting-domain modules
- example artifacts
- decision-support notes
- reference summaries
- adjacent references
- caution/freshness notes

## Required source item taxonomy

Every linked source reference must be typed at MVP launch.

Required content types:

- SOP / narrative
- checklist
- template / form
- log / tracker
- example
- legal notice / contract form
- training / micro-training
- supporting reference

Additional suggested metadata:

- source title
- source URL
- source file type
- canonical / derivative flag
- primary package
- additional package associations
- primary role relevance
- lifecycle relevance
- advisory owner domain
- effective date
- last reviewed date
- freshness warning flag
- preview behavior type

## Canonical-first rule

Default rule:

- one canonical source item reference
- reused across packages where relevant

Exception rule:

- package-specific derivative allowed only when deliberately governed

Companion should record:

- which source is canonical
- why a derivative exists
- whether derivative supersedes or supplements the canonical source in that package

## Package relationships

Recommended relationship pattern:

- one corridor package has many child packages
- one child package belongs to one parent corridor as its primary home
- one package can have one primary lifecycle stage and many secondary stages
- one package can map to multiple roles
- one package can map to multiple source references
- one source reference can map to multiple packages

## Trust metadata

Public-facing trust metadata should stay selective.

Recommended visible fields:

- package status
- effective date
- last reviewed date
- primary advisory owner
- caution label where needed

Companion-only metadata should include:

- state history
- freshness overrides
- draft notes
- superseded relationships
- internal governance comments
