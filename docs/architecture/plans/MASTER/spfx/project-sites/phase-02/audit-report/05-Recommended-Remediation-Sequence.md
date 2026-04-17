# Recommended Remediation Sequence

## 1. Make the active shell mount/runtime seam idempotent
### Why first
If the host can still reboot the entire app on rerender, downstream UI stabilization work will be less trustworthy.

### Required outcome
- repeated shell `render()` calls do not recreate the React root
- repeated shell `render()` calls do not recreate `QueryClient`
- auth bootstrap is not repeated unnecessarily
- the mounted tree updates incrementally rather than rebooting

## 2. Replace self-observed content-height layout logic
### Why second
This is the strongest direct glitch driver inside the app’s own rerender path.

### Required outcome
- layout mode is derived from stable inputs
- content height no longer decides compact mode
- no-op observer callbacks do not force rerender
- wide desktop surfaces stay wide when the result set is short

## 3. Remove forced grid remount behavior and confine motion to stable transitions
### Why third
Once the shell and layout seams are stable, the next most visible source of flicker is the deliberate remount path.

### Required outcome
- scope/sort changes update the grid without subtree replacement
- entry animation does not replay on ordinary sort/scope/filter updates
- transitions feel incremental

## 4. Stabilize normalized data identity and reduce downstream rerender churn
### Why fourth
This is an amplifier rather than the first-order bug, but it will materially improve runtime smoothness.

### Required outcome
- normalization occurs once per data change
- visible entry derivation avoids unnecessary object churn
- card rerenders are reduced during UI-only state updates

## 5. Add regression tests for shell rerender, layout stability, and transition safety
### Why fifth
The current test suite proves feature behavior more than runtime durability.

### Required outcome
- repeated shell render path is covered
- layout hook equality and stability are covered
- short-result desktop layouts do not collapse spuriously
- scope/sort changes do not remount the grid

## 6. Align manifest seams and clean minor drift
### Why last
This is not the glitch driver, but it should be closed before calling the surface hardened.

### Required outcome
- authoritative manifest path is documented
- duplicate manifest copies are aligned
- historical review docs that no longer match current repo truth are not relied on as proof
