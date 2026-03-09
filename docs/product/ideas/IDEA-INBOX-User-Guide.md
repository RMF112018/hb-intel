# IDEA-INBOX User Guide / How-To

**Version:** 1.0  
**Purpose:** This guide explains how contributors should capture, maintain, and promote future feature ideas using `IDEA-INBOX.md`. The goal is to preserve valuable ideas without polluting phase plans, ADRs, or implementation docs with immature concepts.

---

## 1. What IDEA-INBOX Is

`IDEA-INBOX.md` is the **fast-capture staging area** for future thoughts, enhancements, feature concepts, UX improvements, workflow opportunities, and technical ideas that are not yet ready to become:

- a GitHub Issue
- a phase plan item
- an ADR
- a committed implementation task

It is intentionally lightweight.

Use it when you think:

- “That would be a great addition later.”
- “This workflow could be much better.”
- “This might be a shared feature.”
- “We should revisit this after the current phase.”
- “This is not in scope now, but I do not want to lose it.”

---

## 2. What IDEA-INBOX Is Not

`IDEA-INBOX.md` is **not**:

- a phase plan
- a delivery backlog
- an ADR candidate log
- a place to write detailed implementation specs
- a substitute for GitHub Issues once an idea is mature

Raw ideas belong here first.  
Planned work belongs elsewhere.

---

## 3. Canonical Location

Unless the repo architecture later changes, the canonical file should be:

```text
/docs/product/ideas/IDEA-INBOX.md
```

Recommended supporting docs:

```text
/docs/product/ideas/README.md
/docs/product/ideas/candidates/
/docs/product/roadmap/
```

---

## 4. When to Add an Idea

Add an entry when:

- the idea is useful but not part of the current phase
- you want to preserve a future thought before it is forgotten
- the idea may affect UX, architecture, workflow continuity, or a shared feature
- the idea is worth revisiting later, even if still vague

Do **not** wait until the idea is fully formed.  
The inbox exists so capture is easy.

---

## 5. The Required Structured Block

Every new idea entry should use the following structured block.

```markdown
## IDEA-YYYY-MM-DD-###
title:
status: inbox
promote: false
issue:
labels:
area:
roles:
primitive:
phase-candidate:
summary:
```

### Field definitions

- **IDEA-YYYY-MM-DD-###**  
  Unique idea ID.  
  Example: `IDEA-2026-03-09-001`

- **title**  
  Short, specific name of the idea.

- **status**  
  One of:
  - `inbox`
  - `candidate`
  - `shaping`
  - `planned`
  - `deferred`
  - `rejected`
  - `implemented`

- **promote**  
  `true` or `false`  
  Set to `true` only when the idea is ready to be promoted to a GitHub Issue.

- **issue**  
  Leave blank until an issue exists.  
  After promotion, record the issue number or link.

- **labels**  
  Comma-separated labels for future sorting and GitHub issue creation.

- **area**  
  The feature/workflow area most affected.

- **roles**  
  Primary user roles impacted.

- **primitive**  
  If the idea likely belongs in a Tier-1 primitive or shared-feature package, note it here.  
  Example values:
  - `@hbc/complexity`
  - `@hbc/bic-next-move`
  - `@hbc/sharepoint-docs`
  - `none`
  - `unknown`

- **phase-candidate**  
  Optional future phase or workstream note.  
  Example:
  - `PH8`
  - `future-shared-features`
  - `unknown`

- **summary**  
  1–4 sentences describing the idea and why it matters.

---

## 6. Copy/Paste Template

Use this exact template for new entries:

```markdown
## IDEA-YYYY-MM-DD-###
title:
status: inbox
promote: false
issue:
labels:
area:
roles:
primitive:
phase-candidate:
summary:
```

---

## 7. Example Entries

### Example 1 — UX idea

```markdown
## IDEA-2026-03-09-001
title: Adaptive handoff summary by role
status: inbox
promote: false
issue:
labels: idea, ux, handoff, shared-feature
area: workflow-handoff
roles: PM, PX, Field
primitive: @hbc/complexity
phase-candidate: future-shared-features
summary: When a handoff is completed, generate different summary views for PM, PX, and field users so each sees the most relevant next actions. This could improve clarity and reduce information overload immediately after handoff events.
```

### Example 2 — shared-feature idea

```markdown
## IDEA-2026-03-09-002
title: Cross-module blocked-item digest
status: candidate
promote: true
issue:
labels: idea, shared-feature, notifications, bic
area: cross-module accountability
roles: PM, PX, Admin
primitive: @hbc/bic-next-move
phase-candidate: PH8
summary: Create a digest that summarizes blocked items across modules where the next move is stalled. This would surface ownership bottlenecks without forcing users to inspect each module independently.
```

### Example 3 — technical/platform idea

```markdown
## IDEA-2026-03-09-003
title: Environment readiness dashboard
status: inbox
promote: false
issue:
labels: idea, platform, release, ops
area: release governance
roles: Admin, Platform
primitive: none
phase-candidate: unknown
summary: Add a small dashboard showing Code-Ready, Environment-Ready, and Operations-Ready status by feature or package. This could reinforce the release-readiness taxonomy operationally.
```

---

## 8. Recommended Labels

