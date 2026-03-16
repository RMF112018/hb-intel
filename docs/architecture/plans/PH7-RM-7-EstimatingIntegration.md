# PH7-RM-7 — Estimating Integration and Review Workflow


> **Doc Classification:** Deferred Scope — Phase 7 remediation scope item. PH7.12 sign-off complete (2026-03-09, ADR-0091). Phase assignment decision pending (see OD-006 in P0-E2 Open Decisions Register). Do not implement until assigned to a Phase milestone.

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Depends on:** PH7-RM-6 (Session Summary complete), PH7-Estimating-Feature-Plan (domain models), @hbc/review-mode, @hbc/ui-kit
**Blocks:** PH7-BD-ReviewMode (Business Development Review Mode), PH7-ProjectHub-ReviewMode (Project Hub)

---

## Summary

Phase 7 is the **first real implementation** of the `@hbc/review-mode` contract. It creates the Estimating review configuration for three core sections (Pursuits, Preconstruction, Estimate Log), implements rich read-only card displays, wires the ReviewModeButton into the Estimating pages, and establishes the pattern for future domain integrations (Business Development, Project Hub, Leadership). The configuration includes filters (by status, lead estimator), per-section schemas, and edit forms integrated with existing Estimating services.

## Why It Matters

- **Proof of Concept**: Demonstrates the full @hbc/review-mode abstraction works end-to-end with a real domain.
- **Pattern for Reuse**: Establishes the `IReviewConfig<>` implementation pattern that all other features will follow.
- **Rich Domain UX**: Estimating reviewers get a distraction-free, focused experience tailored to their workflows.
- **Accountability**: Session summaries capture review scope and action items for fiscal tracking and compliance.
- **Zero Monolith Impact**: Review mode is a separate, reusable feature package—not hardcoded into the Estimating SPFx webpart.

## Files to Create / Modify

### New Files (Review Config & Cards)
1. `packages/features/estimating/src/reviewConfig/estimatingReviewConfig.ts` (hook + main config)
2. `packages/features/estimating/src/reviewConfig/PursuitReviewCard.tsx`
3. `packages/features/estimating/src/reviewConfig/PreconReviewCard.tsx`
4. `packages/features/estimating/src/reviewConfig/EstimateLogReviewCard.tsx`
5. `packages/features/estimating/src/reviewConfig/index.ts` (barrel)

### Stub File (Business Development forward reference)
6. `packages/features/business-development/src/reviewConfig/bdReviewConfig.stub.ts`

### Modifications (Page Integration)
7. `packages/features/estimating/src/pages/ActivePursuitsPage.tsx` (add ReviewModeButton)
8. `packages/features/estimating/src/pages/ActivePreconstructionPage.tsx` (add ReviewModeButton)
9. `packages/features/estimating/src/pages/EstimateLogPage.tsx` (add ReviewModeButton)
10. `packages/features/estimating/src/EstimatingProvider.tsx` (wrap with ReviewModeProvider)

---

## Implementation

### Step 1: EstimatingReviewConfig

#### Create `packages/features/estimating/src/reviewConfig/estimatingReviewConfig.ts`

The **complete, type-safe IReviewConfig<>** for all three Estimating sections. This is the contract that ReviewMode consumes.

