# Render Stability and Performance Assessment

## A. React Render Stability

### Finding
The surface is not render-stable under ordinary UI interaction.

### Why
- `ProjectSitesRoot` owns many local state slices, which is expected.
- The problem is not the number of states by itself.
- The problem is that several of those state changes trigger **avoidable full-tree work**:
  - the layout hook can reclassify mode based on content height
  - the grid is intentionally remounted on scope/sort changes
  - project entries are re-normalized into fresh objects on every render
  - cards are not shielded from rerender cascades after upstream identity churn

### Practical effect
Even benign interactions can look like:
- control-bar jump / wrap jitter
- card-grid “blink”
- transition replay
- visual instability that is difficult to capture as a single static artifact

## B. React Query and Data Lifecycle

### Stable aspects
- query keys are generally well-formed
- repository is singleton-scoped
- stale times are sensible
- retries are conservative

### Unstable aspect
The project query result is normalized in the hook render path:
- raw query data may be stable
- normalized entry objects are recreated anyway
- downstream memoization is weakened
- child surfaces receive fresh object identities on UI-only rerenders

### Assessment
React Query usage itself is not the primary problem. The issue is how query output is transformed and consumed.

## C. Mount / Runtime Seam

### Finding
The active mount seam is structurally unsafe for repeated shell renders.

### Why
`apps/project-sites/src/mount.tsx`:
- bootstraps auth every mount
- creates a new `QueryClient` every mount
- creates a new React root every mount

`ShellWebPart.ts`:
- calls `mount(...)` inside `render()`

There is no guard in the mount host comparable to the safer pattern in `ProjectSitesWebPart.ts`.

### Assessment
This is a high-confidence defect. What is not yet proven is how frequently SharePoint is causing repeat shell renders in the user’s environment. The code path is still unsafe even before that proof.

## D. Layout and Visual Stability

### Finding
The current layout system is the strongest direct cause candidate for transient glitches.

### Why
`useProjectSitesContainerState` observes the root section and feeds both:
- width
- height

into mode selection.

Mode selection rules:
- height <= 559 → `compact`
- else width threshold decides `wide` / `medium` / `compact`

Because root height is content-driven, mode can change when:
- the result count changes
- the filter panel opens
- the control bar wraps
- the page transitions from loading to success
- the grid becomes sparse
- the user filters down to one or two cards

This is a self-referential responsive model.

### Assessment
This violates the spirit of the governing doctrine’s stability and container-awareness requirement. It is dynamic, but not compositionally stable.

## E. Animation / Perceived Performance

### Finding
Animations are not inherently excessive, but they are attached to unstable transition points.

### Why
- the grid animates on mount
- the filter panel animates on open
- shimmer and provisioning indicators animate continuously
- when the grid is remounted intentionally, the grid animation replays

### Assessment
The motion system is amplifying instability that the code is already creating.

## F. Card Rendering and List Rendering

### Finding
Card rendering work is heavier and less stable than necessary.

### Why
- metadata arrays are memoized inside the card, which is good
- but card `entry` props are not identity-stable upstream
- ordinary root state changes can therefore rerender the whole card list
- the grid remount key bypasses incremental reconciliation altogether on scope/sort changes

### Assessment
The card component is not the primary bug. The upstream identity and remount strategy are.

## G. SharePoint Host-Fit and Packaging Implications

### Proven issues
- the active shell path is less stable than the direct webpart pattern
- manifest seams are duplicated and currently drift on `supportsFullBleed`

### Likely host consequence
Any host-triggered render event is riskier than it should be because the app-host mount contract is not incremental.

## Bottom Line
The current implementation feels like a surface that has been optimized for feature completion and appearance, but not yet hardened for long-lived hosted runtime stability. The largest wins will come from:
1. removing structural remount patterns,
2. stabilizing responsive state derivation, and
3. making the shell mount contract safe on repeat render.
