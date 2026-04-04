# 01 — Component Inventory and Lane Assignment

**Naming guard**

- Do **not** title or name the package as `homepage`, `home page`, `homepage-webparts`, `hb-central-homepage`, or any other homepage-labeled package.
- The package name must be exactly: `hb-webparts`.

## Objective

Lock the first-release homepage component inventory, packaging lane assignment, data/config model, and implementation sequence before deeper build work begins.

## Required Context

- Live repo: `RMF112018/hb-intel`
- This package’s `00_Implementation_Summary.md`
- This package’s `11_Risk_Exposure.md`
- This package’s `12_Standards_and_Best_Practices.md`
- Relevant current-state docs, ADRs, package READMEs, and live source files in the repo

## Operating Rules

- Use **repo truth first**. Inspect the live code and current authoritative docs before editing.
- Do **not** re-read files that are already in your current context or memory window.
- Do **not** broaden scope beyond the HB Central homepage webpart system.
- Do **not** create placeholder or stubbed production code.
- Prefer updating existing authoritative docs over creating redundant documents.
- Preserve SharePoint-native authoring and page composition.
- Default to lightweight homepage webparts unless this prompt explicitly authorizes an exception.
- Keep imports narrow and homepage-safe.
- Record any doc/code contradiction you find instead of silently choosing one source.
- At the end, provide a concise handoff note with changed files, verification, risks, and next-prompt readiness.

## Implementation Tasks

1. Audit the live repo surfaces most relevant to homepage delivery:
   - `packages/ui-kit`
   - `packages/spfx`
   - any existing homepage-like or editorial/spotlight patterns
   - relevant SPFx packaging/build docs and current-state references

2. Create a **homepage component inventory matrix** covering all ten first-release webparts:
   - component name
   - homepage class
   - default lane
   - intended page zone
   - primary data source / content source
   - property pane requirements
   - audience / role awareness needs
   - whether the component is above the fold
   - expected shared homepage primitives used

3. Create a **lane assignment decision record** that explicitly confirms:
   - first-release default = lightweight homepage webparts
   - no first-release component is allowed to become a routed mini-app by default
   - any exception request must be documented and justified

4. Propose the **repo structure** for the homepage system.
   Prefer a structure that clearly separates:
   - shared homepage primitives
   - homepage webpart implementations
   - homepage configuration/data seams
   - homepage documentation

5. Lock the **implementation order** for the remaining prompts.
   Dependencies must be explicit so later prompts can assume stable scaffolding.

6. Update or create the minimum authoritative documentation needed so downstream prompts are not forced to infer structure.

7. If you find a packaging ambiguity in the current repo, resolve it in documentation now, even if code work happens in a later prompt.

## Required Deliverables

- a homepage component inventory markdown file
- a homepage lane-assignment markdown file
- a recommended repo structure / directory map
- a sequenced implementation plan for Prompts 02–10
- updates to any existing authoritative docs that need to point at this homepage program

## Verification

- run type-safe validation on any touched config or TypeScript files
- confirm every first-release component has an explicit lane and data/config owner
- confirm the prompt sequence is dependency-safe
- confirm no component has been left as “decide later”

## Definition of Done

- all ten webparts are locked in scope with explicit lane assignment
- the repo structure for homepage work is documented
- downstream prompts can proceed without reopening the inventory question
- any packaging ambiguity discovered has been made explicit in docs

## Implementation Status (Closed)

Prompt-01 deliverables are implemented in this package:

- `01A_Component_Inventory_Matrix.md`
- `01B_Lane_Assignment_Decision_Record.md`
- `01C_Repo_Structure_and_Prompt_Sequence.md`

Packaging ambiguity resolution is recorded in `01B_Lane_Assignment_Decision_Record.md`:

- manifest patch bump is deferred until `hb-webparts` exists as a scaffolded manifest target.