```typescript
import { useQuery } from '@tanstack/react-query';
import type { IReviewConfig, IReviewSection, IReviewSectionSchema } from '@hbc/review-mode';
import type {
  IActivePursuit,
  IActivePreconstruction,
  IEstimateLogEntry,
  PursuitStatus,
  PreconStage,
  EstimateOutcome,
} from '@hbc/models';
import {
  fetchActivePursuits,
  fetchActivePreconstruction,
  fetchEstimateLog,
  updatePursuit,
  updatePrecon,
  updateEstimateLogEntry,
} from '../data/estimatingQueries.js';
import { PursuitReviewCard } from './PursuitReviewCard.js';
import { PreconReviewCard } from './PreconReviewCard.js';
import { EstimateLogReviewCard } from './EstimateLogReviewCard.js';
import { PursuitForm } from '../components/PursuitForm.js';
import { PreconForm } from '../components/PreconForm.js';
import { EstimateLogForm } from '../components/EstimateLogForm.js';

/**
 * useEstimatingReviewConfig hook.
 *
 * Assembles the complete IReviewConfig for all three Estimating review sections.
 * This is the contract that ReviewMode uses to:
 *   - Fetch data per section
 *   - Render sidebar schema (title, subtitle, status badge)
 *   - Render read-only card view
 *   - Render edit form in drawer
 *   - Apply filters (status, lead estimator, etc.)
 *   - Persist lastReviewedAt timestamp on marked records
 *
 * All data is fetched via TanStack Query for automatic caching and invalidation.
 *
 * @param fiscalYear - Optional fiscal year for Estimate Log filtering (defaults to current year).
 * @returns IReviewConfig<any> – complete config for ReviewMode to consume.
 *
 * @example
 * function ReviewPage() {
 *   const config = useEstimatingReviewConfig('2025');
 *   return <ReviewModeButton config={config} />;
 * }
 */
export function useEstimatingReviewConfig(fiscalYear: string = String(new Date().getFullYear())): IReviewConfig<any> {
  // Fetch all three data sets via TanStack Query.
  const { data: pursuits = [], isLoading: pursuitsLoading } = useQuery({
    queryKey: ['estimating', 'pursuits'],
    queryFn: fetchActivePursuits,
  });

  const { data: precon = [], isLoading: preconLoading } = useQuery({
    queryKey: ['estimating', 'preconstruction'],
    queryFn: fetchActivePreconstruction,
  });

  const { data: logEntries = [], isLoading: logLoading } = useQuery({
    queryKey: ['estimating', 'log', fiscalYear],
    queryFn: () => fetchEstimateLog(fiscalYear),
  });

  /**
   * Helper: Extract unique lead estimators from pursuits.
   * Used for dynamic filter options.
   */
  const leadEstimatorsFromPursuits = Array.from(
    new Set(pursuits.map(p => p.leadEstimatorUpn).filter(Boolean))
  ).map(upn => ({
    value: upn,
    label: pursuits.find(p => p.leadEstimatorUpn === upn)?.leadEstimatorName || upn,
  }));

  return {
    sessionKey: 'estimating',
    sessionTitle: 'Estimating Review',
    writePermissionKey: 'estimating:write',

    sections: [
      /**
       * SECTION 1: Pursuits
       */
      {
        id: 'pursuits',
        label: 'Pursuits',
        data: pursuits,
        isLoading: pursuitsLoading,

        // Sidebar schema: each pursuit shown as "Project Name (subtitle: Project #)".
        sidebarSchema: (pursuit: IActivePursuit): IReviewSectionSchema => ({
          title: pursuit.projectName,
          subtitle: pursuit.projectNumber,
          statusBadge: {
            label: pursuit.status,
            variant:
              pursuit.status === 'Awarded'
                ? 'success'
                : pursuit.status === 'NotAwarded' || pursuit.status === 'Withdrawn'
                  ? 'error'
                  : pursuit.status === 'Submitted' || pursuit.status === 'OnHold'
                    ? 'warning'
                    : 'neutral',
          },
        }),

        // Render the read-only card display for a pursuit.
        renderCard: (pursuit: IActivePursuit) => <PursuitReviewCard pursuit={pursuit} />,

        // Render the edit form (drawer modal).
        renderEditForm: (pursuit, onSave, onCancel) => (
          <PursuitForm
            initialValues={pursuit}
            onSubmit={async (data) => {
              await updatePursuit({ id: pursuit.id, ...data });
              onSave();
            }}
            isSubmitting={false}
            onCancel={onCancel}
          />
        ),

        // Persist lastReviewedAt when marked reviewed.
        onMarkReviewed: async (id, lastReviewedAt) => {
          await updatePursuit({ id, lastReviewedAt });
        },

        // Filter options: status + lead estimator.
        filters: [
          {
            id: 'status',
            label: 'Status',
            options: [
              { value: '', label: 'All Statuses' },
              { value: 'Awarded', label: 'Awarded' },
              { value: 'NotAwarded', label: 'Not Awarded' },
              { value: 'Withdrawn', label: 'Withdrawn' },
              { value: 'Submitted', label: 'Submitted' },
              { value: 'OnHold', label: 'On Hold' },
            ],
            filterFn: (pursuit: IActivePursuit, value: string) => !value || pursuit.status === value,
          },
          {
            id: 'leadEstimator',
            label: 'Lead Estimator',
            options: [{ value: '', label: 'All Estimators' }, ...leadEstimatorsFromPursuits],
            filterFn: (pursuit: IActivePursuit, value: string) =>
              !value || pursuit.leadEstimatorUpn === value,
          },
        ],
      },

      /**
       * SECTION 2: Preconstruction
       */
      {
        id: 'preconstruction',
        label: 'Preconstruction',
        data: precon,
        isLoading: preconLoading,

        sidebarSchema: (p: IActivePreconstruction): IReviewSectionSchema => ({
          title: p.projectName,
          subtitle: `${p.projectNumber} • ${p.currentStage}`,
          statusBadge: {
            label: p.currentStage,
            variant: p.currentStage === 'Closed' ? 'success' : p.currentStage === 'OnHold' ? 'warning' : 'neutral',
          },
        }),

        renderCard: (p: IActivePreconstruction) => <PreconReviewCard precon={p} />,

        renderEditForm: (p, onSave, onCancel) => (
          <PreconForm
            initialValues={p}
            onSubmit={async (data) => {
              await updatePrecon({ id: p.id, ...data });
              onSave();
            }}
            isSubmitting={false}
            onCancel={onCancel}
          />
        ),

        onMarkReviewed: async (id, lastReviewedAt) => {
          await updatePrecon({ id, lastReviewedAt });
        },

        filters: [
          {
            id: 'stage',
            label: 'Stage',
            options: [
              { value: '', label: 'All Stages' },
              { value: 'Planning', label: 'Planning' },
              { value: 'In Progress', label: 'In Progress' },
              { value: 'OnHold', label: 'On Hold' },
              { value: 'Closed', label: 'Closed' },
            ],
            filterFn: (p: IActivePreconstruction, value: string) =>
              !value || p.currentStage === value,
          },
        ],
      },

      /**
       * SECTION 3: Estimate Log
       */
      {
        id: 'log',
        label: 'Estimate Log',
        data: logEntries,
        isLoading: logLoading,

        sidebarSchema: (entry: IEstimateLogEntry): IReviewSectionSchema => ({
          title: entry.projectName,
          subtitle: `${entry.projectNumber} • ${entry.estimateType}`,
          statusBadge: {
            label: entry.outcome,
            variant:
              entry.outcome === 'AwardedWithPrecon' || entry.outcome === 'AwardedWithoutPrecon'
                ? 'success'
                : entry.outcome === 'NotAwarded'
                  ? 'error'
                  : 'warning',
          },
        }),

        renderCard: (entry: IEstimateLogEntry) => <EstimateLogReviewCard entry={entry} />,

        renderEditForm: (entry, onSave, onCancel) => (
          <EstimateLogForm
            initialValues={entry}
            onSubmit={async (data) => {
              await updateEstimateLogEntry({ id: entry.id, ...data });
              onSave();
            }}
            isSubmitting={false}
            onCancel={onCancel}
          />
        ),

        onMarkReviewed: async (id, lastReviewedAt) => {
          await updateEstimateLogEntry({ id, lastReviewedAt });
        },

        filters: [
          {
            id: 'outcome',
            label: 'Outcome',
            options: [
              { value: '', label: 'All Outcomes' },
              { value: 'AwardedWithPrecon', label: 'Awarded with Precon' },
              { value: 'AwardedWithoutPrecon', label: 'Awarded without Precon' },
              { value: 'NotAwarded', label: 'Not Awarded' },
              { value: 'Pending', label: 'Pending' },
            ],
            filterFn: (entry: IEstimateLogEntry, value: string) =>
              !value || entry.outcome === value,
          },
        ],
      },
    ],
  };
}
```

