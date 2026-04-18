# 04 — Research and Standards Notes

## Why research is part of this package

The enhanced package is not only repo-truth based. It also incorporates current implementation guidance that materially affects the command-band end state.

## Research-backed implementation implications

### 1. Stable identity is mandatory for reordered editable collections
React’s current guidance on keys and state preservation makes the underlying risk explicit: identity should be stable across insertions, deletions, and reordering, and index-coupled identity leads to subtle bugs.

**Implication for this package:** the admin cannot keep binding persisted item IDs by array position after reorder/add/remove. It needs a stable persisted identity model plus draft-local identity.

### 2. Anchored overflow should use a real floating interaction model
Floating UI’s React guidance centers on `useFloating`, anchor positioning, `autoUpdate`, dismissal, role assignment, and focus management for accessible popovers.

**Implication for this package:** the public rail should not stop at an inline accordion-style overflow if the spec calls for anchored overflow on larger breakpoints. Desktop/laptop overflow should use a real anchored overlay model.

### 3. Tooltips and complex primitives should inherit accessible keyboard/focus behavior
Radix documents accessible tooltip and scroll-area primitives with expected keyboard behavior and focus handling.

**Implication for this package:** compact overflow, tooltip clarification, and scrollable panels should be implemented with primitives that preserve keyboard behavior and accessibility rather than ad hoc DOM patterns.

### 4. SPFx closure requires hosted validation, not local confidence alone
Microsoft’s current SPFx guidance continues to emphasize hosted workbench / hosted runtime validation, responsive host-fit, and explicit accessibility work in the web part itself.

**Implication for this package:** final closure cannot stop at local compile/test success. Hosted behavior, keyboard flow, edit-mode safety, and runtime proof remain mandatory.

### 5. Reduced-motion and contrast proof should be measured, not assumed
Current accessibility guidance remains clear that:
- reduced-motion preferences must be respected
- contrast targets must be verified
- focus indicators must remain visible

**Implication for this package:** styling closure must require measured contrast/focus/reduced-motion proof, not a generic statement that accessibility was “kept intact.”

## How this changes the prompts

The original wave-02 package used some of these ideas in broad terms.

The enhanced package bakes them directly into:
- structural identity work
- overflow and breakpoint behavior
- validation scope
- proof-of-closure expectations
