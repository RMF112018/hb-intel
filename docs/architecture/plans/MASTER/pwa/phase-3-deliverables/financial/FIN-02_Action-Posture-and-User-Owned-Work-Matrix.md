# FIN-02 — Financial Module Action Posture and User-Owned Work Matrix

## Document Purpose

This document defines the action model for the Financial module so implementers can distinguish:

- what is actionable in-place
- what is review-only
- what is blocked or waiting
- what escalates into a deeper workflow
- who owns each action at each stage

This file converts the Financial domain model into an operational surface model.

This document should be read with:
- `FIN-01 — Financial Module Operating Posture and Surface Classification`
- `FIN-03 — Financial Module Lane Ownership Matrix`
- `FIN-04 — Financial Module Route and Context Contract`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FVC-02-Forecast-Versioning-and-Checklist-Contract.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FRC-05-Financial-Workflow-Translation.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`

---

## 1. Operating Rule

Every Financial surface must visibly communicate all four of the following:

1. **Current posture**
   - actionable here
   - view only
   - blocked
   - stale
   - waiting
   - escalated / deeper workflow

2. **Current owner**
   - who is expected to act next

3. **Available actions**
   - edit
   - review
   - resolve
   - confirm
   - publish
   - escalate
   - derive
   - export

4. **Why a user cannot act** when action is unavailable
   - insufficient permissions
   - prior step incomplete
   - review hold
   - publication lock
   - missing import or reconciliation
   - stale project context

A surface that does not express these four things is not complete.

---

## 2. Action Posture Vocabulary

### 2.1 Actionable Here
The user can perform the primary intended work directly on the current surface.

### 2.2 View Only
The user can inspect posture or historical data but cannot mutate the relevant working state.

### 2.3 Escalate / Open Deeper Workflow
The current surface can explain the issue and direct the user, but the actual work belongs to another surface or lane.

### 2.4 Blocked
A required dependency is missing or unresolved. The user cannot proceed until it is cleared.

### 2.5 Waiting
The user’s work is complete for now, but another actor or system must act next.

### 2.6 Stale
The displayed state is no longer current enough for action-taking and must be refreshed, revalidated, or superseded.

---

## 3. Role Set for Action Modeling

- **PM** — primary working-state owner
- **PX/PE** — internal executive/reviewer/escalation owner
- **Finance / Controller** — import, reconciliation, review, publication, output custody
- **Executive / Leadership** — posture visibility and limited decision/override where policy allows
- **Admin / System** — configuration, mapping, reference data, policy, auditing

---

## 4. Surface-by-Surface Action Matrix

## 4.1 Financial Landing / Project Financial Home

### Primary Purpose
Provide immediate financial posture, unresolved work, and direct entry into the right deeper Financial workflow.

### Allowed Primary Actions
- open budget import exceptions
- open active working version
- open checklist issues
- open review or publication hold
- open buyout tasks
- open cash flow or GC/GR editor

### Action Posture by State
| State | Posture | Visible Next Move |
|---|---|---|
| healthy and current | actionable here for navigation / triage | continue active working tasks |
| checklist incomplete | actionable here | open unresolved checklist items |
| review pending | waiting / escalate | open review panel or handoff surface |
| publication ready | actionable here or escalate | open publication workflow |
| stale working version | blocked / stale | refresh, derive, or create successor version |
| no active baseline | blocked | open budget import / reconciliation |

### Owner Model
- PM: primary triage owner
- PX/PE: escalation / review owner
- Finance: review/publication/input exception owner

### Completion Rule
The landing surface must not end at summary. It must expose direct next actions and unresolved posture.

---

## 4.2 Budget Import and Reconciliation

### Primary Purpose
Bring in external budget baseline data and establish or refresh the governed project baseline.

### Primary Owner
- Finance / Controller
- PM as project-side reconciliation participant

### Allowed Actions
- upload / initiate import
- preview parsed results
- map fields or lines where allowed
- review exceptions
- accept / reject reconciliation outcomes
- activate accepted baseline
- escalate unresolved mapping or authority issues

### View-Only States
- historical import run
- completed accepted baseline snapshot
- audit view for prior run

### Deeper Workflow States
- multi-step reconciliation
- exception drill-through
- governance hold / invalid import structure

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| no baseline | actionable here | Finance / PM | start import |
| import parsing | waiting | system | review results when ready |
| exceptions detected | actionable here | Finance / PM | resolve mapping or reject run |
| accepted pending activation | actionable here | authorized reviewer | activate baseline |
| activated baseline | view only | all | proceed to forecast work |
| authority conflict | blocked / escalate | admin / finance lead | resolve source or mapping authority |

### Required Runtime Honesty
The surface must explicitly state whether the import result is:
- draft preview
- exception state
- accepted but not active
- active authoritative baseline

---

## 4.3 Forecast Summary / Working Version

### Primary Purpose
Maintain the current working financial forecast version for the active period.

### Primary Owner
- PM
- PX/PE as higher-order reviewer / approver / escalation owner

### Allowed Actions
- create or derive working version
- edit working summary values
- review variance/exposure posture
- save draft changes
- designate candidate version
- submit for internal confirmation
- open supporting checklist, GC/GR, cash flow, or buyout surfaces

### View-Only States
- confirmed or published prior versions
- superseded versions
- versions under restricted review state when policy forbids edits

### Deeper Workflow States
- candidate designation with policy validation
- review hold resolution
- derivation from prior period

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| working current version | actionable here | PM | edit and prepare |
| working with unresolved dependencies | actionable here with blockers visible | PM | resolve checklist / import / sub-surface gaps |
| candidate pending review | waiting / escalate | PX/PE / Finance | review candidate |
| confirmed internal | view only or limited escalation | reviewers / PM | proceed to publication or derive successor |
| published monthly | view only | all | reference or derive next version |
| superseded | view only | all | open successor version |

---

## 4.4 Forecast Checklist

### Primary Purpose
Gate financial readiness and prevent hidden incompleteness before confirmation/publication.

### Primary Owner
- PM for resolution
- PX/PE and Finance for review visibility

### Allowed Actions
- view required checklist items
- resolve incomplete items
- mark supporting tasks complete where policy allows
- open linked deeper workflows
- submit checklist as satisfied

### View-Only States
- locked checklist on immutable published version
- prior satisfied checklist on historical version

### Deeper Workflow States
- checklist-linked drill through into budget, forecast, GC/GR, cash flow, or buyout gaps

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| unresolved items exist | actionable here | PM | resolve items |
| dependencies external to checklist | escalate / deeper workflow | PM / Finance / PX | open linked workflow |
| all items satisfied | waiting | PM then reviewer | submit for review/confirmation |
| locked due to publication | view only | all | inspect historical state |

### Required Runtime Honesty
Checklist state must be visible on the Financial home and Forecast Summary surfaces. It must never be hidden behind a secondary tab if it blocks progress.

---

## 4.5 GC/GR

### Primary Purpose
Maintain general conditions / general requirements values that feed forecast posture.

### Primary Owner
- PM

### Allowed Actions
- edit working values
- review historical/current deltas
- save working state
- push updated posture back into forecast readiness

### View-Only States
- historical or published versions
- review-locked state

### Deeper Workflow States
- exceptional review if thresholds or policy conditions are breached

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| active working version | actionable here | PM | update values |
| data required for checklist completion | actionable here | PM | complete required entries |
| review hold | blocked / escalate | PX/PE / Finance | resolve hold |
| published/historical | view only | all | inspect lineage |

---

## 4.6 Cash Flow

### Primary Purpose
Maintain projected financial timing / distribution and expose time-based funding posture.

### Primary Owner
- PM
- PX/PE / Finance as reviewers depending on policy

### Allowed Actions
- edit cash flow assumptions or values
- compare to forecast posture
- save scenario / working state where allowed
- support review decision-making

### View-Only States
- published / historical periods
- restricted review states

### Deeper Workflow States
- scenario comparison
- review of material timing change

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| editable working state | actionable here | PM | update distribution |
| material variance requiring review | actionable here + escalate | PM / PX | adjust or escalate |
| pending review | waiting | reviewer | approve / hold / return |
| historical published | view only | all | inspect history |

---

## 4.7 Buyout

### Primary Purpose
Manage buyout progression, savings posture, and downstream financial readiness.

### Primary Owner
- PM
- PX/PE for disposition / major directional review

### Allowed Actions
- update buyout status
- record savings / disposition state
- reflect readiness posture
- link to related procurement/commitment context
- advance state when prerequisites are satisfied

### View-Only States
- historical buyout snapshots
- locked prior states associated with published periods

### Deeper Workflow States
- contract / commitment detail
- procurement coordination
- savings disposition review

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| active pending buyout work | actionable here | PM | update status / savings posture |
| disposition decision needed | escalate | PX/PE | disposition decision |
| dependency external to buyout | blocked | PM / procurement / finance | resolve linked dependency |
| stable and complete | waiting | PM / reviewer | proceed with forecast/publish |

---

## 4.8 Review / PER / Internal Confirmation

### Primary Purpose
Provide controlled review custody before publication.

### Primary Owner
- PX/PE
- Finance / Controller

### Allowed Actions
- review submitted version
- approve / hold / return
- comment or annotate where supported
- validate checklist and exception posture
- move to confirmed state

### View-Only States
- non-reviewers with no mutation rights
- historical completed reviews

### Deeper Workflow States
- return-to-preparer flow
- publication hold / exception investigation

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| awaiting review | actionable here | reviewer | approve / hold / return |
| returned for revision | waiting for preparer | PM | revise working version |
| confirmed | waiting for publication or successor derivation | Finance / PM | publish or carry forward |
| under hold | blocked / escalate | reviewer / PM | resolve stated hold issues |

---

## 4.9 Publication / Export

### Primary Purpose
Generate official monthly outputs and control publication status.

### Primary Owner
- Finance / Controller
- authorized reviewer where policy permits

### Allowed Actions
- publish monthly version
- generate export artifacts
- inspect output readiness
- regenerate where policy allows

### View-Only States
- completed published outputs
- historical artifacts
- outputs owned by another actor in-progress

### Deeper Workflow States
- output packaging
- report generation failure / rerun
- downstream distribution workflow

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| confirmed ready to publish | actionable here | Finance / reviewer | publish |
| missing prerequisite | blocked | Finance / PM / reviewer | resolve unmet condition |
| published | view only | all | inspect output |
| generation failure | actionable here + escalate | Finance / admin | rerun / diagnose |

---

## 4.10 History / Audit / Prior Versions

### Primary Purpose
Provide traceable lineage and historical inspection.

### Primary Owner
- all roles according to visibility

### Allowed Actions
- inspect prior versions
- compare working vs prior vs published state
- inspect audit trail
- open successor / source version

### View-Only States
- default posture is read-mostly

### Deeper Workflow States
- drill to current working or review surface

### Posture Matrix
| State | Posture | Owner | Next Move |
|---|---|---|---|
| historical review | view only | all | inspect lineage |
| current issue traced historically | escalate / navigate | all | open current responsible surface |

---

## 5. Cross-Surface Action Rules

### 5.1 Checklist Gate Rule
A user must never be able to publish or confirm a version without visible checklist posture.

### 5.2 Immutable-State Rule
Confirmed or published versions must be visibly immutable. Mutation must occur through derivation or authorized successor workflow, not silent unlock-in-place.

### 5.3 Escalation Rule
Where a task belongs to another sub-surface, the current surface must provide a direct open action and a clear explanation of why the user must leave.

### 5.4 Blocker Visibility Rule
A blocker must always name:
- what is blocked
- why it is blocked
- who owns the unblock step
- where the user should go next

### 5.5 Work Queue Rule
Any unresolved Financial obligation that materially changes next action ownership must publish into the Project Hub / My Work queue.

---

## 6. Shared Spine Publication Outcomes

Each Financial action surface must identify what it publishes into shared project spines.

| Surface | Activity | Health | Work Queue | Related Items |
|---|---|---|---|---|
| Budget Import | import runs, acceptance, activation, exception events | baseline readiness / exception health | unresolved import actions | import runs ↔ budget lines / source files |
| Forecast Summary | draft changes, derivation, candidate designation, confirmation, publication | financial posture / variance / exception health | pending review / next moves | version ↔ lines / reports / related records |
| Checklist | item resolution events | readiness health | unresolved items | checklist ↔ linked deficient records |
| GC/GR | material updates | financial health contribution | required GC/GR actions | linked line / version context |
| Cash Flow | material timing updates | timing health contribution | review-required changes | linked version / report context |
| Buyout | state transitions, savings decisions | buyout readiness health | pending buyout tasks | buyout ↔ commitments / packages |
| Review / Publication | review transitions / publish events | publication readiness health | pending reviewer / publisher actions | published artifact links |

---

## 7. Acceptance Standard for This Document

This document is satisfied when:
- each Financial surface has an explicit action posture
- ownership is clear by state and role
- blocked / stale / waiting / escalate conditions are defined
- an implementer can design surface behavior without inferring the action model from scattered domain docs
- FIN-03 and FIN-04 can map the lane and route implications of the actions defined here
