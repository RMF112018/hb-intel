# 01 — Package vs Repo-Truth Gap Register

## Purpose
This register compares the prior packages against the live repo and classifies where they were right, partial, wrong, or incomplete.

---

## A. What the prior packages got right

### A1. Wrapper ownership was correctly preserved
The prior packages correctly recognized that the embedded rail belongs in the wrapper-owned entry stack, not as a shell occupant or shell band member.

### A2. Flagship context was correctly preserved
The prior packages correctly preserved the explicit `homepage-flagship` context seam.

### A3. Shared surface direction was correctly preserved
The prior packages correctly treated the shared `HbcPriorityRail` family as the right rendering family.

### A4. Hosted outcome was correctly judged as unacceptable
The prior packages were right to conclude that the screenshot is not a closure-grade homepage command band.

---

## B. What the prior packages got only partially right

### B1. Width use
They correctly saw dead space, but they framed it too much as a pure CSS / layout issue.
Repo truth shows the space problem is also created by visible-set curation failure and literal group rendering.

### B2. Grouping / section logic
They identified weak grouping outcomes, but they did not elevate the exact root cause strongly enough:
- the visible set is selected linearly before group-aware curation,
- then the groups are rendered too literally.

### B3. Overflow
They were directionally correct that overflow still feels weak on larger surfaces, but they did not split:
- overflow trigger grammar,
- overflow strategy selection,
- and flagship secondary-command posture
cleanly enough.

### B4. Breakpoint and adaptive behavior
They correctly saw over-normalization, but they treated it mostly as a general adaptive issue.
The stronger framing is:
- current authored layout modes are not producing materially different flagship outcomes at enough breakpoints,
- and the proof burden for that divergence is too weak.

---

## C. What the prior packages got wrong or underframed

### C1. They did not treat hosted parity as P0
This is the single biggest weakness in the prior packages.

The screenshot does **not** resemble the flagship tile grammar already present in `main`.
That means the first closure question is not “how do we redesign the current live surface?”
It is “is the hosted surface actually running the current flagship path?”

### C2. They were too willing to redesign around the screenshot alone
That is unsafe because it risks:
- solving an already-solved repo concern,
- or masking a stale package / stale deployment problem with additional code churn.

### C3. They did not sufficiently separate render-layer waste from selection-layer waste
The prior packages treated the sparse outcome as one general quality failure.
It is actually at least two:
- bad visible-set curation,
- bad rendering of sparse sections.

### C4. They did not elevate contract honesty
`stickyAfterHero` still exists in the config contract.
If it is not materially implemented in a trustworthy way, that must be corrected or narrowed.
The prior packages treated this too lightly.

---

## D. What the prior packages missed entirely

### D1. The repo already contains a structurally upgraded flagship CSS/render path
This is a major repo-truth fact and it materially changes remediation sequencing.

### D2. Need for packaged-proof closure
The prior packages did not strongly require proof that the rebuilt `.sppkg` is the one actually deployed and rendering in SharePoint.

### D3. Need for runtime attribute proof
The prior packages should have required proof of the active DOM/runtime markers, including the wrapper and flagship context attributes.

### D4. Need for singleton-section compaction as a discrete closure unit
They mentioned the problem, but did not split it into a direct implementation unit with explicit “done” criteria.

---

## E. Replacement package response
This replacement package addresses those gaps by:

- moving hosted parity to Prompt 01
- isolating selection / grouping / compaction as separate closure units
- splitting overflow from general responsiveness
- splitting CSS density / width authority from selection logic
- requiring stronger runtime, packaged, and screenshot proof