Use concise, reusable labels. Suggested labels:

- `idea`
- `future-feature`
- `ux`
- `platform`
- `shared-feature`
- `architecture-impact`
- `phase-candidate`
- `deferred`
- `field`
- `pwa`
- `spfx`
- `ops`
- `notifications`
- `workflow`
- `docs`

Add domain-specific labels where helpful, but keep the vocabulary controlled.

---

## 9. Recommended Status Usage

Use these statuses consistently:

### `inbox`
Raw idea, captured quickly, not yet evaluated.

### `candidate`
Still interesting after a first review.

### `shaping`
Being clarified, compared, or discussed.

### `planned`
Approved for a future phase, roadmap, or issue-backed workstream.

### `deferred`
Valuable, but intentionally not being worked now.

### `rejected`
Not pursuing.

### `implemented`
Built and complete.

---

## 10. Promotion to GitHub Issues

An inbox entry should usually stay in `IDEA-INBOX.md` until it becomes mature enough to discuss or prioritize.

### Promote an idea when:

- it still seems valuable after a review
- it solves a repeated pain point
- it affects multiple modules or roles
- it may influence architecture or a Tier-1 primitive
- it may become real work in the next 1–3 phases

### Promotion workflow

1. Update the entry:
   - set `promote: true`
   - update `status:` to `candidate` or `shaping`
2. Ensure `title`, `labels`, and `summary` are clean
3. Run the repo’s promotion workflow, if one exists
4. After issue creation:
   - record the issue number in `issue:`
   - set `promote: false`

### Example after promotion

```markdown
## IDEA-2026-03-09-002
title: Cross-module blocked-item digest
status: shaping
promote: false
issue: #123
labels: idea, shared-feature, notifications, bic
area: cross-module accountability
roles: PM, PX, Admin
primitive: @hbc/bic-next-move
phase-candidate: PH8
summary: Create a digest that summarizes blocked items across modules where the next move is stalled. This would surface ownership bottlenecks without forcing users to inspect each module independently.
```

---

## 11. Idea Quality Guidelines

Good idea entries are:

- short
- specific enough to understand later
- tied to a workflow, role, or pain point
- tagged well enough to sort and promote later

Avoid entries that are:

- one-word fragments with no context
- full implementation specs
- duplicate copies of existing issues
- hidden inside unrelated plan docs

### Strong summary formula

Use this simple pattern:

**What is the idea?**  
**Who benefits?**  
**Why does it matter?**

---

## 12. Where Stronger Ideas Go Next

As ideas mature, move them into the right layer:

### Stay in `IDEA-INBOX.md`
When still rough, unprioritized, or speculative.

### Move to GitHub Issue
When worth discussion, prioritization, and future delivery tracking.

### Move to `docs/product/ideas/candidates/`
When the idea needs deeper shaping before becoming planned work.

### Move to a phase plan
Only after approved for real implementation scope.

### Move to an ADR
Only when a decision is actually being locked.

---

## 13. What Contributors Must Not Do

Do **not**:

- put raw ideas directly into ADRs
- clutter active phase plans with unapproved feature thoughts
- create GitHub issues for every passing thought
- use the GitHub wiki as the canonical idea repository
- store important future ideas only in personal notes or sticky notes

---

## 14. Suggested Review Rhythm

Recommended cadence:

- **Weekly** during active platform buildout
- **Biweekly** during slower implementation periods

During review:

- delete weak or obsolete ideas
- merge duplicates
- update statuses
- promote stronger ideas to issues
- mark likely future phase alignment
- identify ideas that belong to Tier-1 primitives

---

## 15. Contributor Checklist

Before saving an idea entry, confirm:

- [ ] I used the structured block
- [ ] The idea has a unique ID
- [ ] The title is specific
- [ ] The summary explains why it matters
- [ ] I tagged the area and roles
- [ ] I noted the likely primitive if known
- [ ] `promote` is only `true` if ready for issue creation

---

## 16. Recommended Supporting Automation

If the repo later supports automatic promotion from inbox entries to GitHub Issues, contributors should assume:

- only entries with `promote: true` are eligible
- entries must have a blank `issue:` field to be promoted
- the automation may write back the created issue number
- malformed entries may be skipped

This is one reason consistent formatting matters.

---

## 17. Ownership and Maintenance

Suggested ownership:

- **Contributors** add ideas as they work
- **Architecture/Product owner** reviews and triages periodically
- **Phase planners** pull stronger ideas into future plans only after review

---

## 18. Final Rule

`IDEA-INBOX.md` should be treated as a **capture-and-triage tool**, not a dumping ground and not a roadmap.

Its job is simple:

- preserve good ideas
- keep planning docs clean
- make future revisit easy
- create a clean bridge to GitHub Issues when ideas are ready

---

## Appendix A — Minimal Quick-Capture Version

If you are in the middle of deep work and need the fastest possible capture, use:

```markdown
## IDEA-YYYY-MM-DD-###
title:
status: inbox
promote: false
summary:
```

Then come back later and fill in the rest.

---

## Appendix B — Full Recommended Entry

```markdown
## IDEA-YYYY-MM-DD-###
title:
status: inbox
promote: false
issue:
labels:
area:
roles:
primitive:
phase-candidate:
summary:
```
