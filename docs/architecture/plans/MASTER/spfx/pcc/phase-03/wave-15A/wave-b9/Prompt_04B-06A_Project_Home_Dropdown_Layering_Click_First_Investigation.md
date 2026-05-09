# Prompt 04B-06A — Project Home Dropdown Layering and Click-First Accessibility Investigation

## Objective

Investigate and remediate the Project Home dropdown behavior introduced in Prompt 04B-06.

The current hosted/runtime screenshot indicates two likely production issues:

1. **Dropdown layering / z-index / clipping problem**
   - The Project Home dropdown appears to be visually constrained, clipped, hidden behind the hero, or otherwise not layering cleanly above the shell hero and page content.
   - This may be caused by `z-index`, stacking context, `overflow`, absolute positioning, or SharePoint/webpart container constraints.

2. **Interaction model issue**
   - The dropdown currently appears to require or depend on hover behavior.
   - For accessibility and predictable production use, the dropdown should be click/toggle-first, keyboard-accessible, and not hover-dependent.

This prompt is an **investigation-first corrective prompt**. The agent must investigate and report the current behavior before proposing and executing code changes.

Do not begin implementation until the investigation findings and proposed plan are produced.

---

## Required Initial Instruction

Before making any code changes, perform a focused investigation and provide a short plan for approval.

The plan must answer:

```text
1. Is the dropdown clipping, stacking, or z-index problem caused by PccHorizontalTabs styles, PccShell styles, PccProjectHeroBand styles, or a SharePoint/container stacking context?
2. Is the current dropdown actually hover-dependent, click-dependent, or both?
3. Does the caret button open/close reliably in local/unit test conditions?
4. Does the dropdown remain keyboard accessible when hover behavior is removed?
5. What is the smallest safe change needed to make the menu click-first and visually layered above the hero/bento content?
```

Hard stop after the investigation report unless the user has already approved the proposed plan in the same session.

---

## Current Baseline

Expected recent runtime baseline includes Prompt 04B-06 commit:

```text
021e03cf409fd49931d2fc3770d707ade4108128
```

Known state after Prompt 04B-06:

- Top-level nav:
  ```text
  Project Home | Documents | Project Readiness | Approvals
  ```
- Project Home dropdown children:
  ```text
  Team & Access
  External Platforms
  Control Center Settings
  Site Health
  ```
- Project Home tab direct click selects `project-home`.
- Adjacent caret button toggles dropdown only.
- Child surfaces are selectable from dropdown.
- Shell order remains:
  ```text
  Tabs → Hero → Bento
  ```
- Hero content model from Prompt 04B-02 remains:
  ```text
  heroHighlights + governanceMicrocopy
  ```
- Hero internal order from Prompt 04B-03 remains:
  ```text
  identity → facts → heroHighlights → governanceMicrocopy
  ```
- Bento composition remains unchanged.

Known concern from hosted visual evidence:

```text
The dropdown appears visually compromised after implementation, likely from z-index / clipping / stacking context, and the interaction model should be click-first rather than simple hover-open.
```

---

## Common Local-Agent Directive

You are operating inside the local `hb-intel` repo.

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

Use current repo truth. Do not rely on prompt history where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, tab/tabpanel accessibility, shell-owned active-panel semantics, bento direct-child invariants, package/lockfile/manifest safety, and the existing `PccBentoGrid` / `PccDashboardCard` contracts.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

Do not implement URL routing, command routing, active module state, live integrations, writeback, tenant mutations, external API calls, or broad redesign.

---

## Strict Scope

This prompt may inspect and, after plan approval, edit only the shell navigation and shell layout/style files needed to correct dropdown layering and interaction.

Likely runtime/style files:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
```

Only inspect/edit `PccProjectHeroBand.module.css` if the investigation proves that hero stacking context or overflow directly contributes to the dropdown layering problem.

Potential test files:

```text
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

Do not edit:

```text
apps/project-control-center/src/surfaces/**
apps/project-control-center/src/layout/**
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
apps/project-control-center/src/shell/surfaceHeroCopy.ts
apps/project-control-center/src/preview/projectShellViewModel.ts
e2e/pcc-live/**
playwright.pcc-live.config.ts
docs/**
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
package.json
apps/project-control-center/package.json
pnpm-lock.yaml
```

If correcting the layering issue requires files outside the allowed shell/nav/style/test scope, stop and report.

---

## Required Baseline Commands

Run and record before investigation:

```bash
git status --short
git branch --show-current
git log -1 --pretty='%H %s'
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

Inspect and record current package posture:

```text
apps/project-control-center/config/package-solution.json
apps/project-control-center/src/webparts/projectControlCenter/ProjectControlCenterWebPart.manifest.json
```

Hard stop if the working tree is dirty in shell navigation/layout/test files unless the user has explicitly identified those files as intentional and in-scope.

Pre-existing package/manifest/docs/version dirty files must remain unstaged and out of scope.

---

## Required Investigation Reads

Before proposing changes, inspect:

```text
apps/project-control-center/src/shell/PccHorizontalTabs.tsx
apps/project-control-center/src/shell/PccHorizontalTabs.module.css
apps/project-control-center/src/shell/PccShell.tsx
apps/project-control-center/src/shell/PccShell.module.css
apps/project-control-center/src/shell/PccProjectHeroBand.module.css
apps/project-control-center/src/tests/PccHorizontalTabs.test.tsx
apps/project-control-center/src/tests/PccShell.navigation.test.tsx
apps/project-control-center/src/tests/PccShell.responsive.test.tsx
```

---

## Required Investigation Searches

Run and classify:

```bash
rg -n "projectHomeMenu|projectHomeToggle|projectHomeNav|onMouseEnter|onMouseLeave|onFocus|onBlur|aria-expanded|aria-haspopup|Escape|ArrowDown|outside|relatedTarget" apps/project-control-center/src/shell apps/project-control-center/src/tests
rg -n "z-index|overflow|position:|absolute|relative|clip|transform|isolation|contain|stacking|box-shadow" apps/project-control-center/src/shell apps/project-control-center/src/layout apps/project-control-center/src/surfaces
rg -n "data-pcc-horizontal-tabs|data-pcc-project-home-menu-open|data-pcc-nav-toggle|data-pcc-surface-nav-child|data-pcc-parent-active|data-pcc-nav-child-active" apps/project-control-center/src
rg -n "fireEvent.mouseEnter|fireEvent.mouseLeave|fireEvent.click|ArrowDown|Escape|aria-expanded|tabbable|tabIndex" apps/project-control-center/src/tests
```

Classify findings as:

```text
DROPDOWN OPEN/CLOSE BEHAVIOR
STACKING CONTEXT
OVERFLOW / CLIPPING RISK
HOVER DEPENDENCY
CLICK-FIRST SUPPORT
KEYBOARD SUPPORT
TEST COVERAGE
HOSTED-RUNTIME RISK
```

---

## Required Investigation Report

Before editing, report:

### 1. Current open/close behavior

Identify whether the current implementation opens/closes by:

```text
hover
click/caret
focus
ArrowDown
Escape
blur
mouse leave
```

Explain which behaviors are primary, which are secondary, and which are risky.

### 2. Current layering chain

Identify the relevant CSS/layout chain:

```text
PccHorizontalTabs root
Project Home wrapper
dropdown menu
PccShell container
hero container
bento/main container
any overflow or z-index constraints
```

Report whether the issue is likely:

```text
z-index too low
ancestor overflow clipping
stacking context from positioned/transform/isolation parent
SharePoint/webpart host clipping
menu positioned relative to too-narrow parent
menu hidden by hero/main region
```

### 3. Accessibility risks

Report whether closed dropdown child surfaces:

```text
are tabbable
are visible to screen readers
are needed only as offscreen active labels
create duplicate pcc-tab-* ids
preserve main[role="tabpanel"] aria-labelledby
```

### 4. Proposed remediation plan

Provide the smallest safe plan, including:

```text
files to change
specific event handlers to remove or modify
specific CSS stacking/overflow fixes
specific tests to add/update
validation commands
hosted/runtime verification needs
```

Do not implement until the plan is approved.

---

## Expected Remediation Direction

Unless the investigation proves otherwise, the target behavior should be:

### Click-first interaction

```text
Caret click = primary open/close
ArrowDown on Project Home tab = opens menu and focuses first child
Escape = closes menu and returns focus to Project Home tab or caret
Outside click / blur outside = closes menu
Project Home tab click = selects Project Home and closes menu
Child click / Enter / Space = selects child surface and closes menu
```

### Hover is not authoritative

Remove hover-open as a primary behavior.

Allowed options:

```text
Option A: remove hover-open entirely
Option B: allow hover styling only, not open/close state
Option C: allow hover-open only if click/keyboard state remains authoritative and tests prove no accidental close before selection
```

Preferred: **Option A**.

### Layering target

Dropdown must render above:

```text
hero
hero highlights
bento grid
SharePoint webpart canvas content inside PCC
```

Expected fixes may include:

```text
positioning the dropdown relative to the tablist or Project Home wrapper
raising z-index using existing PCC/z-index tokens if available
ensuring shell/tab containers allow overflow where needed
avoiding overflow hidden on ancestors that clip the dropdown
using isolation only if needed and safe
```

Do not use arbitrary extreme z-index values unless there is no token/precedent. If a hard-coded z-index is unavoidable, document why and keep it modest.

### Portal/layer strategy

Do not introduce a portal/layer system unless the investigation proves CSS stacking/overflow cannot be solved safely inside the shell.

If a portal is required, stop and report before implementation.

---

## Accessibility Requirements

Preserve:

```text
Project Home role="tab" direct selection
caret button as button, not tab
child surfaces selectable
main[role="tabpanel"] aria-labelledby resolves for every active surface
no duplicate pcc-tab-* ids
closed child controls not tabbable
closed child controls not presented as visible navigation
active child offscreen label only when needed
```

Caret button requirements:

```text
type="button"
aria-label="Open Project Home related surfaces" or equivalent
aria-expanded reflects menu state
aria-controls points to menu id when applicable
not nested inside Project Home role="tab"
does not select Project Home when clicked
```

Menu requirements:

```text
opening menu exposes child controls
closing menu removes or disables child controls from tab order
Escape closes menu
outside click / blur outside closes menu
child selection closes menu
```

---

## Test Requirements After Approval

If changes are approved and implemented, update/add tests proving:

### Interaction

- Project Home tab click selects `project-home`.
- Caret click opens dropdown without selecting Project Home.
- Caret click closes dropdown.
- ArrowDown from Project Home opens dropdown and focuses/selects first child focus target as designed.
- Escape closes dropdown and returns focus to Project Home tab or caret.
- Child click selects correct child surface and closes dropdown.
- Enter/Space on child selects correct child surface and closes dropdown.
- Outside blur/click closes dropdown if implemented.

### Accessibility

- No interactive button is nested inside the Project Home tab.
- No duplicate `pcc-tab-*` ids exist with menu open or closed.
- Closed dropdown child controls are not tabbable.
- Active child surface still gives `main[role="tabpanel"]` a valid `aria-labelledby` target when menu is closed.
- Caret button has correct `aria-expanded` and accessible label.

### Layering / markers

Unit tests cannot fully prove z-index. Still add structural tests for:

```text
data-pcc-project-home-menu-open
data-pcc-nav-toggle
data-pcc-surface-nav-child
```

If CSS class behavior is changed, tests should verify state markers, not class names.

### Regression preservation

- Top-level visible tabs remain:
  ```text
  Project Home
  Documents
  Project Readiness
  Approvals
  ```
- Child surfaces remain under Project Home dropdown.
- `Tabs → Hero → Bento` order remains unchanged.
- Hero content remains unchanged.
- Bento composition remains unchanged.

---

## Validation After Implementation

Run:

```bash
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed source/test files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
git status --short
```

Do not use Jest-only flags such as:

```bash
--runInBand
```

Do not run hosted Playwright unless explicitly authorized.

Because this issue involves hosted visual layering and interaction, unit tests are not sufficient for final acceptance. Closeout must mark hosted/runtime evidence as operator-pending if not run.

---

## Hosted Runtime Verification Requirements

After deployment, hosted validation should explicitly verify:

```text
Project Home direct click selects Project Home
caret click opens/closes dropdown
hover alone is not required
ArrowDown opens dropdown
Escape closes dropdown
child selection works for Team / External Platforms / Settings / Site Health
dropdown appears above hero and bento content
dropdown is not clipped by SharePoint/webpart containers
dropdown remains usable at desktop and smaller breakpoints
no horizontal overflow introduced
```

If hosted evidence is not run from the agent session, closeout must state:

```text
Hosted/runtime evidence operator-pending — required because dropdown layering and click-first behavior cannot be fully proven in jsdom.
```

---

## Hard Stops

Stop and report if:

- the dropdown cannot be made click-first without breaking Project Home direct selection;
- the dropdown cannot layer above the hero without a portal/layer system;
- a portal/layer system appears necessary;
- child surface `aria-labelledby` cannot remain valid without exposing hidden keyboard stops;
- fixing z-index requires broad shell/hero/bento redesign;
- surface runtime files need edits;
- hero copy/content needs edits;
- bento composition needs edits;
- package, manifest, lockfile, docs, or Playwright files would change;
- tests require deleting coverage without equivalent replacement.

---

## Closeout Report Requirements

If only investigation is completed, report:

```text
findings
root cause hypothesis
recommended change plan
hard stops encountered
no files changed, if true
```

If implementation is completed after approval, report:

```text
files changed
root cause addressed
interaction behavior before/after
layering behavior before/after
hover behavior before/after
Project Home direct-click behavior
caret button behavior
keyboard behavior
child selection behavior
aria-labelledby behavior
duplicate-id status
closed child tab tabbability status
tests changed
validation results
lockfile hash before/after
package/manifest status
hosted runtime evidence status
remaining risks
```

Commit summary draft if implementation proceeds:

```text
fix(pcc): make Project Home dropdown click-first and layered above hero
```

Commit body should state:

- changed dropdown from hover-primary to click/keyboard-primary interaction;
- preserved Project Home direct selection;
- preserved child surface selection and tabpanel labelling;
- corrected dropdown layering/overflow behavior above the hero/bento region;
- preserved Tabs → Hero → Bento order and bento composition;
- added/updated interaction/a11y tests;
- did not change package/manifest/lockfile;
- hosted/runtime evidence operator-pending if not run.