### Step 2: PursuitReviewCard

#### Create `packages/features/estimating/src/reviewConfig/PursuitReviewCard.tsx`

Rich read-only card display for an `IActivePursuit`.

```typescript
import React from 'react';
import { Card, Text, Badge } from '@fluentui/react-components';
import { HbcDataTable, HbcStatusBadge } from '@hbc/ui-kit';
import { ActionItemList } from '@hbc/review-mode';
import type { IActivePursuit } from '@hbc/models';

/**
 * PursuitReviewCard component.
 *
 * Displays a pursuit record in review mode (read-only).
 * Rich, spacious layout with sections for key dates, proposal checklist, team, external links, and action items.
 *
 * Layout:
 *   Row 1: Project number + name (large heading)
 *   Row 2: Status badge + Due Date (highlighted if within 7 days) + Lead Estimator
 *   Divider
 *   Section "Key Dates": 4-column grid showing Sub Bids Due, Pre-Sub Review, Win Strategy, Due Date
 *   Section "Proposal Checklist": 9 checklist items in 3-column grid
 *   Section "Team": Lead Estimator + contributors + Project Executive (if set)
 *   Section "External Platforms": Building Connected link + Procore link
 *   Section "Action Items": ActionItemList component
 */
export function PursuitReviewCard({ pursuit }: { pursuit: IActivePursuit }) {
  const isDueSoon = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilDue >= 0 && daysUntilDue <= 7;
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    const due = new Date(dueDate);
    return due < new Date();
  };

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 600 }}>
          {pursuit.projectName}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--colorNeutralForegroundHint)' }}>
          {pursuit.projectNumber}
        </p>
      </div>

      {/* Status, Due Date, Lead */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <HbcStatusBadge
          label={pursuit.status}
          variant={
            pursuit.status === 'Awarded'
              ? 'success'
              : pursuit.status === 'NotAwarded' || pursuit.status === 'Withdrawn'
                ? 'error'
                : 'warning'
          }
        />
        <div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Due Date</p>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: 14,
              fontWeight: 500,
              color: isOverdue(pursuit.dueDate)
                ? 'var(--colorErrorForeground)'
                : isDueSoon(pursuit.dueDate)
                  ? 'var(--colorWarningForeground)'
                  : 'var(--colorNeutralForeground1)',
            }}
          >
            {formatDate(pursuit.dueDate)}
          </p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Lead Estimator</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 500 }}>
            {pursuit.leadEstimatorName || 'Unassigned'}
          </p>
        </div>
      </div>

      <hr style={{ margin: 0, border: '1px solid var(--colorNeutralStroke1)' }} />

      {/* Key Dates */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
          Key Dates
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <DateBox label="Sub Bids Due" date={pursuit.subBidsDueDate} />
          <DateBox label="Pre-Sub Review" date={pursuit.preSubReviewDate} />
          <DateBox label="Win Strategy" date={pursuit.winStrategyMeetingDate} />
          <DateBox label="Pursuit Due" date={pursuit.dueDate} />
        </div>
      </div>

      {/* Proposal Checklist */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
          Proposal Checklist
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { key: 'hasBidBond', label: 'Bid Bond' },
            { key: 'hasPPBond', label: 'P&P Bond' },
            { key: 'hasSchedule', label: 'Schedule' },
            { key: 'hasLogistics', label: 'Logistics' },
            { key: 'hasBimProposal', label: 'BIM Proposal' },
            { key: 'hasPreconProposal', label: 'Precon Proposal' },
            { key: 'hasProposalTabs', label: 'Proposal Tabs' },
            { key: 'hasMarketingCoord', label: 'Marketing Coordination' },
            { key: 'hasBusinessTerms', label: 'Business Terms' },
          ].map(item => (
            <ChecklistItem
              key={item.key}
              label={item.label}
              checked={pursuit[item.key as keyof IActivePursuit] === true}
            />
          ))}
        </div>
      </div>

      {/* Team */}
      {(pursuit.leadEstimatorName || pursuit.projectExecutiveName) && (
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
            Team
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pursuit.leadEstimatorName && <PersonChip name={pursuit.leadEstimatorName} role="Lead Estimator" />}
            {pursuit.projectExecutiveName && <PersonChip name={pursuit.projectExecutiveName} role="Project Executive" />}
          </div>
        </div>
      )}

      {/* External Platforms */}
      {(pursuit.buildingConnectedUrl || pursuit.procoreUrl) && (
        <div>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
            External Platforms
          </h3>
          <div style={{ display: 'flex', gap: 12 }}>
            {pursuit.buildingConnectedUrl && (
              <a href={pursuit.buildingConnectedUrl} target="_blank" rel="noopener noreferrer">
                <button style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid var(--colorNeutralStroke1)', backgroundColor: 'transparent', cursor: 'pointer' }}>
                  Building Connected
                </button>
              </a>
            )}
            {pursuit.procoreUrl && (
              <a href={pursuit.procoreUrl} target="_blank" rel="noopener noreferrer">
                <button style={{ padding: '8px 16px', borderRadius: 4, border: '1px solid var(--colorNeutralStroke1)', backgroundColor: 'transparent', cursor: 'pointer' }}>
                  Procore
                </button>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Items */}
      <ActionItemList recordId={pursuit.id} />
    </div>
  );
}

/**
 * DateBox: simple date display component
 */
function DateBox({ label, date }: { label: string; date?: string }) {
  return (
    <div style={{ padding: 12, backgroundColor: 'var(--colorNeutralBackground2)', borderRadius: 4 }}>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--colorNeutralForegroundHint)', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ margin: '8px 0 0 0', fontSize: 13, fontWeight: 500 }}>
        {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
      </p>
    </div>
  );
}

/**
 * ChecklistItem: checkmark or circle icon + label
 */
function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 20,
          height: 20,
          borderRadius: '50%',
          backgroundColor: checked ? 'var(--colorSuccessBackground)' : 'transparent',
          color: checked ? 'var(--colorSuccessForeground)' : 'var(--colorNeutralForeground3)',
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        {checked ? '✓' : '○'}
      </span>
      <span style={{ fontSize: 13 }}>{label}</span>
    </div>
  );
}

/**
 * PersonChip: simple person chip component
 */
function PersonChip({ name, role }: { name: string; role: string }) {
  return (
    <div
      style={{
        padding: '8px 12px',
        backgroundColor: 'var(--colorNeutralBackground2)',
        borderRadius: 16,
        fontSize: 12,
      }}
    >
      <p style={{ margin: 0, fontWeight: 500 }}>{name}</p>
      <p style={{ margin: '2px 0 0 0', fontSize: 11, color: 'var(--colorNeutralForegroundHint)' }}>
        {role}
      </p>
    </div>
  );
}
```

