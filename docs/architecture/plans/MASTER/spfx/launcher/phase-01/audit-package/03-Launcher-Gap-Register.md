# Launcher Gap Register

## Gap 01 — Legacy launcher family not cleanly retired
### Evidence
- `packages/ui-kit/src/homepage.ts` still exports `HbcHomepageLauncher`
- `packages/ui-kit/src/HbcHomepageLauncher/constants.ts` still reports `1.1.70.0`

### Why it matters
The flagship homepage path may be cut over, but the repo still advertises a legacy launcher family with stale runtime truth. That weakens ownership clarity and makes it harder to prove what the active launcher boundary actually is.

### Severity
High

### Correction direction
Retire, quarantine, or explicitly demote the legacy `HbcHomepageLauncher` family so it cannot be mistaken for active homepage launcher authority.

---

## Gap 02 — Dedicated package version truth is incomplete
### Evidence
- `packages/homepage-launcher/package.json` remains `0.1.0`
- `packages/homepage-launcher/src/constants.ts` reports `1.1.72.0`

### Why it matters
The runtime marker proves the deployed homepage package version, but the dedicated launcher package itself does not carry matching semantic version truth. That is acceptable for an internal workspace package, but weak for auditability and closure.

### Severity
Medium

### Correction direction
Either align package versioning or document, enforce, and test the deliberate decoupling so the mismatch is not ambiguous.

---

## Gap 03 — Manifest truth is only partially aligned
### Evidence
- both homepage manifests are `1.1.72.0`
- descriptive text is not aligned across the two manifest copies

### Why it matters
Version numbers line up, but descriptive drift is evidence that package-truth alignment is only partial. That is not a runtime break, but it is closure debt.

### Severity
Medium

### Correction direction
Normalize both manifest copies and package description text to one authoritative launcher-aware description set.

---

## Gap 04 — Dedicated launcher package is too raw-CSS heavy
### Evidence
- `packages/homepage-launcher/src/homepage-launcher-surface.module.css` contains extensive hardcoded color, spacing, radius, and shadow values

### Why it matters
This conflicts with the homepage overlay’s token-discipline posture and makes future refinement more brittle. It also weakens the claim that the launcher is now governed as a flagship surface rather than just rewritten.

### Severity
High

### Correction direction
Move the launcher surface toward governed tokens, shared primitives, or at least a local launcher token layer with explicit semantic naming.

---

## Gap 05 — Premium-stack adoption is incomplete
### Evidence
The dedicated package materially uses:
- `clsx`
- `lucide-react`

But does not materially use:
- `@radix-ui/react-scroll-area`
- `class-variance-authority`
- `motion`
- a governed dialog/sheet primitive

### Why it matters
The doctrine does not require symbolic installation only. It expects deliberate use of the approved stack where relevant. A launcher with overflow tray, dialog behavior, and flagship ambitions is exactly where more of the stack would help.

### Severity
Medium-High

### Correction direction
Adopt the relevant premium primitives where they materially improve:
- overflow rail polish
- variant discipline
- dialog semantics
- state transitions

---

## Gap 06 — Dialog accessibility is incomplete
### Evidence
`HomepageLauncherSurface.tsx` implements:
- `role="dialog"`
- `aria-modal="true"`
- Escape close
- backdrop click close

But does not implement:
- focus trap
- focus restoration to trigger
- explicit initial focus management
- reduced-motion-specific motion handling

### Why it matters
This is sufficient for a working demo, not for closure-grade flagship accessibility.

### Severity
High

### Correction direction
Replace or harden the drawer with a proper dialog/sheet primitive and explicit focus lifecycle behavior.

---

## Gap 07 — Verification posture is strong but not consolidated
### Evidence
Meaningful proof files exist:
- `hb-homepage-host-fit.spec.ts`
- `hb-homepage-handheld-closure-proof.spec.ts`
- `hb-homepage-launcher-productization-capture.spec.ts`
- `homepage.launcher.handheld.live.spec.ts`

But repo-root scripts are generic and there is no obvious single launcher-specific closure command surfaced from the root.

### Why it matters
Evidence exists, but the closure path is not as crisp as it should be for a freshly cut-over flagship boundary.

### Severity
Medium

### Correction direction
Create or expose a dedicated launcher verification entrypoint that runs the relevant proof cluster and captures artifacts consistently.

---

## Gap 08 — Flagship visual proof is still indirect in this audit pass
### Evidence
This pass used live repo source plus committed proof seams, but no fresh hosted screenshots were attached in the current request.

### Why it matters
Without fresh visual evidence, the launcher can be rated only as directionally strong from source and tests, not conclusively flagship from appearance.

### Severity
Medium

### Correction direction
Run the closure proof matrix after the remaining cleanup work and review the hosted screenshots as a final visual acceptance gate.
