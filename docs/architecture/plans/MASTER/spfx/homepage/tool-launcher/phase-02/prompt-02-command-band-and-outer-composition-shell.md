# Prompt 02 — Command Band and Outer Composition Shell

## Objective

Implement the **outer desktop composition shell** and the **top command band** for Tool Launcher / Work Hub so the launcher begins reading as a productized command surface rather than a grouped card list.

## Required stance

- repo truth first
- do not re-read files still in current context unless needed
- preserve Lane A homepage boundaries
- do not overbuild final search behavior in this prompt
- do not let the command band visually compete with the Signature Hero

## Existing implementation context

Use the launcher anatomy and structural direction established in Prompt 01.

Review at minimum:

- the output of Prompt 01
- `apps/hb-webparts/src/webparts/toolLauncherWorkHub/ToolLauncherWorkHub.tsx`
- `apps/hb-webparts/src/homepage/ReferenceHomepageComposition.tsx`
- any launcher shell/helper/component files introduced by Prompt 01

## Command band requirements

Implement a command band that can support:

- launcher title / identity
- optional supporting line
- future search entry point
- utility actions such as:
  - all platforms
  - favorites
  - need help
  - request access

At this phase, it is acceptable for some actions to be placeholder-safe or minimally interactive **as long as the shell and affordance model are correct**.

## Outer shell requirements

The desktop launcher outer shell must:

- establish clear hierarchy between the command band and content regions below
- preserve generous but intentional spacing
- read as a premium utility-zone product surface
- behave safely when some command-band data is unavailable
- avoid app-shell mimicry or faux navigation chrome

## Required output

Produce a markdown file named:

- `phase-02-command-band-implementation-notes.md`

The file must include:

### 1. Outer shell structure
What was introduced and why.

### 2. Command band behavior in skeleton form
What is live now vs deferred.

### 3. Data assumptions
Which normalized launcher fields are used here.

### 4. Empty / partial-data posture
How the command band degrades safely.

### 5. Follow-on hooks for later phases
What later phases will deepen without replacing the structure.

## Additional instruction

If the existing grouped launcher primitive is still present, do **not** let it dictate the outer composition. The composition shell should own hierarchy and layout first.