### Step 3: PreconReviewCard

#### Create `packages/features/estimating/src/reviewConfig/PreconReviewCard.tsx`

```typescript
import React from 'react';
import { HbcStatusBadge } from '@hbc/ui-kit';
import { ActionItemList } from '@hbc/review-mode';
import type { IActivePreconstruction } from '@hbc/models';

/**
 * PreconReviewCard component.
 *
 * Displays preconstruction record in review mode.
 * Sections: Project info, Stage + Team, Budget summary, Notes, Action items.
 */
export function PreconReviewCard({ precon }: { precon: IActivePreconstruction }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 600 }}>
          {precon.projectName}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--colorNeutralForegroundHint)' }}>
          {precon.projectNumber}
        </p>
      </div>

      {/* Stage + Team */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <HbcStatusBadge
          label={precon.currentStage}
          variant={precon.currentStage === 'Closed' ? 'success' : precon.currentStage === 'OnHold' ? 'warning' : 'neutral'}
        />
        {precon.leadEstimatorName && (
          <div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Lead Estimator</p>
            <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 500 }}>
              {precon.leadEstimatorName}
            </p>
          </div>
        )}
        {precon.projectExecutiveName && (
          <div style={{ marginLeft: 'auto' }}>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Project Executive</p>
            <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 500 }}>
              {precon.projectExecutiveName}
            </p>
          </div>
        )}
      </div>

      <hr style={{ margin: 0, border: '1px solid var(--colorNeutralStroke1)' }} />

      {/* Budget Summary */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
          Budget Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          <BudgetBox
            label="Precon Budget"
            amount={precon.preconBudget}
          />
          <BudgetBox
            label="Design Budget"
            amount={precon.designBudget}
          />
          <BudgetBox
            label="Billed to Date"
            amount={precon.billedToDate}
            percentage={precon.preconBudget ? (precon.billedToDate / precon.preconBudget) * 100 : undefined}
          />
        </div>
      </div>

      {/* Notes */}
      {precon.notes && (
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
            Notes
          </h3>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{precon.notes}</p>
        </div>
      )}

      {/* Action Items */}
      <ActionItemList recordId={precon.id} />
    </div>
  );
}

function BudgetBox({ label, amount, percentage }: { label: string; amount?: number; percentage?: number }) {
  return (
    <div style={{ padding: 16, backgroundColor: 'var(--colorNeutralBackground2)', borderRadius: 4 }}>
      <p style={{ margin: 0, fontSize: 11, color: 'var(--colorNeutralForegroundHint)', textTransform: 'uppercase' }}>
        {label}
      </p>
      <p style={{ margin: '8px 0 0 0', fontSize: 16, fontWeight: 600 }}>
        {amount ? `$${(amount / 1000000).toFixed(2)}M` : '—'}
      </p>
      {percentage !== undefined && (
        <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>
          {Math.round(percentage)}% utilized
        </p>
      )}
    </div>
  );
}
```

