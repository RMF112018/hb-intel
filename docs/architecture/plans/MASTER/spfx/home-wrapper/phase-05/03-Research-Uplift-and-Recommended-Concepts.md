# 03 — Research Uplift and Recommended Concepts

## Why outside research changes the package

The attached package relied too heavily on internal framing.
External guidance strengthens the shell program in five practical ways:

1. it sharpens the argument for container-aware shell behavior
2. it justifies a shared entry-stack contract instead of isolated breakpoint logic
3. it raises the bar for reflow-safe proof
4. it supports a “top actions, not directory” policy for the utility band
5. it suggests better implementation patterns for style-level adaptation versus JS-level orchestration

## Research finding 1 — Breakpoints should be driven by content and container reality, not device labels alone

### What the research says
Responsive design guidance stresses that layouts should adapt to screen and interaction realities, and that breakpoints should be chosen based on when content needs to change rather than on named devices alone.

### Why it matters here
The shell already uses container-aware logic for `hbHomepage`, which is directionally correct.
The stronger package should extend that posture instead of drifting back toward device-name heuristics as the primary shell contract.

### Recommended shell implication
- Keep container-aware shell logic as the authority for shell-fit decisions.
- Where viewport/device classes remain necessary in adjacent entry-stack surfaces, bind them back to a shared shell-entry vocabulary instead of leaving them independent.

### References
- https://web.dev/responsive-web-design-basics/
- https://web.dev/learn/design/

## Research finding 2 — Container queries are the right companion to container-aware JS, not a total replacement for it

### What the research says
Container queries let components adapt based on ancestor/container size rather than viewport size.
They work best when style changes can be expressed in CSS, while APIs like `ResizeObserver` remain useful when behavior or JS orchestration depends on element dimensions.

### Why it matters here
The shell already uses `ResizeObserver`.
That is not wrong.
What is missing is a stronger division between:
- style-level adaptation
- behavioral orchestration
- conformance reporting

### Recommended shell implication
- Keep `ResizeObserver` for shell-owned behavioral orchestration and diagnostics.
- Add named-container and container-query concepts where style-level shell adaptation can move out of JS.
- Do not rewrite the shell around novelty. Use container queries where they materially reduce coupling.

### References
- https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver
- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Containment/Container_queries
- https://web.dev/learn/css/container-queries/

## Research finding 3 — Reflow proof needs to include constrained width and height states, not just named breakpoints

### What the research says
WCAG Reflow requires most content to work without two-dimensional scrolling at:
- 320 CSS px width for vertically scrolling content
- 256 CSS px height for horizontally constrained states

### Why it matters here
The attached package asked for closure artifacts but not proof against constrained reflow states.
The shell-entry breakpoint spec already talks about short-height constrained states and phone/portrait fallbacks.
The stronger package should make those proof targets explicit.

### Recommended shell implication
- Add reflow-oriented proof to shell closure.
- Treat short-height constrained conditions as first-class shell-entry states.
- Require proof that shell-owned entry behavior does not collapse into awkward two-dimensional scrolling for ordinary use.

### References
- https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
- https://www.w3.org/TR/WCAG22/#reflow
- https://www.w3.org/WAI/WCAG22/Techniques/general/G225

## Research finding 4 — Homepages should prioritize top tasks, not attempt exhaustive surfacing

### What the research says
Homepage guidance from GOV.UK emphasizes that a homepage is not exhaustive and should prioritize the most relevant or highest-impact tasks and content.
Top-task links are justified by evidence and should not become an indiscriminate directory.

### Why it matters here
This directly strengthens the doctrine requirement that quick links become prioritized actions.
It also supports shell-owned action budgets and overflow rules as a governance concern, not just a visual concern.

### Recommended shell implication
- Treat visible action count as a governed shell-entry policy.
- Preserve breakpoint-based primary action limits.
- Keep lower-priority items behind overflow or “More tools.”
- Do not let a future control panel turn the utility band into a flat directory.

### References
- https://design-guide.publishing.service.gov.uk/frontend-templates/homepage/
- https://www.gov.uk/guidance/content-design/content-types
- https://www.gov.uk/design-principles

## Research finding 5 — Shared contracts beat isolated responsive logic in composed systems

### What the research implies
When multiple surfaces participate in one first-view composition, isolated per-surface responsiveness creates drift.
A composed entry sequence benefits from a shared vocabulary for:
- entry state
- width budget
- stacking rules
- overflow rules
- compact or constrained modes

### Why it matters here
This is the missing idea in the attached package.
The shell is not only a lane manager.
It is the governor of the first meaningful homepage sequence after brand entry.

### Recommended shell implication
Create a shell-owned entry-stack contract that the hero, priority actions, and first shell lane can all consume or map to.

## Recommended concepts to add to the implementation package

### 1. Versioned shell layout policy
A versioned payload shape for future persisted layout settings.

### 2. Protected-vs-configurable decision matrix
A formal matrix that says what the shell keeps code-governed and what a future maintainer may safely change.

### 3. Shared entry-stack state vocabulary
A single shell-entry vocabulary used across hero, actions, and first-lane behavior.

### 4. Preset canonicalization rules
Hard rules for semantic roles, empty bands, and override permissions.

### 5. Shell conformance harness
A harness or test surface that demonstrates:
- stack or pair decisions
- constrained states
- persisted-policy rejection
- first-lane visibility expectations
- reflow-safe outcomes

### 6. Proof-oriented closure artifacts
Not just a summary doc.
A reviewable package of:
- tests
- preview examples
- rejection examples
- breakpoint matrix proof
- shell-only closure notes

## Bottom line

The research does not justify a brand-new architecture.
It justifies a sharper one.

The strongest uplift is not a library recommendation.
It is the shift from isolated future-control-panel groundwork to a **shared shell-entry contract plus proof-grade governance boundaries**.
