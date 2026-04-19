# Execution and Closure Checklist

## Required proof items

### A. Hosted parity proof
- identify whether the attached `.sppkg` matches the repo’s intended implementation
- identify whether the tenant is rendering the intended path
- state the actual mismatch clearly

### B. Change proof
- list every changed file
- explain why each changed file was necessary
- avoid unrelated homepage drift

### C. Build/package proof
- list exact commands run
- identify the resulting package output path
- identify any version changes made to ensure a fresh deploy

### D. Hosted visual proof
- provide before/after screenshots
- explicitly compare the old screenshot to the new hosted result
- explain the material visual delta in plain language

### E. Rail-specific proof
The after state must show clear improvement in at least the following:
- stronger tile hierarchy
- materially better density/rhythm
- less wasted framing
- more deliberate grouping or grouping suppression
- stronger command-band identity
- clearer overflow treatment where applicable

## Hard fail conditions

Do **not** close if any of the following is true:

- there were no code or packaging changes
- the package was rebuilt but the hosted output remained materially the same
- the work drifted into unrelated homepage redesign
- the explanation relies on “already present in repo”
- the proof is local-only and not hosted
- the after screenshot can still reasonably be described as the same generic sparse card row

## Agent efficiency rule

Do not re-read files already in active context unless needed to confirm drift, dependencies, build/package truth, or uncertainty after changes.