### Step 4: EstimateLogReviewCard

#### Create `packages/features/estimating/src/reviewConfig/EstimateLogReviewCard.tsx`

```typescript
import React from 'react';
import { HbcStatusBadge } from '@hbc/ui-kit';
import { ActionItemList } from '@hbc/review-mode';
import type { IEstimateLogEntry } from '@hbc/models';

/**
 * EstimateLogReviewCard component.
 *
 * Displays estimate log entry in review mode.
 * Sections: Project info, Outcome + submitted date, Cost metrics, Lead estimator, Notes, Action items.
 */
export function EstimateLogReviewCard({ entry }: { entry: IEstimateLogEntry }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <h2 style={{ margin: '0 0 8px 0', fontSize: 24, fontWeight: 600 }}>
          {entry.projectName}
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--colorNeutralForegroundHint)' }}>
          {entry.projectNumber}
        </p>
      </div>

      {/* Estimate Type + Submitted + Outcome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <HbcStatusBadge
          label={entry.estimateType}
          variant="neutral"
        />
        <div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Submitted</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 500 }}>
            {entry.submittedDate ? new Date(entry.submittedDate).toLocaleDateString('en-US') : '—'}
          </p>
        </div>
        <HbcStatusBadge
          label={entry.outcome}
          variant={
            entry.outcome === 'AwardedWithPrecon' || entry.outcome === 'AwardedWithoutPrecon'
              ? 'success'
              : entry.outcome === 'NotAwarded'
                ? 'error'
                : 'warning'
          }
        />
      </div>

      <hr style={{ margin: 0, border: '1px solid var(--colorNeutralStroke1)' }} />

      {/* Outcome Details */}
      <div>
        <h3 style={{ margin: '0 0 16px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
          Outcome Details
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Cost Metrics */}
          <div>
            {entry.costPerGSF && (
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Cost / GSF</p>
                <p style={{ margin: '4px 0 0 0', fontSize: 16, fontWeight: 600 }}>
                  ${entry.costPerGSF.toFixed(2)}
                </p>
              </div>
            )}
            {entry.costPerUnit && (
              <div>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Cost / Unit</p>
                <p style={{ margin: '4px 0 0 0', fontSize: 16, fontWeight: 600 }}>
                  ${entry.costPerUnit.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Dollar Outcome */}
          <div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)', textTransform: 'uppercase' }}>
              Amount
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: 18, fontWeight: 600 }}>
              {entry.estimatedAmount
                ? `$${(entry.estimatedAmount / 1000000).toFixed(2)}M`
                : entry.awardedAmount
                  ? `$${(entry.awardedAmount / 1000000).toFixed(2)}M`
                  : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Lead Estimator + Fiscal Year */}
      {entry.leadEstimatorName && (
        <div>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>Lead Estimator</p>
          <p style={{ margin: '4px 0 0 0', fontSize: 14, fontWeight: 500 }}>
            {entry.leadEstimatorName}
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--colorNeutralForegroundHint)' }}>
            FY {entry.fiscalYear}
          </p>
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <div>
          <h3 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
            Notes
          </h3>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{entry.notes}</p>
        </div>
      )}

      {/* Action Items */}
      <ActionItemList recordId={entry.id} />
    </div>
  );
}
```

