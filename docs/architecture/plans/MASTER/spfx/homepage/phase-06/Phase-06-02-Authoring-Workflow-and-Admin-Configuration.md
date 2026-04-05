# Prompt — Phase 06-02 Authoring Workflow and Admin Configuration

## Objective

Create the practical operating model and administrator guidance for homepage authoring and homepage-safe configuration following the ownership/freshness policy created in Prompt 01.

This prompt should convert the policy into an actionable working model for Communications, Operations, homepage owners, and SharePoint administrators.

## Required pre-read

Before making changes, read:

- `Phase-06-01` outputs
- `Phase-05-01-Completion-Note.md`
- `Phase-05-02-Completion-Note.md`
- `docs/reference/sharepoint-navigation-governance.md`
- `docs/reference/sharepoint-branding-and-page-templates.md`
- `docs/how-to/administrator/sharepoint-navigation-operating-guide.md`
- `docs/how-to/administrator/sharepoint-page-authoring-guide.md`

Do not re-read files that are already in your current working context unless necessary.

## Hard gates to preserve

1. Homepage is singular and specially governed.
2. Homepage custom webparts remain reserved for the homepage unless architecture approves otherwise.
3. Lane C remains governance-based, not new product-lane engineering.
4. No unsupported shell manipulation.
5. No contradiction with template-family governance from Phase 05.

## Work to perform

### 1. Create homepage authoring governance reference
Create a new reference doc that defines:

- homepage authoring model
- self-service authoring vs governed authoring vs architecture-required changes
- who may update editorial copy
- who may update utility destinations
- who may update operational signals
- what changes require approval before publishing
- what changes are prohibited without architecture involvement
- what belongs on the homepage vs what should be a normal SharePoint page

Recommended filename:
- `docs/reference/sharepoint-homepage-authoring-governance.md`

### 2. Create homepage administrator operating guide
Create a practical admin/how-to guide that explains:

- how to process homepage update requests
- how to route common request types
- when to approve directly
- when to require Communications or Operations sign-off
- when to send the request to architecture
- how to recognize homepage misuse
- how to handle stale or abandoned content
- how to coordinate with navigation and branding governance without duplicating those docs

Recommended filename:
- `docs/how-to/administrator/sharepoint-homepage-operating-guide.md`

### 3. Create homepage review / content maintenance guide
Create a second practical guide focused on routine review and maintenance:

- weekly homepage review checklist
- monthly content cleanup checklist
- quarterly drift review checklist
- how to identify duplicate destinations
- how to identify outdated alerts, spotlight content, stale recognition content, or outdated links
- when to remove rather than revise
- when to escalate for architecture or governance review

Recommended filename:
- `docs/how-to/administrator/sharepoint-homepage-content-review-guide.md`

### 4. Define homepage-safe admin configuration boundary
Document the exact difference between:
- content editing
- governed homepage configuration
- design/template decisions
- architecture changes

Make it clear that admins may operate within governance boundaries but may not:
- repurpose Lane A webparts onto arbitrary pages
- create parallel nav systems
- create shell-takeover behavior
- create new template families without review
- convert the homepage into a general-purpose content board

### 5. Update navigation / docs routing
Update:
- `docs/README.md`
- `docs/architecture/blueprint/current-state-map.md`

Add the new docs with correct classification and routing.

### 6. Create the completion note
Create:
- `docs/architecture/plans/MASTER/spfx/homepage/phase-06/Phase-06-02-Completion-Note.md`

It should summarize:
- files created
- files updated
- major decisions locked
- the remaining future-phase items after Phase 06 closure

## Required operating distinctions

Your docs must clearly distinguish:

### Allowed with standard owner/admin process
- text refreshes
- link updates within approved destinations
- freshness maintenance
- routine content replacement inside approved homepage zones

### Allowed only with explicit approval
- changing homepage emphasis across zones
- adding new homepage destinations with wider organizational effect
- reclassifying a homepage content area
- changes that materially affect brand presentation or information architecture

### Architecture review required
- using Lane A webparts outside homepage
- creating new homepage custom surfaces
- changing zone architecture
- changing lane boundaries
- introducing automation or new custom-code behavior

## Risk Exposure

Key risks to manage:
- over-centralized process that becomes unworkable
- under-governed homepage edits that degrade quality
- admins making structural changes through convenience
- homepage becoming a substitute for good page architecture
- owner confusion between navigation governance and homepage governance

## Standards / Best Practices

- keep workflows pragmatic
- define request-routing examples
- prefer simple matrices over long prose
- show what belongs on the homepage and what does not
- make escalation decisions crisp
- reinforce that governance is there to preserve quality, not create bureaucracy for its own sake

## Verification

- verify consistency with Prompt 01 outputs
- verify consistency with Phase 05 navigation and branding governance
- verify docs routing is updated correctly
- verify no contradiction with the supported SharePoint customization posture
- if any code/config files are touched, run the narrowest relevant verification and report it

## Do not do

- do not implement workflow automation
- do not add new homepage webparts
- do not add property-pane engineering
- do not add async data integration
- do not create new code packages for governance concerns
