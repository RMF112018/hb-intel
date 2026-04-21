# UI / UX Assessment

## A. What is genuinely strong and should be preserved

### 1. Thin-webpart architecture

The core webpart is doing the right amount of work and no more.

Preserve:

- the thin SPFx integration layer
- list fetch / fallback split
- normalization before rendering
- mapping into a shared surface model

This is a good foundation and should not be thrown away.

### 2. Container-aware intent

The layout-mode system is serious enough to keep.

Preserve:

- explicit `wide | medium | compact | minimal` modes
- width-threshold resolution
- vertical-pressure step-down
- `ResizeObserver` ownership at the surface level

This is one of the strongest architectural choices in the current implementation.

### 3. Explicit disclosures

The surface is not relying on hover, mystery meat affordances, or brittle “responsive” hiding.

Preserve:

- details behind an explicit button
- history behind an explicit button
- button semantics and `aria-expanded`
- `hidden` for collapsed regions
- reduced-motion handling

### 4. State handling

Loading, empty, and error states are present and appropriately distinct.

Preserve:

- author-safe state resolution
- fetch failure separation from “no data” scenarios
- manifest fallback path for demo / local / packaging cases

## B. Directionally useful, but still insufficient

### 1. Editorial masthead concept

The masthead structure is not wrong, but it currently front-loads style more than meaning.

What is useful:

- section eyebrow
- section heading
- section-level “View all projects” action

What is insufficient:

- the masthead is not the problem; the featured block below it is
- the first view still fails because the actual project story begins too low
- the masthead feels correct in isolation but disconnected from first-view value

Correction direction:

- preserve the masthead concept
- tighten its vertical budget
- make sure the featured story starts meaningfully higher relative to it

### 2. Featured media as the dominant object

The idea of an image-led flagship project surface is right.

What is insufficient:

- the current implementation assumes media dominance is always beneficial
- the surface does not degrade intelligently when image truth fails
- the placeholder is visually loud, oversized, and structurally destructive

Correction direction:

- preserve “image-led when image is real”
- add a **distinct missing-media posture**
- when media is absent or unresolved, the layout must become **title-led**, not “empty hero led”

### 3. Supporting rail as explicit secondary history

The supporting rail is correctly framed as subordinate content.

What is insufficient:

- when expanded, it still consumes too much height and reads as a second big surface
- the wide/medium open-by-default posture is too generous relative to the current vertical budget
- the footer CTA is fine, but the rail block still feels over-built for the amount of value shown

Correction direction:

- keep explicit history access
- reduce visual mass
- consider a preview-row posture or default-closed posture even in wide/medium unless headroom is truly available

## C. Structurally weak or strategically wrong

### 1. Missing-media posture is the largest failure

In the hosted screenshots, the featured card is visually dominated by a giant empty image region with “PROJECT IMAGE” centered inside it.

Why this matters:

- it violates the doctrine’s prohibition on large empty hero slabs
- it makes absence look like the main content
- it buries the featured project’s title and summary
- it weakens the row against HB Kudos, which is dense, legible, and immediately purposeful

Required correction:

- create a dedicated **no-media / failed-media** layout
- reduce hero height dramatically when media is absent
- suppress billboard placeholder copy
- move title, signal, summary, and CTA upward

This is a **structural redesign**, not a polish pass.

### 2. First-view hierarchy is too weak on large screens

At 2560x1440, 1920x1080, and 1512x982 retina, the Spotlight takes the major slot but spends too much of that slot on empty visual mass before the user reaches the actual story.

Why this matters:

- the first lane should justify Spotlight’s dominant slot
- the first screen should communicate the project quickly
- large-screen width is being used, but not converted into stronger information hierarchy

Required correction:

- either overlay more of the story on the media when an image exists
- or reduce media height enough that title + summary + next action enter first view
- or both

This is a **structural redesign**.

### 3. Compact and minimal states are not selective enough

The mobile state is directionally cleaner because disclosures collapse, but the media area still feels too tall relative to the amount of story content surfaced above the fold.

Why this matters:

- “smaller screen” should mean “faster clarity,” not “same hierarchy in a thinner shell”
- the minimal state still allocates too much height to context and too little to message
- the mobile screenshots show a respectable button model but not a decisive story-first composition

Required correction:

- shrink the minimal hero further, especially on missing-media
- consider moving the title above the media in `minimal` when no real image exists
- ensure at least one meaningful project signal is visible without opening details

This is **targeted redesign**, not just numeric tuning.

### 4. The styling system is not benchmark-clean

The module CSS is filled with raw hardcoded values.

Why this matters:

- it conflicts with the doctrine and benchmark direction
- it makes the “premium” result feel more hand-tuned than governed
- it increases maintenance risk when future homepage work needs consistent surface families

Required correction:

- introduce a local Spotlight token bridge or governed surface tokens
- replace direct literals for colors, spacing, radii, elevation, and motion where feasible
- clean up primitive choices (`Separator`, governed overlay behavior, variant discipline)

This is **refinement with some structural cleanup**.

### 5. The featured CTA path is too fragile

If the data does not include a strong featured CTA, the user can be left with a beautiful headline area but a weak next action.

Why this matters:

- a flagship spotlight should never feel like a dead-end story card
- section-level “View all projects” is not enough by itself
- the featured story should usually have a canonical next action, even when authored data is thin

Required correction:

- define a fallback CTA policy
- allow the section-level destination to backfill the featured CTA when item-level CTA is absent
- keep the action honest and explicit

This is **refinement**, but it materially affects UX quality.

## D. Why the current implementation still underperforms despite good architecture

The problem is not that the codebase lacks thought.

The problem is that the architecture has outpaced the runtime result.

The implementation talks like a flagship editorial surface, but the hosted output still behaves like:

- a strong shell around unresolved media truth
- a generous vertical layout without enough high-value content in the first view
- a styled module that still depends too heavily on perfect content conditions

That is why the audit outcome is not “rebuild everything.” It is:

- preserve the ownership seams
- preserve the mode system
- rebuild the **runtime visual and experiential contract**