### Step 5: Barrel Exports

#### Create `packages/features/estimating/src/reviewConfig/index.ts`

```typescript
/**
 * Barrel export for estimating review mode configuration and card components.
 * Internal API (not exported from feature package root).
 */

export { useEstimatingReviewConfig } from './estimatingReviewConfig.js';
export { PursuitReviewCard } from './PursuitReviewCard.js';
export { PreconReviewCard } from './PreconReviewCard.js';
export { EstimateLogReviewCard } from './EstimateLogReviewCard.js';
```

### Step 6: Wire ReviewModeButton into Pages

#### Modify `packages/features/estimating/src/pages/ActivePursuitsPage.tsx`

```typescript
import { ReviewModeButton, ReviewModeProvider } from '@hbc/review-mode';
import { useEstimatingReviewConfig } from '../reviewConfig/index.js';

export function ActivePursuitsPage() {
  const reviewConfig = useEstimatingReviewConfig();

  return (
    <ReviewModeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Page toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Active Pursuits</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Other buttons... */}
            <ReviewModeButton config={reviewConfig} />
          </div>
        </div>

        {/* Page content */}
        {/* ... existing pursuits list ... */}
      </div>
    </ReviewModeProvider>
  );
}
```

#### Modify `packages/features/estimating/src/pages/ActivePreconstructionPage.tsx`

