# P0-A2 Divergence Log — Blocker Resolution Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve all open blockers and housekeeping items in the P0-A2 Divergence Log so Phase 1 entry gate sign-off can proceed.

**Architecture:** Five independent workstreams targeting five divergences (D-004, D-005, D-006, D-008, D-010). Each produces standalone, committable documentation changes. D-005 and D-010 include human decision points that gate sub-tasks. Work is purely documentation and governance — no application code changes.

**Tech Stack:** Markdown documentation, git (worktree per workstream), bash sed for bulk ADR reference corrections.

---

## Pre-Flight: Ground Truth Check

Before executing any task, verify the ADR files on disk to confirm the authoritative numbering:

```bash
head -3 docs/architecture/adr/ADR-0090-signalr-per-project-groups.md
head -3 docs/architecture/adr/ADR-0091-phase-7-final-verification.md
```

Expected:
- ADR-0090 = "ADR-0063: SignalR Per-Project Groups for Provisioning Progress" (note: title says ADR-0063, file is 0090)
- ADR-0091 = "ADR-0091: Phase 7 Final Verification & Sign-Off"

This confirms: ADR-0091 is the Phase 7 gate ADR. All "Phase 7 Final Verification" gate references in MVP plans that currently say ADR-0090 are wrong.

---

## Divergence Status Summary

| Divergence | Type | This Plan | Requires Human? |
|---|---|---|---|
| D-004 | ADR reference errata | Fix: update 49 occurrences in 20+ files | No — mechanical fix |
| D-005 | Wave 0 plan approval status | Prep: update documentation for approval; apply approval | Yes — PO + arch lead must sign |
| D-006 | PH7-RM-* plans classification | Decide + execute: assign to Phase N or archive | Recommend Phase 2; present to lead for final say |
| D-008 | Feature-Phase-Mapping-Recommendation.md | **Already resolved** — banner exists; close in P0-A2 | No |
| D-010 | Scaffold dependencies (strategic-intelligence) | Decision point: upgrade or defer | Yes — product scope decision |

---

## Chunk 1: D-004 — Fix ADR Gate Reference Errata

### Background

The `wave-0-validation-report.md` (v1.1, 2026-03-14) incorrectly "corrected" all Phase 7 gate references from ADR-0091 → ADR-0090. This propagated wrong ADR numbers across 20+ Wave 0 plan files. The correction was based on flawed reasoning: the validation report saw that ADR-0091 existed as "something else" and concluded ADR-0090 must be the Phase 7 sign-off, but ADR-0091 IS the Phase 7 Final Verification ADR.

**Fix strategy:** Two-pass approach.
1. Change all "ADR-0090 (Phase 7 Final Verification" and "ADR-0090 must exist / exist on disk / is on disk" patterns to ADR-0091.
2. Preserve all legitimate ADR-0090 references (SignalR per-project-groups feature decision).
3. Add errata note to wave-0-validation-report.md without altering its historical content.

**Files to modify:**
- `docs/architecture/plans/MVP/wave-0-validation-report.md` — add errata note at top
- `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` — 10 occurrences
- `docs/architecture/plans/MVP/W0-Completion-Plan.md` — 2 occurrences
- `docs/architecture/plans/MVP/G1/W0-G1-Contracts-and-Configuration-Plan.md` — 1 occurrence
- `docs/architecture/plans/MVP/G2/W0-G2-Backend-Hardening-and-Workflow-Data-Foundations-Plan.md` — 2 occurrences
- `docs/architecture/plans/MVP/G2/W0-G2-T09-Testing-Validation-and-Provisioning-Verification.md` — verify count
- `docs/architecture/plans/MVP/G3/W0-G3-Shared-Platform-Wiring-and-Workflow-Experience-Plan.md` — verify count
- `docs/architecture/plans/MVP/G3/W0-G3-T08-Testing-and-Verification-for-Shared-Platform-Wiring.md` — verify count
- `docs/architecture/plans/MVP/G4/W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md` — verify count
- `docs/architecture/plans/MVP/G4/W0-G4-T01.md` through `W0-G4-T08.md` — verify each
- `docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-Plan.md` — verify count
- `docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T01-Scaffold-and-Documentation*.md` — verify count
- `docs/architecture/plans/MVP/project-setup/MVP-Plan-Review-2026-03-13.md` — verify count

