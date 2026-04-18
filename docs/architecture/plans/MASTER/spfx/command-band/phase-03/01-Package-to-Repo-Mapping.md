# 01 — Package-to-Repo Mapping

## Existing prompt mapping

### Attached Prompt 01
`Prompt-01-Repair-Admin-Draft-Persistence-and-Reorder-Trust.md`

#### Repo seams it targets
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/homepage/data/priorityActionsAdminState.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsContracts.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsListWriter.ts`

#### Mapping accuracy
Accurate.

The attached prompt points at the correct files and the underlying issue is still real in `main`.

#### What repo truth says
The admin currently:
- loads persisted items and derives drafts correctly
- but later saves by pairing `itemDrafts[i]` with `resolvedItems[i]?.id`
- reorders only the local array and rewrites draft `sortOrder`
- never calls the dedicated reorder seam during the authoring flow
- archives immediately instead of modeling archive intent coherently

#### Assessment
- Issue still real: **Yes**
- Framed correctly: **Mostly**
- Too broad: **A little**
- Too shallow: **Yes**
- Preserve / rewrite / split / merge / delete: **Rewrite and expand**

#### Why rewrite is required
The attached prompt names the core bug but does not force the code agent to design a full lifecycle model:
- persisted identity
- draft identity
- creation intent
- archive intent
- reorder intent
- confirmation / discard truth
- post-save reconciliation

That must be made explicit.

---

### Attached Prompt 02
`Prompt-02-Complete-Admin-Authoring-Workflow-and-Permission-States.md`

#### Repo seams it targets
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/priority-actions-rail-admin.module.css`
- `apps/hb-webparts/src/homepage/data/priorityActionsValidation.ts`
- `apps/hb-webparts/src/homepage/data/priorityActionsAdminState.ts`

#### Mapping accuracy
Mostly accurate, but incomplete.

#### What repo truth says
The admin surface already has:
- a sectioned layout
- item editing
- add/archive/reorder controls
- a validation summary
- a preview pane

But it still lacks:
- integrated permission resolution and runtime gating
- search/filter/library ergonomics
- honest preview fidelity across the authored device model
- explicit lifecycle/status treatment for new vs persisted vs archived vs invalid items
- clearer maintainer-product posture

#### Assessment
- Issue still real: **Yes**
- Framed correctly: **Yes**
- Too broad: **Yes**
- Too shallow: **Yes**
- Preserve / rewrite / split / merge / delete: **Split**

#### Why split is required
This prompt currently mixes:
- permission/state integration
- authoring IA completion
- preview fidelity
- admin product polish

Those are related, but not identical. The enhanced package splits them across:
- contract/validation hardening
- runtime/preview alignment
- admin product completion

---

### Attached Prompt 03
`Prompt-03-Rebuild-Shared-Priority-Rail-Surface-Family.md`

#### Repo seams it targets
- `packages/ui-kit/src/HbcPriorityRail/*`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`

#### Mapping accuracy
Accurate.

#### What repo truth says
The shared family exists and is reusable, but it still behaves like:
- a premiumized action list
- with flat visible items
- with a simple inline expandable overflow
- with only `rail`, `grid`, and `compact` layout modes
- without honest support for grouped/segmented command-band compositions

#### Assessment
- Issue still real: **Yes**
- Framed correctly: **Yes**
- Too broad: **Slightly**
- Too shallow: **Yes**
- Preserve / rewrite / split / merge / delete: **Rewrite and pair with a new consumer-alignment prompt**

#### Why rewrite is required
The surface-family problem is real, but the attached prompt assumes rebuilding the shared family alone is enough.

Repo truth shows a second necessary closure unit:
- public/runtime and preview consumers must be realigned to the richer config model after the shared family is upgraded

That missing consumer prompt is one of the biggest omissions in the attached package.

---

## Missing prompt candidates not present in the attached package

### 1. Contract / validation / write-integrity hardening
Missing entirely.

Needed because:
- the validation layer declares more issue kinds than it enforces
- config / item contract breadth exceeds actual runtime enforcement
- write behavior and preview behavior need stronger coherence

### 2. Public-runtime and preview alignment
Missing entirely.

Needed because:
- current device model is viewport-driven and coarse
- preview has only three modes while the runtime contract distinguishes five device classes
- config layout modes are only partially honored

### 3. Token discipline and closure-proof refresh
Missing entirely.

Needed because:
- the CSS still contains hardcoded values
- the visual language still reads as “tinted card with list”
- closure docs overstate completion relative to actual evidence

---

## Package-level mapping conclusion

The attached package should not be deleted conceptually.
Its three prompts map to three real gap clusters.

But the final package should:
- rewrite all three
- split one of them
- add three missing prompts
- resequence the whole wave around actual dependencies