```typescript
import { ReviewModeButton, ReviewModeProvider } from '@hbc/review-mode';
import { useEstimatingReviewConfig } from '../reviewConfig/index.js';

export function ActivePreconstructionPage() {
  const reviewConfig = useEstimatingReviewConfig();

  return (
    <ReviewModeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Preconstruction</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <ReviewModeButton config={reviewConfig} />
          </div>
        </div>
        {/* ... existing precon list ... */}
      </div>
    </ReviewModeProvider>
  );
}
```

#### Modify `packages/features/estimating/src/pages/EstimateLogPage.tsx`

```typescript
import { ReviewModeButton, ReviewModeProvider } from '@hbc/review-mode';
import { useEstimatingReviewConfig } from '../reviewConfig/index.js';

export function EstimateLogPage() {
  const fiscalYear = useParams().year || String(new Date().getFullYear());
  const reviewConfig = useEstimatingReviewConfig(fiscalYear);

  return (
    <ReviewModeProvider>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Estimate Log — FY {fiscalYear}</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <ReviewModeButton config={reviewConfig} />
          </div>
        </div>
        {/* ... existing log list ... */}
      </div>
    </ReviewModeProvider>
  );
}
```

### Step 7: Business Development Stub

#### Create `packages/features/business-development/src/reviewConfig/bdReviewConfig.stub.ts`

Forward reference showing the pattern for future implementation.

```typescript
/**
 * bdReviewConfig.stub.ts
 *
 * STUB — Business Development Review Mode Configuration
 *
 * This stub is a forward reference for the Business Development feature.
 * Implement when PH7-BD (Business Development feature phase) is scheduled.
 *
 * PATTERN to follow: see packages/features/estimating/src/reviewConfig/estimatingReviewConfig.ts
 *
 * Expected sections:
 *   1. Opportunities (prospective leads, initial outreach)
 *   2. Pipeline (qualified opportunities in various stages)
 *
 * Expected filters:
 *   - By stage (discovery, qualification, proposal, negotiation, won, lost)
 *   - By assigned BD rep
 *   - By industry vertical
 *   - By value range
 *
 * Expected card components:
 *   - OpportunityReviewCard: key contacts, probability, pipeline stage, next action date
 *   - PipelineItemReviewCard: proposal status, competition, estimated close date, team
 *
 * Integration points:
 *   - Import useBusinessDevelopmentReviewConfig hook (this file)
 *   - Add ReviewModeButton to OpportunitiesPage and PipelinePage toolbars
 *   - Wrap pages with ReviewModeProvider (or at app level)
 *
 * Data model expectations (to be defined):
 *   - IOpportunity (from @hbc/models/business-development)
 *   - IPipelineItem (from @hbc/models/business-development)
 *   - BD API endpoints for fetching, filtering, updating records
 *   - Persistence hooks for recording lastReviewedAt and updating lead status
 *
 * Implementation checklist (when PH7-BD is active):
 *   [ ] Create data queries (bdQueries.ts) for API integration
 *   [ ] Create OpportunityReviewCard and PipelineItemReviewCard components
 *   [ ] Implement useBusinessDevelopmentReviewConfig hook (follow estimating pattern)
 *   [ ] Add ReviewModeButton + ReviewModeProvider to BD pages
 *   [ ] Create session summary integration for BD review outcomes
 *   [ ] Add ADR in docs/architecture/adr/ documenting the review config pattern
 *
 * References:
 *   - PH7-RM-1: Package foundation
 *   - PH7-RM-2 through PH7-RM-6: Core implementation
 *   - PH7-RM-7: This estimating example
 */

// Placeholder exports (uncomment when implemented):
// export { useBusinessDevelopmentReviewConfig } from './bdReviewConfig.js';
// export { OpportunityReviewCard } from './OpportunityReviewCard.js';
// export { PipelineItemReviewCard } from './PipelineItemReviewCard.js';
```

