# Phase 1 Prompt-01 — Repo-Truth Workflow Contract Audit Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a comprehensive, evidence-backed audit memo at `docs/architecture/reviews/phase-1-workflow-contract-audit.md` that catalogs every discrepancy between live repo truth and existing documentation for the Accounting-side Project Setup workflow contract.

**Architecture:** This is a pure documentation-audit task — no code changes. The work reads ~24 source files across four domains (Accounting UI, shared provisioning package, backend lifecycle/auth, and current/stale docs), answers 14 required questions, builds a structured discrepancy inventory, and writes a single audit memo. The memo becomes the decision basis for all subsequent Phase 1 prompts (02–06).

**Tech Stack:** Markdown output only. No runtime code changes. Verification limited to doc quality and formatting.

---

## Chunk 1: Source File Reading and Evidence Collection

### Task 1: Read and catalog Accounting surface facts

Read the Accounting UI source files and extract current implementation facts about controller actions, queue structure, detail-page affordances, and state handling.

**Files:**
- Read: `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- Read: `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- Read: `apps/accounting/src/test/ProjectReviewQueuePage.test.tsx`
- Read: `apps/accounting/src/test/ProjectReviewDetailPage.test.tsx`

- [ ] **Step 1: Read ProjectReviewQueuePage.tsx**

Extract and record:
- Queue tab filters (which request states map to which tabs)
- Column definitions and data shape
- Any action handlers available from the queue level
- State filtering logic

- [ ] **Step 2: Read ProjectReviewDetailPage.tsx**

Extract and record:
- All user-facing actions (approve, clarify, hold, route-to-admin, etc.)
- The exact approve action implementation — specifically the `projectNumber` capture, validation pattern (`##-###-##`), and the `advanceState` call shape
- Which states expose which actions (action visibility by request state)
- Whether any forward action exists from `AwaitingExternalSetup`
- Any conditional rendering based on request state or provisioning status

- [ ] **Step 3: Read ProjectReviewQueuePage.test.tsx**

Extract and record:
- Which queue behaviors are under test coverage
- Tab/filter test assertions
- Any state-specific test scenarios

- [ ] **Step 4: Read ProjectReviewDetailPage.test.tsx**

Extract and record:
- Which detail-page actions are under test coverage
- Approval flow test assertions (especially project-number validation)
- State-conditional action visibility tests
- Any `AwaitingExternalSetup` test scenarios

- [ ] **Step 5: Write Accounting surface evidence summary**

Produce a working note (held in context, not a file) answering:
1. What exact Accounting-side controller actions are implemented today? (Q1)
2. What exact queue filters and detail-page affordances are implemented today? (Q2)
3. What exact approval action is implemented today, including the project-number requirement and call shape? (Q3)
4. Is there a live Accounting UI gap between `AwaitingExternalSetup` and the next valid state? (Q8)

---

### Task 2: Read and catalog shared provisioning package facts

Read the shared `@hbc/provisioning` package files to extract lifecycle model, ownership semantics, and notification contract.

**Files:**
- Read: `packages/provisioning/src/state-machine.ts`
- Read: `packages/provisioning/src/bic-config.ts`
- Read: `packages/provisioning/src/notification-registrations.ts`

- [ ] **Step 1: Read state-machine.ts (packages/provisioning)**

Extract and record:
- All defined request states
- All valid state transitions (the full transition map)
- Whether `ReadyToProvision` and `Provisioning` are both still present
- Whether `AwaitingExternalSetup` transitions are defined and to which states

- [ ] **Step 2: Read bic-config.ts**

Extract and record:
- Owner assignments per state (especially `ReadyToProvision`, `Provisioning`, `AwaitingExternalSetup`)
- Which states resolve to `null` owner (system-owned)
- State descriptions and metadata

- [ ] **Step 3: Read notification-registrations.ts**

Extract and record:
- Registered notification events
- Recipient resolution patterns
- Any lifecycle-event to notification-event mapping
- Whether env vars are used for recipient routing

- [ ] **Step 4: Write shared-package evidence summary**

Produce a working note answering:
1. What request states and transitions are implemented today? (Q4)
2. Is `ReadyToProvision` still a real modeled state, and what role does it serve? (Q7)
3. What responsibilities are already clearly separated in `@hbc/provisioning`? (partial Q9)

---

### Task 3: Read and catalog backend lifecycle, auth, and host facts

Read the backend source files to extract the actual lifecycle handler behavior, saga orchestration, auth model, and service-factory posture.