**Files NOT to touch (correct ADR-0090 SignalR references):**
- `docs/architecture/adr/ADR-0090-signalr-per-project-groups.md` — is the SignalR ADR itself
- Any reference that says "ADR-0090 — SignalR Per-Project Groups" — correct
- "ADR-0083 through ADR-0090 are permanently binding" in `MVP-Plan-Review-2026-03-13.md` — correct (ADR-0090 SignalR is permanently binding; consider extending range to ADR-0091 but it's not wrong)

---

### Task 1: Create worktree for D-004 work

**Files:** worktree at `.worktrees/p0-d004-adr-fix`

- [ ] **Step 1: Create worktree**

```bash
git worktree add .worktrees/p0-d004-adr-fix -b fix/p0-d004-adr-gate-references
```

Expected: worktree created at `.worktrees/p0-d004-adr-fix`

- [ ] **Step 2: Verify ADR ground truth**

```bash
cd .worktrees/p0-d004-adr-fix
head -5 docs/architecture/adr/ADR-0090-signalr-per-project-groups.md
head -5 docs/architecture/adr/ADR-0091-phase-7-final-verification.md
```

Expected: ADR-0090 = SignalR; ADR-0091 = Phase 7 Final Verification & Sign-Off

- [ ] **Step 3: Count occurrences before fixing**

```bash
grep -rn "ADR-0090" docs/architecture/plans/MVP/ --include="*.md" | wc -l
```

Record the count (expected: ~49). This is the baseline.

- [ ] **Step 4: Commit worktree creation**

```bash
git commit --allow-empty -m "fix(p0-d004): begin ADR gate reference correction — D-004"
```

---

### Task 2: Add errata note to wave-0-validation-report.md

**Files:**
- Modify: `docs/architecture/plans/MVP/wave-0-validation-report.md`

The validation report is a historical record — do not edit its body. Add an errata banner at the very top ABOVE the first heading.

- [ ] **Step 1: Read the first 10 lines of wave-0-validation-report.md to confirm it has no existing errata banner**

```bash
head -10 docs/architecture/plans/MVP/wave-0-validation-report.md
```

- [ ] **Step 2: Add errata banner using a temp file approach**

```bash
cd .worktrees/p0-d004-adr-fix

# Prepend errata note to wave-0-validation-report.md
cat > /tmp/errata.md << 'EOF'
> **ERRATA (2026-03-16):** Finding C1 in this report ("Phase 7 gate ADR number corrected (ADR-0090, not ADR-0091)") was incorrect. ADR-0090 is `ADR-0090-signalr-per-project-groups.md` (the SignalR per-project-groups decision, accepted 2026-03-07). The Phase 7 Final Verification & Sign-Off ADR is **ADR-0091** (`ADR-0091-phase-7-final-verification.md`, accepted 2026-03-09). All references to "ADR-0090 (Phase 7 Final Verification & Sign-Off)" in Wave 0 plan files have been corrected to ADR-0091. See P0-A2 Divergence Log D-004.

EOF

# Prepend to file
cat /tmp/errata.md docs/architecture/plans/MVP/wave-0-validation-report.md > /tmp/wave-0-combined.md
mv /tmp/wave-0-combined.md docs/architecture/plans/MVP/wave-0-validation-report.md
```

- [ ] **Step 3: Verify the errata appears at the top**

```bash
head -5 docs/architecture/plans/MVP/wave-0-validation-report.md
```

Expected: the ERRATA blockquote appears first.

- [ ] **Step 4: Commit errata note**

```bash
git add docs/architecture/plans/MVP/wave-0-validation-report.md
git commit -m "fix(p0-d004): add errata note to wave-0-validation-report for incorrect ADR-0090 finding"
```

---

### Task 3: Fix ADR gate references — HB-Intel-Wave-0-Buildout-Plan.md

This file has 10 occurrences of ADR-0090 as a Phase 7 gate reference, plus 1 legitimate SignalR reference ("ADR-0090 — SignalR Per-Project Groups:") that must be preserved.

**Files:**
- Modify: `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md`

- [ ] **Step 1: Identify all ADR-0090 occurrences**

```bash
grep -n "ADR-0090" docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md
```

Review each line. Lines containing "SignalR Per-Project Groups" → preserve. All others (Phase 7 gate conditions) → fix.

- [ ] **Step 2: Apply targeted replacement (Phase 7 gate patterns only)**

The safe patterns that only match gate condition references:

```bash
cd .worktrees/p0-d004-adr-fix

# Fix "ADR-0090 (Phase 7 Final Verification & Sign-Off)" descriptions
sed -i 's/ADR-0090 (Phase 7 Final Verification & Sign-Off)/ADR-0091 (Phase 7 Final Verification \& Sign-Off)/g' \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md

# Fix "ADR-0090 must be created" gate conditions
sed -i 's/ADR-0090 must be created/ADR-0091 must be created/g' \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md

# Fix "ADR-0090 must exist on disk" gate conditions
sed -i 's/ADR-0090 must exist on disk/ADR-0091 must exist on disk/g' \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md

# Fix "ADR-0090 exists on disk" gate conditions
sed -i 's/ADR-0090 exists on disk/ADR-0091 exists on disk/g' \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md

# Fix "ADR-0090 is on disk" gate conditions
sed -i 's/ADR-0090 is on disk/ADR-0091 is on disk/g' \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md

# Fix "ADR-0090/ADR-0091 exist on disk" (combined reference)
sed -i 's/ADR-0090\/ADR-0091 exist on disk/ADR-0091 exist on disk/g' \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md

# Fix "confirm ADR-0090 is on disk" or "confirmed on disk" variants
sed -i 's/ADR-0090 (Phase 7 Final Verification)/ADR-0091 (Phase 7 Final Verification)/g' \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md
```

- [ ] **Step 3: Also update the v1.1 validation note in the header to document the error**

The header line says "(1) Phase 7 gate ADR number corrected (ADR-0090, not ADR-0091)". This note itself is wrong and should be updated to document the error was corrected.

```bash
sed -i 's/(1) Phase 7 gate ADR number corrected (ADR-0090, not ADR-0091)/(1) Phase 7 gate ADR number: v1.1 incorrectly set to ADR-0090; corrected to ADR-0091 per P0-A2 D-004 errata (2026-03-16)/g' \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md
```

- [ ] **Step 4: Verify no unintended changes — the SignalR reference must remain**

```bash
grep -n "ADR-0090" docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md
```

Expected: Only SignalR reference remains (line containing "SignalR Per-Project Groups"). All gate condition references now show ADR-0091.

- [ ] **Step 5: Verify ADR-0091 gate references exist**

```bash
grep -c "ADR-0091" docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md
```

Expected: count > 0 (several gate references now correctly say ADR-0091).

- [ ] **Step 6: Commit**

```bash
git add docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md
git commit -m "fix(p0-d004): correct Phase 7 gate ADR references in Wave-0-Buildout-Plan (0090→0091)"
```

---

### Task 4: Fix ADR gate references — G1 through G4 group plans

**Files:**
- Modify: `docs/architecture/plans/MVP/G1/W0-G1-Contracts-and-Configuration-Plan.md`
- Modify: `docs/architecture/plans/MVP/G2/W0-G2-Backend-Hardening-and-Workflow-Data-Foundations-Plan.md`
- Modify: `docs/architecture/plans/MVP/G2/W0-G2-T09-Testing-Validation-and-Provisioning-Verification.md`
- Modify: `docs/architecture/plans/MVP/G3/W0-G3-Shared-Platform-Wiring-and-Workflow-Experience-Plan.md`
- Modify: `docs/architecture/plans/MVP/G3/W0-G3-T08-Testing-and-Verification-for-Shared-Platform-Wiring.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-SPFx-Surfaces-and-Workflow-Experience-Plan.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-T01-Estimating-Requester-Guided-Setup-Surface.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-T02-Estimating-Coordinator-Visibility-and-Limited-Retry.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-T03-Accounting-Controller-Queue-and-Structured-Review-Surface.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-T04-Admin-Oversight-Escalation-and-Recovery-Surface-Boundaries.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-T05-Completion-Confirmation-and-Optional-Project-Hub-Handoff.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-T06-Role-Context-Visibility-and-Complexity-Rules.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-T07-Responsive-Behavior-Navigation-Composition-and-Failure-Modes.md`
- Modify: `docs/architecture/plans/MVP/G4/W0-G4-T08-Testing-and-Verification-for-SPFx-Surfaces.md`

- [ ] **Step 1: Apply bulk fix to G1, G2, G3 plans (no SignalR references in these)**

```bash
cd .worktrees/p0-d004-adr-fix

for f in \
  "docs/architecture/plans/MVP/G1/W0-G1-Contracts-and-Configuration-Plan.md" \
  "docs/architecture/plans/MVP/G2/W0-G2-Backend-Hardening-and-Workflow-Data-Foundations-Plan.md" \
  "docs/architecture/plans/MVP/G2/W0-G2-T09-Testing-Validation-and-Provisioning-Verification.md" \
  "docs/architecture/plans/MVP/G3/W0-G3-Shared-Platform-Wiring-and-Workflow-Experience-Plan.md" \
  "docs/architecture/plans/MVP/G3/W0-G3-T08-Testing-and-Verification-for-Shared-Platform-Wiring.md"; do
  sed -i \
    -e 's/ADR-0090 (Phase 7 Final Verification \& Sign-Off)/ADR-0091 (Phase 7 Final Verification \& Sign-Off)/g' \
    -e 's/ADR-0090 (Phase 7 Final Verification)/ADR-0091 (Phase 7 Final Verification)/g' \
    -e 's/ADR-0090 must be created/ADR-0091 must be created/g' \
    -e 's/ADR-0090 must exist on disk/ADR-0091 must exist on disk/g' \
    -e 's/ADR-0090 exists on disk/ADR-0091 exists on disk/g' \
    -e 's/ADR-0090 is on disk/ADR-0091 is on disk/g' \
    "$f"
done
```

- [ ] **Step 2: Apply bulk fix to G4 task plans**

```bash
for f in docs/architecture/plans/MVP/G4/W0-G4-*.md; do
  sed -i \
    -e 's/ADR-0090 (Phase 7 Final Verification \& Sign-Off)/ADR-0091 (Phase 7 Final Verification \& Sign-Off)/g' \
    -e 's/ADR-0090 (Phase 7 Final Verification)/ADR-0091 (Phase 7 Final Verification)/g' \
    -e 's/ADR-0090 must be created/ADR-0091 must be created/g' \
    -e 's/ADR-0090 must exist on disk/ADR-0091 must exist on disk/g' \
    -e 's/ADR-0090 exists on disk/ADR-0091 exists on disk/g' \
    -e 's/ADR-0090 is on disk/ADR-0091 is on disk/g' \
    "$f"
done
```

- [ ] **Step 3: Verify no ADR-0090 remains in G1–G4 plan files (should be zero)**

```bash
grep -rn "ADR-0090" \
  docs/architecture/plans/MVP/G1/ \
  docs/architecture/plans/MVP/G2/ \
  docs/architecture/plans/MVP/G3/ \
  docs/architecture/plans/MVP/G4/ \
  --include="*.md"
```

Expected: zero lines. If any remain, inspect manually and fix.

- [ ] **Step 4: Commit G1–G4 fixes**

```bash
git add docs/architecture/plans/MVP/G1/ docs/architecture/plans/MVP/G2/ \
        docs/architecture/plans/MVP/G3/ docs/architecture/plans/MVP/G4/
git commit -m "fix(p0-d004): correct Phase 7 gate ADR references in G1–G4 group plans (0090→0091)"
```

---

### Task 5: Fix ADR gate references — W0-Completion-Plan and project-setup files

**Files:**
- Modify: `docs/architecture/plans/MVP/W0-Completion-Plan.md`
- Modify: `docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-Plan.md`
- Modify: `docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T01-Scaffold-and-Documentation*.md` (filename has special char — use glob)
- Modify: `docs/architecture/plans/MVP/project-setup/MVP-Plan-Review-2026-03-13.md`

Note: `MVP-Plan-Review-2026-03-13.md` contains "ADR-0083 through ADR-0090 are permanently binding" — this is a **correct** reference to ADR-0090 as a permanently binding SignalR ADR. Do NOT change this. Also contains "ADR-0090 must exist on disk" gate references — DO change those.

- [ ] **Step 1: Apply fix to W0-Completion-Plan.md**

```bash
cd .worktrees/p0-d004-adr-fix
sed -i \
  -e 's/ADR-0090 (Phase 7 Final Verification \& Sign-Off)/ADR-0091 (Phase 7 Final Verification \& Sign-Off)/g' \
  -e 's/ADR-0090 must exist on disk/ADR-0091 must exist on disk/g' \
  -e 's/ADR-0090 is on disk/ADR-0091 is on disk/g' \
  docs/architecture/plans/MVP/W0-Completion-Plan.md
```

- [ ] **Step 2: Apply fix to project-setup plan files (careful with MVP-Plan-Review)**

```bash
# project-setup/MVP-Project-Setup-Plan.md and T01 file
for f in \
  "docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-Plan.md" \
  docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T01*; do
  sed -i \
    -e 's/ADR-0090 (Phase 7 Final Verification \& Sign-Off)/ADR-0091 (Phase 7 Final Verification \& Sign-Off)/g' \
    -e 's/ADR-0090 must exist on disk/ADR-0091 must exist on disk/g' \
    -e 's/ADR-0090 exists on disk/ADR-0091 exists on disk/g' \
    "$f"
done
```

- [ ] **Step 3: Fix MVP-Plan-Review (targeted — preserve range reference)**

```bash
# The plan-review has: "ADR-0083 through ADR-0090 are permanently binding" — KEEP
# It also has: "ADR-0090 gate" and "ADR-0090 must exist" gate refs — change those

sed -i \
  -e 's/ADR-0090 (Phase 7 Final Verification \& Sign-Off)/ADR-0091 (Phase 7 Final Verification \& Sign-Off)/g' \
  -e 's/ADR-0090 must exist on disk/ADR-0091 must exist on disk/g' \
  -e 's/| ADR-0090 gate |/| ADR-0091 gate |/g' \
  -e '/ADR-0083 through/! s/ADR-0090 gate/ADR-0091 gate/g' \
  docs/architecture/plans/MVP/project-setup/MVP-Plan-Review-2026-03-13.md

# After running, manually verify the range line is unchanged:
grep "ADR-0083 through" docs/architecture/plans/MVP/project-setup/MVP-Plan-Review-2026-03-13.md
```

Expected: "ADR-0083 through ADR-0090 are permanently binding" still intact.

- [ ] **Step 4: Verify zero remaining incorrect gate references across all MVP plans**

```bash
# Show all remaining ADR-0090 references — review each manually
grep -rn "ADR-0090" docs/architecture/plans/MVP/ --include="*.md"
```

Expected remaining legitimate references:
- wave-0-validation-report.md: the original finding text (now preceded by errata) + header
- HB-Intel-Wave-0-Buildout-Plan.md: "ADR-0090 — SignalR Per-Project Groups:" reference
- MVP-Plan-Review: "ADR-0083 through ADR-0090 are permanently binding"

No remaining "ADR-0090 must exist / exists on disk / (Phase 7 Final Verification)" should appear.

- [ ] **Step 5: Final count verification**

```bash
# Count before (recorded in Task 1 Step 3) should now be much lower
grep -rn "ADR-0090" docs/architecture/plans/MVP/ --include="*.md" | wc -l
```

Expected: 5–10 remaining legitimate references (down from ~49).

- [ ] **Step 6: Commit**

```bash
git add docs/architecture/plans/MVP/W0-Completion-Plan.md \
        docs/architecture/plans/MVP/project-setup/
git commit -m "fix(p0-d004): correct Phase 7 gate ADR references in W0-Completion and project-setup (0090→0091)"
```

---

### Task 6: Update P0-A2 D-004 to Resolved

**Files:**
- Modify: `docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md`

- [ ] **Step 1: Update D-004 resolution field in P0-A2**

Read the D-004 section. Update the Resolution field to add a resolved note:

```
**Resolution:** ✅ RESOLVED (2026-03-16). The gate condition is satisfied (ADR-0091 exists on disk, Phase 7 signed off 2026-03-09). All Phase 7 gate references in Wave 0 MVP plan files (Wave-0-Buildout-Plan.md, G1–G4 group plans, W0-Completion-Plan.md, project-setup plans) corrected from ADR-0090 to ADR-0091. Errata note added to wave-0-validation-report.md. See fix/p0-d004-adr-gate-references branch.
```

- [ ] **Step 2: Commit**

```bash
git add docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md
git commit -m "fix(p0-d004): mark D-004 as resolved in P0-A2 Divergence Log"
```

---

## Chunk 2: D-008 — Close Already-Resolved Divergence

### Background

D-008 states: "HB-Intel-Feature-Phase-Mapping-Recommendation.md is superseded." The file already has a classification banner:

```
> **Doc Classification:** Superseded / Archived Reference — pre-Phase-6 feature placement recommendation...
> **Status after consolidation:** SUPERSEDED (2026-03-14)
```

D-008 is **already resolved** — the classification exists on disk. P0-A2 just needs to reflect this.

---

### Task 7: Close D-008 in P0-A2

**Files:**
- Modify: `docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md`

- [ ] **Step 1: Verify the classification banner exists in the file**

```bash
head -8 docs/architecture/plans/HB-Intel-Feature-Phase-Mapping-Recommendation.md
```

Expected: "Doc Classification: Superseded / Archived Reference" banner at top.

- [ ] **Step 2: Update D-008 resolution in P0-A2**

Update the D-008 Resolution field to:

```
**Resolution:** ✅ RESOLVED (pre-2026-03-16). Classification banner already applied: "Superseded / Archived Reference — pre-Phase-6 feature placement recommendation." Status: SUPERSEDED (2026-03-14). No further action required.
```

Also update the §5 Summary Counts table: "(c) Superseded / stale — correction action required" count from 3 → 2 (D-008 closed) and add a "Pre-Phase-0 / Pre-existing resolution" row or adjust the notes column.

- [ ] **Step 3: Commit**

```bash
git add docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md
git commit -m "docs(p0-a2): close D-008 — Feature-Phase-Mapping already classified as Superseded"
```

---

## Chunk 3: D-006 — PH7-RM-* Plans Classification

### Background

Nine plans (`PH7-RM-1-Package-Foundation.md` through `PH7-RM-9-Testing-and-Documentation.md`) are classified as "Deferred Scope" — remediation scope items identified during Phase 7, not yet assigned to an execution phase. These plans describe a `@hbc/review-mode` feature package — a complete review and edit workflow mode for cross-domain use.

**Plan chain:**
1. `@hbc/review-mode` package foundation (contracts, context, providers)
2. Shell and layout
3. Navigation sidebar
4. Record card + edit drawer
5. Action items (FAB, tray, list, data layer)
6. Session summary
7. Estimating integration
8. Backend API
9. Testing and documentation

**Recommendation:** Assign to Phase 3 (Project Hub and Project Context Plan). Review mode is a cross-domain feature, but its primary initial use case is Project Hub review context. It depends on `@hbc/ui-kit`, `@hbc/auth`, `@hbc/models`, `@hbc/data-access` — all platform prerequisites that will be solid by Phase 3.

**Alternative:** Assign to Phase 2 (Personal Work Hub and PWA Shell Plan) if review mode is considered a core PWA shell feature. This is the more aggressive timeline.

**Decision required from:** Delivery/Program lead + Product owner (see OD-006 in P0-E2).

---

### Task 8: Research and document PH7-RM-* plan classification recommendation

**Files:**
- Read: All 9 PH7-RM-*.md files
- Modify: `docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md`
- Modify: `docs/architecture/plans/MASTER/phase-0-deliverables/P0-E2-Open-Decisions-Register.md`

- [ ] **Step 1: Read each PH7-RM-* file and record key metadata**

```bash
for f in docs/architecture/plans/PH7-RM-*.md; do
  echo "=== $f ==="
  head -20 "$f"
  echo
done
```

Record for each file: feature area, depends-on packages, estimate complexity.

- [ ] **Step 2: Identify which Phase N milestone is the right home**

Map each PH7-RM plan to the appropriate phase plan:
- `docs/architecture/plans/MASTER/03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md` — if review mode belongs in PWA shell
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md` — if review mode belongs in project context

Read the relevant Phase 2 and Phase 3 plan headers to check if review mode is mentioned:

```bash
grep -i "review.mode\|review mode\|PH7-RM" \
  docs/architecture/plans/MASTER/03_Phase-2_Personal-Work-Hub-and-PWA-Shell-Plan.md \
  docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md | head -20
```

- [ ] **Step 3: Update D-006 resolution in P0-A2 with recommendation**

After research, update D-006 Resolution field with the specific Phase N assignment recommendation:

```
**Resolution:** Decision pending (tracked in P0-E2 OD-006). Recommendation: Assign PH7-RM-1 through PH7-RM-9 (review-mode feature suite) to Phase [N] ([Phase Name]) milestone. Classification would change from "Deferred Scope" to "Canonical Normative Plan" upon Phase N scope confirmation. Pending product owner + delivery lead approval. See OD-006 in P0-E2.
```

- [ ] **Step 4: Add classification banners to PH7-RM-* files documenting the pending decision**

Each file currently says "Deferred Scope — confirm scheduling status before PH7.12 sign-off." PH7.12 is complete. Update the banner to reflect current status:

```bash
cd .worktrees/p0-d004-adr-fix  # or create a separate worktree

for f in docs/architecture/plans/PH7-RM-*.md; do
  # Replace the existing Deferred Scope banner with updated version
  sed -i 's/> \*\*Doc Classification:\*\* Deferred Scope — remediation scope item identified during Phase 7 but not yet assigned to an active execution phase; confirm scheduling status before PH7.12 sign-off./> **Doc Classification:** Deferred Scope — Phase 7 remediation scope item. PH7.12 sign-off complete (2026-03-09, ADR-0091). Pending Phase assignment decision (OD-006 in P0-E2 Open Decisions Register). Do not implement until assigned to a Phase milestone./g' "$f"
done
```

- [ ] **Step 5: Verify all 9 files have the updated banner**

```bash
grep -l "Deferred Scope" docs/architecture/plans/PH7-RM-*.md | wc -l
```

Expected: 9

- [ ] **Step 6: Commit**

```bash
git add docs/architecture/plans/PH7-RM-*.md \
        docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md
git commit -m "docs(p0-d006): update PH7-RM-* banners; record Phase assignment recommendation in P0-A2"
```

---

## Chunk 4: D-005 — Wave 0 Plan Approval Documentation

### Background

The Wave 0 Buildout Plan says "Status: Proposed — awaiting product owner and architecture owner review." The plan's implementation status (G4/G5 complete; G1/G2/G3 contracts defined) should be reflected in the document. The formal approval itself requires human sign-off (Product Owner + Architecture Lead).

This task prepares the document for approval — it does NOT claim the plan is approved. It:
1. Updates group-by-group implementation status to reflect current reality
2. Adds an approval checklist section that humans can use to sign off
3. Makes the document ready for formal review

**⚠️ Human gate:** After this task, the Product Owner and Architecture Lead must review the document and change the status to "Approved" with their names. This agent cannot perform that step.

---

### Task 9: Update Wave 0 Group plan implementation status

**Files:**
- Modify: `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md`

- [ ] **Step 1: Read the Wave 0 Buildout Plan milestone section to understand the current status format**

```bash
grep -n "W0-M\|Group [1-6]\|Status:\|Implementation" \
  docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md | head -40
```

- [ ] **Step 2: Read current-state-map.md to get accurate G1–G6 implementation status**

```bash
grep -A5 "Wave 0\|W0-G\|G4\|G5\|Group 4\|Group 5" \
  docs/architecture/blueprint/current-state-map.md | head -40
```

- [ ] **Step 3: Update the Wave 0 plan status header to reflect current state**

The header should say "Proposed — Ready for Formal Approval" and reflect that G4/G5 are implemented:

Edit the status block in `HB-Intel-Wave-0-Buildout-Plan.md`:
- Change: `**Status:** Proposed — awaiting product owner and architecture owner review`
- To: `**Status:** Proposed — Implementation Evidence Available; Ready for Formal Approval`
- Add below it: `**Implementation Status:** G4 surfaces (SPFx estimating, coordinator, accounting, admin oversight, completion) — IMPLEMENTED (Canonical Current-State per current-state-map.md v1.0). G5 hosted PWA surfaces — IMPLEMENTED (Canonical Current-State). G1/G2/G3 — contracts and platform wiring defined; backend provisioning hardening pending. G6 — not started.`

- [ ] **Step 4: Add formal approval section to the end of the document**

Add a new section at the end of the file:

```markdown
---

## Formal Approval Record

**Status:** Awaiting approval

This plan is ready for formal approval. To approve, update the status block at the top of this document and sign below.

| Role | Name | Date | Signature |
|---|---|---|---|
| Product Owner | | | |
| Architecture Owner | | | |

**Approval triggers:**
- Status block updated from "Proposed — Implementation Evidence Available" to "Approved"
- Individual group plans (G1–G6) have status updated to reflect current implementation state
- ADR-0090 gate references corrected to ADR-0091 (completed 2026-03-16 per P0-A2 D-004)
- P0-A2 D-005 marked as Resolved upon signature
```

- [ ] **Step 5: Commit**

```bash
git add docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md
git commit -m "docs(p0-d005): prepare Wave 0 Buildout Plan for formal approval — add implementation status and approval record"
```

---

### Task 10: Update D-005 in P0-A2 to reflect preparation complete

**Files:**
- Modify: `docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md`

- [ ] **Step 1: Update D-005 resolution field**

```
**Resolution:** PARTIAL — document preparation complete (2026-03-16). Wave 0 Buildout Plan updated with implementation evidence for G4/G5 and formal approval checklist. Awaiting Product Owner + Architecture Owner signature to move from "Proposed" to "Approved." Once signed, update this entry to ✅ RESOLVED with the approval date. **Blocker status:** This item remains a Phase 1 entry blocker until signed. See P0-E1 BLOCKER-02.
```

- [ ] **Step 2: Commit**

```bash
git add docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md
git commit -m "docs(p0-d005): record preparation status in P0-A2 — awaiting human approval sign-off"
```

---

## Chunk 5: D-010 — Scaffold Dependency Decision

### Background

**Current state per P0-B1:**
- `@hbc/versioned-record` — `usable-but-incomplete` (already upgraded in Phase 0 research)
- `@hbc/strategic-intelligence` — `scaffold-only` (contracts defined, no runtime adapters, no tests; uses `--passWithNoTests`)
- `@hbc/post-bid-autopsy` — `scaffold-only` (SF22 T08–T09 unimplemented)
- `@hbc/ai-assist` — `scaffold-only` (mandatory pre-implementation research directive pending)
- `@hbc/score-benchmark` — classify from P0-B1

D-010 requires: either upgrade `@hbc/strategic-intelligence` to `usable-but-incomplete` OR formally defer its dependents from Phase 1 scope.

**Decision point — present to Product Owner / Architecture Lead:**

**Option A: Upgrade @hbc/strategic-intelligence to usable-but-incomplete**
- Work required: Write API surface documentation (README), write at least basic unit tests (remove `--passWithNoTests`), confirm public exports are intentional and stable
- Time estimate: 2–4 hours engineering
- Unblocks: `@hbc/post-bid-autopsy` production path (pending T08–T09 implementation)
- Does NOT unblock ai-assist or score-benchmark (those have separate blockers)

**Option B: Formally defer @hbc/post-bid-autopsy T08–T09, @hbc/score-benchmark, @hbc/ai-assist from Phase 1 scope**
- Work required: Documentation only — add deferral notice to each package README and update P0-B1 notes
- Time estimate: 30 minutes
- Risk: Creates technical debt if these surfaces are expected in Phase 1
- Note: @hbc/ai-assist already has a mandatory pre-implementation research directive — deferral aligns with this

**Recommendation: Option B** — defer to Phase 2/3. The Mandatory Pre-Implementation Research Directive on `@hbc/ai-assist` already signals these aren't Phase 1 scope. Upgrading `@hbc/strategic-intelligence` without also implementing the runtime adapters and BD integration (which are the actual Phase 1 concern) provides limited value. Clean separation is better.

---

### Task 11: Execute D-010 — Document deferral decision (Option B)

> **⚠️ Gate:** Confirm with product owner which option to take before executing. If Option A is chosen, substitute Task 11A below.

**Files:**
- Modify: `packages/strategic-intelligence/README.md` (create if not exists)
- Modify: `packages/post-bid-autopsy/README.md` (create if not exists)
- Modify: `packages/ai-assist/README.md` (create if not exists)
- Modify: `packages/score-benchmark/README.md` (create if not exists)
- Modify: `docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md`
- Modify: `docs/architecture/plans/MASTER/phase-0-deliverables/P0-B1-Production-Readiness-Matrix.md` (update D-010 notes column)

- [ ] **Step 1: Add Phase 1 scope exclusion notice to each dependent package README**

For each of the four packages (`strategic-intelligence`, `post-bid-autopsy`, `ai-assist`, `score-benchmark`):

```bash
# Check if README exists first
for pkg in strategic-intelligence post-bid-autopsy ai-assist score-benchmark; do
  echo "=== packages/$pkg ==="
  ls packages/$pkg/README.md 2>/dev/null && echo "exists" || echo "MISSING"
done
```

- [ ] **Step 2: For packages without a README, create a minimal one with Phase exclusion notice**

For each missing README, create with this format:

```markdown
# @hbc/<package-name>

> **Phase Scope:** This package is deferred from Phase 1 scope per P0-A2 D-010 resolution (2026-03-16).
> Phase 1 target domains: [Phase N TBD by product owner via OD-013 in P0-E2].
> Do not build production adapters or user-facing surfaces that depend on this package until Phase N scope is confirmed.

[Rest of existing README content if any, or minimal description]
```

- [ ] **Step 3: For packages with a README, prepend the scope notice**

```bash
# Verify and prepend for each package that has a README
```

- [ ] **Step 4: Update D-010 resolution in P0-A2**

```
**Resolution:** ✅ RESOLVED (2026-03-16) — Option B (deferral). `@hbc/versioned-record` upgraded to usable-but-incomplete (resolved in Phase 0 research). `@hbc/strategic-intelligence` remains scaffold-only; dependent packages (`@hbc/post-bid-autopsy`, `@hbc/score-benchmark`, `@hbc/ai-assist`) formally deferred from Phase 1 scope — scope notice added to each package README. Phase N assignment tracked in P0-E2 OD-013. Production use of dependent packages remains blocked per G-04 until strategic-intelligence reaches usable-but-incomplete status in a future phase.
```

- [ ] **Step 5: Update P0-B1 notes column for D-010 related packages**

In the P0-B1 matrix, update the notes for strategic-intelligence and its dependents to include the deferral:

```
| ...strategic-intelligence... | ... | scaffold-only | ...Deferred from Phase 1 per D-010 resolution. Phase N TBD via OD-013. |
```

- [ ] **Step 6: Commit**

```bash
git add packages/strategic-intelligence/ packages/post-bid-autopsy/ \
        packages/ai-assist/ packages/score-benchmark/ \
        docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md \
        docs/architecture/plans/MASTER/phase-0-deliverables/P0-B1-Production-Readiness-Matrix.md
git commit -m "docs(p0-d010): formally defer scaffold-dependent Phase 1 packages; mark D-010 resolved"
```

---

### Task 11A (ALTERNATIVE — if Option A chosen): Upgrade @hbc/strategic-intelligence

> Use this task INSTEAD of Task 11 if Option A (upgrade) is approved.

**Files:**
- Modify: `packages/strategic-intelligence/README.md`
- Modify: `packages/strategic-intelligence/package.json` (version bump 0.0.1 → 0.0.2)
- Create/Modify: `packages/strategic-intelligence/src/**` (unit tests)

- [ ] **Step 1: Read existing strategic-intelligence source to understand current API surface**

```bash
cat packages/strategic-intelligence/src/index.ts
ls packages/strategic-intelligence/src/
ls packages/strategic-intelligence/src/api/ 2>/dev/null
ls packages/strategic-intelligence/src/types/ 2>/dev/null
```

- [ ] **Step 2: Write documentation for the existing public API**

In `packages/strategic-intelligence/README.md`, document:
- Purpose and use cases
- All public exports (from src/index.ts)
- Dependencies and peer dependencies
- Known limitations and Phase N completion targets

- [ ] **Step 3: Write at least 3 unit tests covering the core contract**

The current test config uses `--passWithNoTests`. Remove that flag and add meaningful tests:

```bash
# Remove --passWithNoTests from package.json test scripts
sed -i 's/ --passWithNoTests//g' packages/strategic-intelligence/package.json
```

Then write tests in `packages/strategic-intelligence/src/test/` covering the core contract types and any factory functions.

- [ ] **Step 4: Run tests to confirm they pass**

```bash
pnpm --filter @hbc/strategic-intelligence test
```

Expected: PASS

- [ ] **Step 5: Bump version to 0.0.2**

```bash
# Edit package.json version from 0.0.1 to 0.0.2
```

- [ ] **Step 6: Update P0-B1 maturity for strategic-intelligence**

Update the row in P0-B1 from `scaffold-only` to `usable-but-incomplete` with justification.

- [ ] **Step 7: Update D-010 in P0-A2 as resolved**

- [ ] **Step 8: Commit**

```bash
git add packages/strategic-intelligence/ \
        docs/architecture/plans/MASTER/phase-0-deliverables/
git commit -m "feat(strategic-intelligence): upgrade to usable-but-incomplete — tests, docs, v0.0.2"
```

---

## Chunk 6: Final Consolidation

### Task 12: Create merge commit with all D-004/D-005/D-006/D-008/D-010 changes

After all tasks in Chunks 1–5 are committed to the worktree branch:

- [ ] **Step 1: Verify P0-A2 final state**

```bash
grep -A5 "### D-004\|### D-005\|### D-006\|### D-008\|### D-010" \
  docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md | grep "Resolution:"
```

Expected statuses:
- D-004: ✅ RESOLVED
- D-005: PARTIAL — awaiting human sign-off
- D-006: Decision recommendation documented; pending delivery lead approval
- D-008: ✅ RESOLVED
- D-010: ✅ RESOLVED (Option B) — OR "RESOLVED (Option A)" if upgrade chosen

- [ ] **Step 2: Update P0-A2 §5 Summary Counts to reflect current resolution state**

Update the counts:
- (c) Superseded / stale requiring correction: from 3 → 1 (only D-005 still pending)
- Add a new row or update notes for "Resolved during Phase 0 execution"

- [ ] **Step 3: Update P0-E1 Phase 1 Entry Checklist if any BLOCKER status changed**

Check if BLOCKER-01 (D-004) or BLOCKER-03 (D-010) can be marked as satisfied:
- BLOCKER-01 — D-004 resolved: update P0-E1 BLOCKER-01 description to note the fix is applied
- BLOCKER-03 — D-010 resolved (Option B): note deferral decision in P0-E1 BLOCKER-03

```bash
grep -n "BLOCKER-01\|BLOCKER-03" \
  docs/architecture/plans/MASTER/phase-0-deliverables/P0-E1-Phase1-Entry-Checklist.md
```

- [ ] **Step 4: Run verification — confirm no broken ADR references remain**

```bash
# Final sweep: ADR-0090 as Phase 7 gate should be zero
grep -rn "ADR-0090" docs/architecture/plans/MVP/ --include="*.md" | \
  grep -v "SignalR\|per-project\|0083 through\|ADR-0090-signalr\|ERRATA\|wave-0-validation-report"
```

Expected: 0 lines (or only the validation report's original body text behind the errata banner).

- [ ] **Step 5: Squash-merge or merge worktree to main**

```bash
cd /path/to/repo  # main worktree
git merge fix/p0-d004-adr-gate-references --no-ff \
  -m "docs(phase-0): resolve P0-A2 divergence blockers D-004, D-005 prep, D-006 rec, D-008 close, D-010"
```

- [ ] **Step 6: Clean up worktree**

```bash
git worktree remove .worktrees/p0-d004-adr-fix
git branch -d fix/p0-d004-adr-gate-references
```

---

## Human Actions Required (not agent-executable)

After all agent tasks complete, the following require human action:

| Action | Owner | Tracker |
|---|---|---|
| Sign off Wave 0 Buildout Plan (change status to "Approved") | Product Owner + Architecture Owner | P0-A2 D-005, P0-E1 BLOCKER-02 |
| Decide PH7-RM-* Phase assignment (Phase 2 or Phase 3) | Delivery/Program Lead | P0-E2 OD-006 |
| Confirm D-010 option (upgrade strategic-intelligence OR defer dependents) | Product Owner | P0-E2 OD-013, P0-A2 D-010 |
| After D-010 decision: either execute Task 11 (deferral docs) or Task 11A (upgrade) | Agent (after decision) | P0-A2 D-010 |

---

## File Map Summary

| File | Operation | Task |
|---|---|---|
| `docs/architecture/plans/MVP/wave-0-validation-report.md` | Prepend errata note | Task 2 |
| `docs/architecture/plans/MVP/HB-Intel-Wave-0-Buildout-Plan.md` | Fix 10 ADR refs; prep approval section | Tasks 3, 9 |
| `docs/architecture/plans/MVP/W0-Completion-Plan.md` | Fix 2 ADR refs | Task 5 |
| `docs/architecture/plans/MVP/G1/W0-G1-Contracts-and-Configuration-Plan.md` | Fix 1 ADR ref | Task 4 |
| `docs/architecture/plans/MVP/G2/W0-G2-Backend-Hardening-and-Workflow-Data-Foundations-Plan.md` | Fix 2 ADR refs | Task 4 |
| `docs/architecture/plans/MVP/G2/W0-G2-T09-*.md` | Fix ADR refs | Task 4 |
| `docs/architecture/plans/MVP/G3/W0-G3-Shared-Platform-Wiring-*.md` | Fix ADR refs | Task 4 |
| `docs/architecture/plans/MVP/G3/W0-G3-T08-*.md` | Fix ADR refs | Task 4 |
| `docs/architecture/plans/MVP/G4/W0-G4-SPFx-Surfaces-*.md` + T01–T08 | Fix ADR refs | Task 4 |
| `docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-Plan.md` | Fix ADR refs | Task 5 |
| `docs/architecture/plans/MVP/project-setup/MVP-Project-Setup-T01-*.md` | Fix ADR refs | Task 5 |
| `docs/architecture/plans/MVP/project-setup/MVP-Plan-Review-2026-03-13.md` | Fix gate refs, preserve range ref | Task 5 |
| `docs/architecture/plans/PH7-RM-1.md` through `PH7-RM-9.md` | Update deferred scope banner | Task 8 |
| `packages/strategic-intelligence/README.md` | Phase deferral notice | Task 11 |
| `packages/post-bid-autopsy/README.md` | Phase deferral notice | Task 11 |
| `packages/ai-assist/README.md` | Phase deferral notice | Task 11 |
| `packages/score-benchmark/README.md` | Phase deferral notice | Task 11 |
| `docs/architecture/plans/MASTER/phase-0-deliverables/P0-A2-Divergence-Log.md` | Update D-004/D-005/D-006/D-008/D-010 resolutions | Tasks 6, 7, 8, 10, 11 |
| `docs/architecture/plans/MASTER/phase-0-deliverables/P0-B1-Production-Readiness-Matrix.md` | Update D-010 package notes | Task 11 |
| `docs/architecture/plans/MASTER/phase-0-deliverables/P0-E1-Phase1-Entry-Checklist.md` | Update BLOCKER-01/03 status | Task 12 |

---

*Plan saved: 2026-03-16 | Governing document: P0-A2 Divergence Log*
*Next step: Execute via superpowers:subagent-driven-development*