---

## Verification

### Build and Type Check
```bash
cd packages/features/estimating
pnpm build
pnpm typecheck
```

### Integration Test (example)
```bash
# 1. Open dev-harness with Estimating feature.
# 2. Navigate to "Active Pursuits" page.
# 3. Click "Review Mode" button in toolbar.
# 4. Verify:
#    - ReviewModeShell opens fullscreen overlay.
#    - ReviewModeHeader shows "Estimating Review" title.
#    - Sidebar shows all pursuits (searchable, filterable).
#    - Click a pursuit: PursuitReviewCard renders with key dates, checklist, team, external links.
#    - Click "Edit" button: drawer opens with PursuitForm.
#    - Click "Mark as Reviewed" icon: pursuit is marked, lastReviewedAt persisted to server.
#    - Press "A" key: ActionItemTray slides up.
#    - Create 2 action items: title, assignee, due date, priority.
#    - Verify ActionItemList shows items at bottom of card.
#    - Switch sections (click "Preconstruction" tab): view changes, sidebar updates.
#    - Filter by stage: sidebar list updates.
#    - Click Exit (×) button.
#    - SessionSummaryScreen shows: duration, per-section stats, action items table.
#    - Click "Copy Summary": summary copied to clipboard (manual verification).
#    - Click "Close Review Mode": overlay closes, underlying page visible.
# 5. Repeat for ActivePreconstructionPage and EstimateLogPage.
# 6. Verify cards render correctly per domain (budget vs. cost metrics).
# 7. Verify persistence: reload page, check lastReviewedAt was saved.
```

### Lint and Format
```bash
pnpm lint --fix
pnpm format
```

---

## Definition of Done

- [ ] estimatingReviewConfig.ts hook fully implements IReviewConfig<>.
- [ ] All three review sections (Pursuits, Preconstruction, Log) configured.
- [ ] PursuitReviewCard renders all key fields: dates, checklist, team, links.
- [ ] PreconReviewCard renders budget summary, stage, team, notes.
- [ ] EstimateLogReviewCard renders outcome, cost metrics, lead estimator, fiscal year.
- [ ] All cards display ActionItemList at bottom.
- [ ] Filter options work for all sections (status, lead estimator, outcome, stage).
- [ ] ReviewModeButton wired into three Estimating pages.
- [ ] ReviewModeProvider wraps pages correctly.
- [ ] onMarkReviewed callback persists lastReviewedAt to server.
- [ ] Card edit forms integrate with existing Estimating services (updatePursuit, etc.).
- [ ] Review config successfully consumed by ReviewMode package (no type errors).
- [ ] Build succeeds with no type errors or lint warnings.
- [ ] All components render without console errors in dev-harness.
- [ ] Business Development stub created with clear implementation guidance.
- [ ] Code follows HB Intel style: @hbc/* imports, Fluent UI v9, type safety.

<!-- IMPLEMENTATION PROGRESS & NOTES
Phase PH7-RM-7 completed: YYYY-MM-DD
Files created: 6 (5 config/card files + 1 BD stub)
Review config: complete (Pursuits, Preconstruction, Estimate Log)
Card components: 3 richly detailed displays
Page integration: 3 pages + ReviewModeProvider
Pattern established: ready for reuse (BD, Project Hub, Leadership)
Next: PH7-BD-ReviewMode (Business Development integration)
-->