**Files:**
- Read: `backend/functions/src/state-machine.ts`
- Read: `backend/functions/src/functions/projectRequests/index.ts`
- Read: `backend/functions/src/functions/projectRequests/__tests__/request-lifecycle.test.ts`
- Read: `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- Read: `backend/functions/src/hosts/project-setup/service-factory.ts`
- Read: `backend/functions/src/middleware/auth.ts`
- Read: `backend/functions/src/middleware/authorization.ts`

- [ ] **Step 1: Read backend state-machine.ts**

Extract and record:
- Backend-side state definitions and transitions
- Any differences from the shared package state machine
- Transition validation logic

- [ ] **Step 2: Read projectRequests/index.ts**

Extract and record:
- The `advanceRequestState` handler implementation
- Transition validation flow
- Role resolution from JWT claims + ownership
- `projectNumber` requirement for `ReadyToProvision`
- The auto-trigger logic: when new state is `ReadyToProvision`, constructs `IProvisionSiteRequest`, instantiates `SagaOrchestrator`, fire-and-forget execution
- The skip condition (existing non-failed provisioning status)
- Request persistence flow

- [ ] **Step 3: Read request-lifecycle.test.ts**

Extract and record:
- Which lifecycle transitions are under test
- Auto-trigger test scenarios
- Project-number validation test assertions
- Role/auth test scenarios

- [ ] **Step 4: Read saga-orchestrator.ts**

Extract and record:
- Saga entry point and execution flow
- How it transitions from `ReadyToProvision` to `Provisioning`
- System-owned progression behavior
- Error handling and failure states

- [ ] **Step 5: Read service-factory.ts**

Extract and record:
- Domain host selection logic
- Service instantiation patterns
- Connected-service posture implications

- [ ] **Step 6: Read auth.ts and authorization.ts**

Extract and record:
- Auth wrapper (`withAuth`) implementation
- JWT app-role claims extraction
- Ownership-based authorization fallback (`oid`)
- Whether env vars are used for authorization (expected: no, only for notification routing)
- Role-based access control model

- [ ] **Step 7: Write backend evidence summary**

Produce a working note answering:
1. What exact backend event currently starts the provisioning saga? (Q5)
2. How does the live repo distinguish controller approval → `ReadyToProvision`, automatic provisioning start, and system-owned `Provisioning`? (Q6)
3. Which current backend-auth / domain-host posture files materially affect the workflow contract? (Q13)

---

### Task 4: Read and catalog current-state authoritative docs

Read the living reference docs to compare their claims against the evidence collected in Tasks 1–3.

**Files:**
- Read: `docs/architecture/blueprint/current-state-map.md`
- Read: `docs/reference/spfx-surfaces/controller-review-surface.md`
- Read: `docs/reference/spfx-surfaces/admin-recovery-boundary.md`
- Read: `docs/reference/spfx-surfaces/coordinator-visibility-spec.md`
- Read: `docs/reference/developer/project-setup-connected-service-posture.md`
- Read: `docs/reference/provisioning/verification-matrix.md`

- [ ] **Step 1: Read current-state-map.md**

Extract and record:
- Current authority hierarchy
- Classification of living docs vs stale docs
- Current-state claims about Project Setup workflow

- [ ] **Step 2: Read controller-review-surface.md**

Extract and record:
- Documented controller actions
- Whether approve action includes `projectNumber` in the call shape
- Any stale or incomplete action mapping
- Whether `AwaitingExternalSetup` forward action is documented

- [ ] **Step 3: Read admin-recovery-boundary.md**

Extract and record:
- Admin-owned recovery actions (retry, archive, escalation ack, state override)
- Boundary claims vs live code

- [ ] **Step 4: Read coordinator-visibility-spec.md**

Extract and record:
- Estimating coordinator surface scope
- Limited retry/escalation behavior
- Boundary with Accounting and Admin

- [ ] **Step 5: Read project-setup-connected-service-posture.md**

Extract and record:
- Connected-service configuration posture
- Impact on workflow contract

- [ ] **Step 6: Read verification-matrix.md**

Extract and record:
- Verification expectations for provisioning workflow
- Any gaps or stale entries

- [ ] **Step 7: Write current-docs evidence summary**

Produce a working note answering:
1. What responsibilities are already clearly separated across surfaces? (Q9)
2. Does any current living surface doc remain authoritative in family but partially stale in detail? (Q14)

---

### Task 5: Read and catalog known drift/stale comparison docs

Read the historical and potentially stale docs. Classify each as current, partially stale, or fully stale.

**Files:**
- Read: `docs/architecture/plans/PH6.8-RequestLifecycle-StateEngine.md`
- Read: `docs/reference/provisioning/request-lifecycle.md`
- Read: `docs/reference/workflow-experience/setup-notification-registrations.md`
- Read: `docs/reference/provisioning/notification-event-matrix.md`

- [ ] **Step 1: Read PH6.8-RequestLifecycle-StateEngine.md**

Extract and record:
- Lifecycle claims that conflict with current repo truth
- Whether it still implies a distinct controller launch action post-approval
- Notification wording about controller trigger capability
- Classification: historical lineage, not present-truth authority

- [ ] **Step 2: Read request-lifecycle.md**

Extract and record:
- Lifecycle description completeness
- Missing elements: role-auth, auto-trigger, system ownership, `AwaitingExternalSetup` gap
- Classification: useful but incomplete

- [ ] **Step 3: Read setup-notification-registrations.md**

Extract and record:
- `ready-to-provision` event description
- Whether it still says "provisioning queued" or implies manual trigger
- Classification: partially stale

- [ ] **Step 4: Read notification-event-matrix.md**

Extract and record:
- Event count and contract framing
- Env-var recipient resolution model claims
- Notification tier/channel assumptions
- Classification: strong drift source, needs downgrade or annotation

- [ ] **Step 5: Scan for additional PH6 or historical workflow docs**

Search `docs/architecture/plans/` and `docs/reference/` for any additional PH6 or historical workflow text that references Project Setup lifecycle semantics and still appears to influence current prompt wording. Record whether any require inclusion in the audit scope beyond the four named files above.

```bash
grep -rl "ReadyToProvision\|Provisioning\|AwaitingExternalSetup\|provisioning saga" docs/architecture/plans/ docs/reference/ --include="*.md" | sort
```

Compare results against the four files already read. For any new matches, read and classify as current authority or drift source.

- [ ] **Step 6: Write drift-docs evidence summary**

Produce a working note answering:
1. Which current docs still describe a different workflow from current code? (Q10)
2. Which stale docs are merely historical, and which are risky because they could mislead a later implementation agent? (Q11)
3. Which discrepancies are severe enough to block later implementation if left unresolved? (Q12)

---

## Chunk 2: Analysis, Synthesis, and Memo Writing

### Task 6: Build the discrepancy inventory

Using evidence from Tasks 1–5, construct the structured discrepancy inventory with required fields per Prompt-01 spec.

- [ ] **Step 1: Identify and catalog all discrepancies**

Before building the inventory, explicitly synthesize multi-source answers:
- **Q9** (responsibility separation): merge evidence from Task 2 Step 4 (shared package ownership) and Task 4 Step 7 (surface doc boundary claims) into a single consolidated finding covering all five domains (Accounting, Estimating, Admin, backend orchestration, `@hbc/provisioning`).

For each discrepancy, record:
- ID (D-01, D-02, etc.)
- Topic
- Classification (confirmed repo fact / confirmed repo-doc intent / inferred recommendation / unresolved ambiguity)
- Repo-truth evidence (file path + specific finding)
- Conflicting doc or implementation evidence
- Why it matters
- Recommended resolution direction
- Downstream implementation risk if unresolved

**Expected minimum discrepancy rows** (per Prompt-01 requirements):
- D-01: Lifecycle wording drift around `ReadyToProvision`
- D-02: `AwaitingExternalSetup` contract vs live UI gap
- D-03: Controller-review doc drift (action mapping omits project-number capture)
- D-04: Notification-doc drift (provisioning trigger language no longer matches backend)
- D-05: Auth / notification recipient language that could be misread as authorization guidance

Additional discrepancies from evidence collection will be added.

- [ ] **Step 2: Assign severity rankings**

Rank each discrepancy as:
- Critical: blocks later implementation if unresolved
- High: creates significant risk of stale-semantic implementation
- Medium: creates moderate drift risk
- Low: cosmetic or minor precision issue

---

### Task 7: Write the audit memo

Create the complete audit memo at `docs/architecture/reviews/phase-1-workflow-contract-audit.md` with all required sections.

**Files:**
- Create: `docs/architecture/reviews/phase-1-workflow-contract-audit.md`

- [ ] **Step 1: Write Executive Summary**

2–3 paragraphs: overall repo-truth status, key findings, severity of the discrepancy set, and whether Phase 1 can proceed.

- [ ] **Step 2: Write Canonical Copy Check**

Per Prompt-01 requirements:
- State whether the Phase 1 package exists under `docs/architecture/plans/MASTER/spfx/accounting/phase-1/`
- State whether duplicate copies were found
- Use repo-relative paths only (no machine-specific absolute paths)

- [ ] **Step 3: Write Confirmed Repo Facts**

Structured answers to Questions 1–8 from Prompt-01, each labeled as "confirmed repo fact" with file-path evidence.

- [ ] **Step 4: Write Confirmed Repo-Doc Intent**

Capture where docs and code agree on intent even if wording is imprecise. Label as "confirmed repo-doc intent."

- [ ] **Step 5: Write Current Backend/Auth/Host Posture Facts**

Structured summary of auth middleware, service-factory, and connected-service posture findings from Task 3. Answer Q13.

- [ ] **Step 6: Write Discrepancy Inventory**

Full structured table from Task 6, with all required fields per discrepancy.

- [ ] **Step 7: Write Stale Authority Paths**

Classify each drift source doc from Task 5 with specific stale claims and why they are stale. Answer Q10, Q11.

- [ ] **Step 8: Write Severity Ranking**

Ordered list of discrepancies by severity with rationale for ranking.

- [ ] **Step 9: Write Recommended Freeze Decisions for Prompt-02**

Specific recommendations that Prompt-02 should freeze, derived from the discrepancy inventory. Answer Q12.

- [ ] **Step 10: Write Explicit Open Questions**

Catalog remaining unresolved ambiguities with classification. Include carry-forward items from audit report Q14 + any new ambiguities discovered.

- [ ] **Step 11: Write Exact Files Inspected**

Four lists per Prompt-01 verification requirements:
1. Exact files inspected
2. Exact repo evidence used
3. Exact docs treated as current authority
4. Exact docs treated as stale or historical drift sources

- [ ] **Step 12: Self-review the memo**

Verify:
- All 14 questions from Prompt-01 are answered
- Every finding has a classification label
- Every discrepancy has all required fields
- No machine-specific absolute paths
- No mixing of classification categories without explicit labeling
- Memo follows `docs/reference/developer/documentation-authoring-standard.md` quality bar

---

## Chunk 3: Finalization, Verification, and Commit

### Task 8: Version bump and verification

- [ ] **Step 1: Bump version in apps/accounting/package.json**

Bump `"version": "0.0.6"` → `"version": "0.0.7"` in `apps/accounting/package.json`.

- [ ] **Step 2: Run accounting app verification suite**

Run the full verification suite for the accounting app:

```bash
cd apps/accounting && pnpm run lint
cd apps/accounting && pnpm run build
```

Also run workspace-level checks if the accounting app has type-check and test commands:

```bash
pnpm check-types --filter=@hbc/spfx-accounting
pnpm test --filter=@hbc/spfx-accounting
```

Expected: All pass (no code changes, only docs + version bump).

- [ ] **Step 3: Verify the audit memo exists and is well-formed**

```bash
test -f docs/architecture/reviews/phase-1-workflow-contract-audit.md && echo "Memo exists" || echo "MISSING"
```

Check that the memo contains all required sections by searching for expected headings.

---

### Task 9: Prepare commit

- [ ] **Step 1: Stage files**

```bash
git add docs/architecture/reviews/phase-1-workflow-contract-audit.md
git add apps/accounting/package.json
```

- [ ] **Step 2: Create conventional commit**

```bash
git commit -m "docs(accounting): add Phase 1 repo-truth workflow contract audit memo (P1-01)

