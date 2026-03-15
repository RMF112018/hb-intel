<!-- Tier 1: Living Reference (Diátaxis) — W0-G4-T01 -->

# Estimating Requester Surface Reference

> **Classification:** Living Reference (Diátaxis)
> **Produced by:** W0-G4-T01

## Route Map

| Route | Component | Purpose |
|---|---|---|
| `/project-setup/new` | `NewRequestPage` | 5-step guided project setup wizard |
| `/project-setup/new?mode=clarification-return&requestId={id}` | `NewRequestPage` | Wizard pre-populated for clarification re-entry |
| `/project-setup/$requestId` | `RequestDetailPage` | Request detail with BIC ownership and provisioning status |

### Search Param Contract (`/project-setup/new`)

| Param | Type | Default | Description |
|---|---|---|---|
| `mode` | `'new-request' \| 'clarification-return'` | `'new-request'` | Wizard mode |
| `requestId` | `string \| undefined` | `undefined` | Required when `mode === 'clarification-return'` |

## Component Hierarchy

### NewRequestPage

```
WorkspacePageShell layout="form"
├── HbcSyncStatusBadge (actions slot)
├── ResumeBanner (conditional: resumeContext.decision === 'prompt-user')
├── HbcConnectivityBar
├── HbcBanner variant="error" (conditional: submission error)
└── HbcStepWizard variant="vertical"
    ├── ProjectInfoStepBody (step: project-info)
    ├── DepartmentStepBody (step: department)
    ├── TeamStepBody (step: project-team)
    ├── TemplateAddOnsStepBody (step: template-addons)
    └── ReviewStepBody (step: review-submit)
```

### RequestDetailPage

```
WorkspacePageShell layout="detail"
├── RequestCoreSummary (project name, status badge, BIC ownership)
├── RequestStateContext (state explanation text)
├── ClarificationBanner (conditional: state === NeedsClarification)
├── ProvisioningChecklist (conditional: full visibility + active provisioning)
└── HbcComplexityGate minTier="standard"
    └── Extended Details card (team, add-ons, blocked reason)
```

## Step Wizard Configuration

Consumed from `PROJECT_SETUP_WIZARD_CONFIG` in `@hbc/features-estimating`.

| Step | stepId | Required | Fields |
|---|---|---|---|
| 1 | `project-info` | Yes | projectName, projectLocation, estimatedValue, clientName, startDate |
| 2 | `department` | Yes | department, projectType, projectStage, contractType |
| 3 | `project-team` | Yes | projectLeadId, groupMembers, viewerUPNs |
| 4 | `template-addons` | No | addOns (filtered by department) |
| 5 | `review-submit` | Yes | Cross-step validation + submission |

- **Order mode:** sequential (steps unlock linearly)
- **Allow reopen:** true (required for department→step-4 dependency)
- **Draft key:** `project-setup-form-draft`

## Draft Persistence

| Mode | Draft Key | TTL | Resume Decision |
|---|---|---|---|
| `new-request` | `project-setup-form-draft` | 48 hours | `prompt-user` if draft exists and is within TTL |
| `clarification-return` | `project-setup-clarification-{requestId}` | 168 hours (7 days) | `auto-continue` |

### Resume Decision Matrix

| Decision | Behavior |
|---|---|
| `prompt-user` | Show ResumeBanner with "Resume Draft" / "Start New" actions |
| `auto-continue` | Silently load draft fields into form state |
| `fresh-start` | Initialize with empty defaults |

## Clarification-Return Flow

1. Reviewer sets request state to `NeedsClarification` with `clarificationNote`
2. `RequestDetailPage` renders `ClarificationBanner` with link to `/project-setup/new?mode=clarification-return&requestId={id}`
3. `NewRequestPage` fetches existing request, pre-populates wizard
4. `buildClarificationReturnState()` resolves flagged step IDs (scaffolded — backend may not populate `clarificationItems` yet)
5. On resubmission, draft is cleared and user navigates to detail page

## BIC Ownership Display

- Uses `useBicNextMove` with `PROJECT_SETUP_BIC_CONFIG` from `@hbc/provisioning`
- Displays: current owner, expected action, urgency tier
- Composed from `HbcCard` + `HbcStatusBadge` + `HbcTypography` (future `HbcBicBadge`)

## Complexity Gating

- Extended details (team members, add-ons, blocked reason) gated behind `HbcComplexityGate minTier="standard"`
- Essential tier sees: core summary, status badge, state context, clarification banner, provisioning checklist

## State Badge Mapping

| State | StatusVariant |
|---|---|
| Submitted | `pending` |
| UnderReview | `inProgress` |
| NeedsClarification | `warning` |
| AwaitingExternalSetup | `pending` |
| ReadyToProvision | `pending` |
| Provisioning | `inProgress` |
| Completed | `completed` |
| Failed | `error` |
