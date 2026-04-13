# 01 — Execution Sequence and Wave Map

## Execution rule

Do not collapse this into one giant change set.

Complete the implementation in bounded waves, with closure evidence after each wave.

## Wave sequence

### Wave 1 — Repo truth and impact map
Objective:
- identify the exact owning package/app/surfaces in the live repo
- locate legacy article-publisher code paths
- determine reuse vs replace vs isolate

Primary output:
- impact map
- implementation tracker
- architecture-to-code alignment note

### Wave 2 — List provisioning and domain contracts
Objective:
- provision or refactor the SharePoint list model
- create typed interfaces and repositories

Primary output:
- list provisioning scripts
- contract types
- repository/service scaffolds

### Wave 3 — Service layer and template resolution
Objective:
- implement the business logic for posts, child records, template registry, and bindings
- resolve template and validation profiles deterministically

Primary output:
- service layer
- resolver logic
- mapping contracts

### Wave 4 — XML-shell page-generation engine
Objective:
- implement the page-shell generation logic driven from the saved XML template
- create/update pages on Project Spotlight

Primary output:
- shell service
- page creator/updater
- shell version tracking

### Wave 5 — Content mapping and page binding
Objective:
- map post content to banner/text/team/gallery blocks
- persist durable page bindings and republish behavior

Primary output:
- injection/mapping layer
- page-binding writer/update logic
- republish/regenerate policy implementation

### Wave 6 — Authoring UI and workflow
Objective:
- implement the app UI for structured authoring and operational workflow

Primary output:
- authoring surfaces
- workflow actions
- publish controls
- binding/status views

### Wave 7 — Validation, preview, and governance
Objective:
- implement template-aware validation and a preview path driven by the same pipeline as publish

Primary output:
- validation engine
- preview experience
- governance guardrails

### Wave 8 — Team Viewer closure
Objective:
- confirm the renderer contract and fully close the Team Viewer path within the shell

Primary output:
- Team Viewer adapter
- empty-state behavior
- profile-driven defaults

### Wave 9 — Testing, hosted vetting, build proof
Objective:
- prove the implementation works end to end

Primary output:
- automated tests
- hosted verification evidence
- clean build/package proof

## Movement rule

Do not move to the next wave until:
- the current wave objective is closed
- docs/evidence are updated
- known gaps are explicitly documented