Conduct fresh repo-truth audit of Accounting-side Project Setup workflow
contract per Prompt-01 spec. Produces severity-ranked discrepancy
inventory covering lifecycle drift, AwaitingExternalSetup UI gap,
approval call-shape omission, notification-doc staleness, and auth
posture anchoring. Establishes decision basis for Prompts 02-06.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task Dependency Graph

```
Task 1 (Accounting UI) ──┐
Task 2 (Shared pkg)   ───┼──→ Task 6 (Discrepancy inventory) ──→ Task 7 (Write memo) ──→ Task 8 (Verify) ──→ Task 9 (Commit)
Task 3 (Backend)      ───┤
Task 4 (Current docs) ───┤
Task 5 (Stale docs)   ───┘
```

Tasks 1–5 are **independent and can run in parallel** (subagent candidates).
Tasks 6–9 are **sequential** — each depends on the prior task's output.

---

## Verification Checklist

Before claiming completion, confirm:

- [ ] Audit memo exists at `docs/architecture/reviews/phase-1-workflow-contract-audit.md`
- [ ] All 14 Prompt-01 questions are answered in the memo
- [ ] Every finding is classified (confirmed repo fact / confirmed repo-doc intent / inferred recommendation / unresolved ambiguity)
- [ ] Discrepancy inventory has all required fields per entry
- [ ] Minimum 5 discrepancy rows present (lifecycle drift, AwaitingExternalSetup, controller-review, notification-doc, auth language)
- [ ] Severity ranking is present
- [ ] No machine-specific absolute paths in memo
- [ ] Canonical copy check section is present
- [ ] Exact files inspected section is present
- [ ] `apps/accounting/package.json` version bumped to `0.0.7`
- [ ] Accounting verification suite passes (lint, build, check-types)
- [ ] Commit message follows conventional format
