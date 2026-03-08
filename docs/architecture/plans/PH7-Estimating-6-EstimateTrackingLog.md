# Phase 7 Development Plan — Estimating Module: Estimate Tracking Log

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Feature:** Estimating > Estimate Tracking Log (read + append-only form, analytics navigation)
**Depends on:** EST-1 (Foundation) · Phase 4 (UI Kit) · Phase 3 (Query/State)
**Blocks:** Phase 8 (Backend Integration)

---

## Summary

The Estimate Tracking Log is a historical record of all estimates submitted to clients, tracked by fiscal year. Unlike Active Pursuits and Preconstruction (which support full CRUD), this log is **append-only by design**—estimates cannot be edited or deleted after submission, maintaining an auditable trail of estimating activity. The page displays a sortable/filterable table with estimate outcomes, awarded values, and cost metrics. A "View Analytics" button navigates to analytics dashboards for win rate analysis and pipeline trending.

---

## Why It Matters

**Architectural Context:**
- The log enforces a append-only pattern: "What gets recorded stays recorded" ensures business integrity and audit compliance.
- This page belongs in `@hbc/features-estimating`, not Project Hub, per the architectural rule.
- Fiscal year filtering allows users to focus on annual cohorts (e.g., "FY 2026 estimates").
- No delete modal; "Edit" updates notes/metadata only, not outcome or cost metrics.
- Demonstrates conditional field visibility based on outcome enum (Pending vs. Awarded vs. NotAwarded).
- Links to analytics module for deeper win rate and pipeline insights.

**Business Context:**
- Estimating leadership reviews annual win rates, cost per GSF trends, and awarded value performance.
- Business Development tracks submitted estimates against leads in the pipeline.
- Finance reconciles awarded estimates against actual project costs.

---

## Files to Create / Modify

1. **EstimateTrackingLogPage.tsx** — main page component with fiscal year filter
2. **EstimateLogForm.tsx** — reusable form (Add / Edit modal, conditional outcome fields)
3. **estimatingQueries.ts** — add estimate log query hooks (if not already present)

---

## Implementation

### Component 1: EstimateTrackingLogPage.tsx

**File path:** `packages/features/estimating/src/EstimateTrackingLogPage.tsx`

**Purpose:** Main page displaying an append-only log of submitted estimates, filtered by fiscal year. No delete. Edit updates notes only.

```typescript
import { FC, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { WorkspacePageShell, HbcDataTable, HbcButton, HbcStatusBadge, HbcSelect, HbcModal } from '@hbc/ui-kit';
import { useAuth } from '@hbc/auth'; // RBAC context
import { IEstimateLogEntry, IEstimateLogEntryFormData } from '@hbc/models';
import {
  fetchEstimateLog,
  updateEstimateLog,
} from './data/estimatingQueries';
import { EstimateLogForm } from './components/EstimateLogForm';
import { formatCurrencyCompact } from './utils/currencyFormatters';

/**
 * EstimateTrackingLogPage
 *
 * Displays a read-only, append-only log of all estimates submitted in a fiscal year.
 * - RBAC: view all, add entries only if `estimating:write`
 * - Fiscal year filter: defaults to current year (2026)
 * - "View Analytics" button navigates to `/log/analytics`
 * - Edit modal updates notes only (outcome and costs are immutable)
 * - No delete: log entries are permanent audit records
 */
const EstimateTrackingLogPage: FC = () => {
  const navigate = useNavigate();
  const { userClaims } = useAuth();
  const queryClient = useQueryClient();

  // RBAC: check for estimating:write permission
  const canWrite = userClaims?.scopes?.includes('estimating:write') ?? false;

  // Fiscal year filter
  const currentYear = new Date().getFullYear();
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentYear);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<IEstimateLogEntry | null>(null);

  // Query: fetch estimate log for selected fiscal year
  const { data: logEntries = [], isLoading, error } = useQuery({
    queryKey: ['estimating', 'log', selectedFiscalYear],
    queryFn: () => fetchEstimateLog(selectedFiscalYear),
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: add new estimate log entry
  const addMutation = useMutation({
    mutationFn: async (data: IEstimateLogEntryFormData) => {
      // Call add query hook; assumes it sets fiscalYear automatically based on submittedDate
      const repo = await import('./data/estimatingQueries').then(
        (m) => m.createEstimateLogEntry
      );
      return repo(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'log', selectedFiscalYear] });
      setIsAddModalOpen(false);
    },
  });

  // Mutation: update estimate log entry (notes only)
  const updateMutation = useMutation({
    mutationFn: updateEstimateLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'log', selectedFiscalYear] });
      setIsEditModalOpen(false);
      setSelectedEntry(null);
    },
  });

  // Handlers
  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleEditClick = (e: React.MouseEvent, entry: IEstimateLogEntry) => {
    e.stopPropagation();
    setSelectedEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleAddSubmit = (formData: IEstimateLogEntryFormData) => {
    addMutation.mutate(formData);
  };

  const handleEditSubmit = (formData: IEstimateLogEntryFormData) => {
    if (selectedEntry) {
      updateMutation.mutate({
        id: selectedEntry.id,
        ...formData,
      });
    }
  };

  // Outcome badge variant mapping
  const getOutcomeVariant = (outcome: string): 'warning' | 'success' | 'error' | 'neutral' => {
    switch (outcome) {
      case 'Pending':
        return 'warning';
      case 'AwardedWithPrecon':
      case 'AwardedWithoutPrecon':
        return 'success';
      case 'NotAwarded':
        return 'error';
      default:
        return 'neutral';
    }
  };

  // Outcome display text
  const getOutcomeText = (outcome: string): string => {
    switch (outcome) {
      case 'AwardedWithPrecon':
        return 'Awarded w/ Precon';
      case 'AwardedWithoutPrecon':
        return 'Awarded w/o Precon';
      case 'NotAwarded':
        return 'Not Awarded';
      default:
        return outcome;
    }
  };

  // Calculate total awarded value (sum of both precon and without precon)
  const getTotalAwardedValue = (entry: IEstimateLogEntry): number => {
    return (entry.amountAwardedWithPrecon ?? 0) + (entry.amountAwardedWithoutPrecon ?? 0);
  };

  // Table column definitions
  const columns = [
    {
      key: 'projectNumber',
      label: 'Project #',
      width: 110,
      sortable: true,
      render: (row: IEstimateLogEntry) => row.projectNumber,
    },
    {
      key: 'projectName',
      label: 'Project Name',
      width: 220,
      sortable: true,
      render: (row: IEstimateLogEntry) => row.projectName,
    },
    {
      key: 'estimateType',
      label: 'Estimate Type',
      width: 170,
      sortable: true,
      render: (row: IEstimateLogEntry) => row.estimateType,
    },
    {
      key: 'submittedDate',
      label: 'Submitted Date',
      width: 110,
      sortable: true,
      render: (row: IEstimateLogEntry) => new Date(row.submittedDate).toLocaleDateString(),
    },
    {
      key: 'outcome',
      label: 'Outcome',
      width: 160,
      sortable: true,
      render: (row: IEstimateLogEntry) => (
        <HbcStatusBadge
          variant={getOutcomeVariant(row.outcome)}
          text={getOutcomeText(row.outcome)}
        />
      ),
    },
    {
      key: 'costPerGsf',
      label: 'Cost/GSF',
      width: 90,
      sortable: true,
      render: (row: IEstimateLogEntry) =>
        row.costPerGsf ? `$${row.costPerGsf.toFixed(2)}` : '—',
    },
    {
      key: 'costPerUnit',
      label: 'Cost/Unit',
      width: 90,
      sortable: true,
      render: (row: IEstimateLogEntry) =>
        row.costPerUnit ? `$${row.costPerUnit.toFixed(2)}` : '—',
    },
    {
      key: 'awardedValue',
      label: 'Awarded Value',
      width: 130,
      sortable: true,
      render: (row: IEstimateLogEntry) => {
        const total = getTotalAwardedValue(row);
        return total > 0 ? formatCurrencyCompact(total) : '—';
      },
    },
    {
      key: 'leadEstimatorName',
      label: 'Lead Estimator',
      width: 150,
      sortable: true,
      render: (row: IEstimateLogEntry) => row.leadEstimatorName,
    },
    {
      key: 'notes',
      label: 'Notes',
      width: 180,
      sortable: false,
      render: (row: IEstimateLogEntry) => (
        <span style={{ color: '#6C757D', fontSize: '12px' }}>
          {row.notes ? row.notes.substring(0, 50) + (row.notes.length > 50 ? '...' : '') : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 60,
      sortable: false,
      render: (row: IEstimateLogEntry) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {canWrite && (
            <HbcButton
              icon="Edit"
              variant="text"
              onClick={(e) => handleEditClick(e, row)}
              title="Edit notes only"
            />
          )}
        </div>
      ),
    },
  ];

  // Fiscal year options (current year + 4 previous years)
  const fiscalYearOptions = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - i;
      return { key: year.toString(), text: `FY ${year}` };
    });
  }, [currentYear]);

  return (
    <WorkspacePageShell
      title="Estimate Tracking Log"
      subtitle="Historical record of all submitted estimates. Edit notes only; outcomes are immutable audit records."
      status={error ? 'error' : isLoading ? 'loading' : 'idle'}
      statusMessage={error ? `Error loading log: ${error.message}` : undefined}
    >
      {/* Toolbar */}
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {/* Left: Fiscal Year Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label htmlFor="fiscalYear" style={{ fontSize: '14px', fontWeight: 500 }}>
            Fiscal Year:
          </label>
          <HbcSelect
            id="fiscalYear"
            options={fiscalYearOptions}
            selectedKey={selectedFiscalYear.toString()}
            onChange={(e, option) => {
              if (option) {
                setSelectedFiscalYear(parseInt(option.key as string, 10));
              }
            }}
            style={{ width: '140px' }}
          />
        </div>

        {/* Right: Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <HbcButton
            variant="outline"
            text="View Analytics"
            icon="ChartLine"
            onClick={() => navigate({ to: '/estimating/log/analytics' })}
          />
          {canWrite && (
            <HbcButton
              variant="primary"
              text="+ Add Entry"
              icon="Add"
              onClick={handleAddClick}
            />
          )}
        </div>
      </div>

      {/* Data Table */}
      <HbcDataTable
        columns={columns}
        data={logEntries}
        isLoading={isLoading}
        striped
        hoverable
      />

      {/* Add Modal */}
      <HbcModal
        isOpen={isAddModalOpen}
        title="Add Estimate Log Entry"
        onClose={() => setIsAddModalOpen(false)}
      >
        <EstimateLogForm
          onSubmit={handleAddSubmit}
          isSubmitting={addMutation.isPending}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </HbcModal>

      {/* Edit Modal (Notes Only) */}
      <HbcModal
        isOpen={isEditModalOpen}
        title={`Edit "${selectedEntry?.projectName}"`}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEntry(null);
        }}
      >
        {selectedEntry && (
          <EstimateLogForm
            initialValues={{
              projectNumber: selectedEntry.projectNumber,
              projectName: selectedEntry.projectName,
              estimateType: selectedEntry.estimateType,
              fiscalYear: selectedEntry.fiscalYear,
              submittedDate: selectedEntry.submittedDate,
              outcome: selectedEntry.outcome,
              costPerGsf: selectedEntry.costPerGsf,
              costPerUnit: selectedEntry.costPerUnit,
              amountPending: selectedEntry.amountPending,
              amountAwardedWithPrecon: selectedEntry.amountAwardedWithPrecon,
              amountAwardedWithoutPrecon: selectedEntry.amountAwardedWithoutPrecon,
              amountNotAwarded: selectedEntry.amountNotAwarded,
              leadEstimatorUpn: selectedEntry.leadEstimatorUpn,
              notes: selectedEntry.notes,
            }}
            onSubmit={handleEditSubmit}
            isSubmitting={updateMutation.isPending}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedEntry(null);
            }}
            isEditMode={true}
          />
        )}
      </HbcModal>
    </WorkspacePageShell>
  );
};

export default EstimateTrackingLogPage;
```

---

### Component 2: EstimateLogForm.tsx

**File path:** `packages/features/estimating/src/components/EstimateLogForm.tsx`

**Purpose:** Form for adding and editing estimate log entries. Shows conditional outcome-value fields based on outcome selection. In edit mode, immutable fields are disabled.

```typescript
import { FC, useState } from 'react';
import {
  HbcTextField,
  HbcSelect,
  HbcPeoplePicker,
  HbcFormSection,
  HbcButton,
} from '@hbc/ui-kit';
import { IEstimateLogEntryFormData, EstimateType, EstimateOutcome } from '@hbc/models';

export interface EstimateLogFormProps {
  initialValues?: Partial<IEstimateLogEntryFormData>;
  onSubmit: (data: IEstimateLogEntryFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  isEditMode?: boolean; // If true, make outcome/cost fields read-only
}

// EstimateType options
const ESTIMATE_TYPE_OPTIONS = [
  { key: 'ConceptualEstimate', text: 'Conceptual Estimate' },
  { key: 'LumpSumProposal', text: 'Lump Sum Proposal' },
  { key: 'GMPEst', text: 'GMP Est' },
  { key: 'ROM', text: 'ROM' },
  { key: 'HardBid', text: 'Hard Bid' },
  { key: 'SDEstimate', text: 'SD Estimate' },
  { key: 'DesignBuild', text: 'Design Build' },
  { key: 'SchematicEstimate', text: 'Schematic Estimate' },
];

// EstimateOutcome options
const OUTCOME_OPTIONS = [
  { key: 'Pending', text: 'Pending' },
  { key: 'AwardedWithPrecon', text: 'Awarded W Precon' },
  { key: 'AwardedWithoutPrecon', text: 'Awarded W/O Precon' },
  { key: 'NotAwarded', text: 'Not Awarded' },
];

// Fiscal year options
const FISCAL_YEAR_OPTIONS = [
  { key: '2026', text: '2026' },
  { key: '2025', text: '2025' },
  { key: '2024', text: '2024' },
  { key: '2023', text: '2023' },
  { key: '2022', text: '2022' },
];

/**
 * EstimateLogForm
 *
 * A form for adding and editing estimate log entries.
 *
 * Validation rules:
 * - projectNumber: required, format ##-###-##
 * - projectName: required
 * - estimateType: required
 * - fiscalYear: required
 * - submittedDate: required
 * - outcome: required
 * - leadEstimatorUpn: required
 * - Currency fields (outcome-dependent): if present, must be >= 0
 *
 * Layout uses HbcFormSection for grouping:
 * - Project Details
 * - Estimate Details
 * - Cost Metrics
 * - Outcome Value (conditional based on outcome)
 * - Lead Estimator
 * - Notes
 *
 * Edit mode: outcome and cost fields are disabled (immutable).
 */
const EstimateLogForm: FC<EstimateLogFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
  isEditMode = false,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<IEstimateLogEntryFormData>>({
    projectNumber: initialValues?.projectNumber ?? '',
    projectName: initialValues?.projectName ?? '',
    estimateType: initialValues?.estimateType ?? '',
    fiscalYear: initialValues?.fiscalYear ?? new Date().getFullYear(),
    submittedDate: initialValues?.submittedDate ?? '',
    outcome: initialValues?.outcome ?? '',
    costPerGsf: initialValues?.costPerGsf,
    costPerUnit: initialValues?.costPerUnit,
    amountPending: initialValues?.amountPending,
    amountAwardedWithPrecon: initialValues?.amountAwardedWithPrecon,
    amountAwardedWithoutPrecon: initialValues?.amountAwardedWithoutPrecon,
    amountNotAwarded: initialValues?.amountNotAwarded,
    leadEstimatorUpn: initialValues?.leadEstimatorUpn ?? '',
    notes: initialValues?.notes ?? '',
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // projectNumber validation
    if (!formData.projectNumber) {
      newErrors.projectNumber = 'Project Number is required';
    } else if (!/^\d{2}-\d{3}-\d{2}$/.test(formData.projectNumber)) {
      newErrors.projectNumber = 'Format must be ##-###-## (e.g., 26-001-01)';
    }

    // projectName validation
    if (!formData.projectName) {
      newErrors.projectName = 'Project Name is required';
    }

    // estimateType validation
    if (!formData.estimateType) {
      newErrors.estimateType = 'Estimate Type is required';
    }

    // fiscalYear validation
    if (!formData.fiscalYear) {
      newErrors.fiscalYear = 'Fiscal Year is required';
    }

    // submittedDate validation
    if (!formData.submittedDate) {
      newErrors.submittedDate = 'Date Submitted is required';
    }

    // outcome validation
    if (!formData.outcome) {
      newErrors.outcome = 'Outcome is required';
    }

    // leadEstimatorUpn validation
    if (!formData.leadEstimatorUpn) {
      newErrors.leadEstimatorUpn = 'Lead Estimator is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        projectNumber: formData.projectNumber as string,
        projectName: formData.projectName as string,
        estimateType: formData.estimateType as string,
        fiscalYear: formData.fiscalYear as number,
        submittedDate: formData.submittedDate as string,
        outcome: formData.outcome as string,
        costPerGsf: formData.costPerGsf,
        costPerUnit: formData.costPerUnit,
        amountPending: formData.amountPending,
        amountAwardedWithPrecon: formData.amountAwardedWithPrecon,
        amountAwardedWithoutPrecon: formData.amountAwardedWithoutPrecon,
        amountNotAwarded: formData.amountNotAwarded,
        leadEstimatorUpn: formData.leadEstimatorUpn as string,
        notes: formData.notes,
      });
    }
  };

  const handleFieldChange = (field: keyof IEstimateLogEntryFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field on change
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Project Details Section */}
      <HbcFormSection title="Project Details">
        <HbcTextField
          label="Project Number"
          placeholder="Format: ##-###-##"
          value={formData.projectNumber as string}
          onChange={(e) => handleFieldChange('projectNumber', e.target.value)}
          required
          error={errors.projectNumber}
          disabled={isSubmitting || isEditMode}
        />
        <HbcTextField
          label="Project Name"
          placeholder="Enter project name"
          value={formData.projectName as string}
          onChange={(e) => handleFieldChange('projectName', e.target.value)}
          required
          error={errors.projectName}
          disabled={isSubmitting || isEditMode}
        />
      </HbcFormSection>

      {/* Estimate Details Section */}
      <HbcFormSection title="Estimate Details">
        <HbcSelect
          label="Estimate Type"
          options={ESTIMATE_TYPE_OPTIONS}
          selectedKey={formData.estimateType}
          onChange={(e, option) =>
            handleFieldChange('estimateType', option?.key ?? '')
          }
          required
          error={errors.estimateType}
          disabled={isSubmitting || isEditMode}
        />
        <HbcSelect
          label="Fiscal Year"
          options={FISCAL_YEAR_OPTIONS}
          selectedKey={formData.fiscalYear?.toString()}
          onChange={(e, option) =>
            handleFieldChange('fiscalYear', option?.key ? parseInt(option.key as string, 10) : '')
          }
          required
          error={errors.fiscalYear}
          disabled={isSubmitting || isEditMode}
        />
        <HbcTextField
          label="Date Submitted"
          type="date"
          value={formData.submittedDate as string}
          onChange={(e) => handleFieldChange('submittedDate', e.target.value)}
          required
          error={errors.submittedDate}
          disabled={isSubmitting || isEditMode}
        />
        <HbcSelect
          label="Outcome"
          options={OUTCOME_OPTIONS}
          selectedKey={formData.outcome}
          onChange={(e, option) =>
            handleFieldChange('outcome', option?.key ?? '')
          }
          required
          error={errors.outcome}
          disabled={isSubmitting || isEditMode}
        />
      </HbcFormSection>

      {/* Cost Metrics Section */}
      <HbcFormSection title="Cost Metrics">
        <HbcTextField
          label="Cost per GSF ($)"
          type="number"
          step="0.01"
          value={formData.costPerGsf?.toString() ?? ''}
          onChange={(e) =>
            handleFieldChange('costPerGsf', e.target.value ? parseFloat(e.target.value) : undefined)
          }
          min="0"
          disabled={isSubmitting || isEditMode}
        />
        <HbcTextField
          label="Cost per Unit ($)"
          type="number"
          step="0.01"
          value={formData.costPerUnit?.toString() ?? ''}
          onChange={(e) =>
            handleFieldChange('costPerUnit', e.target.value ? parseFloat(e.target.value) : undefined)
          }
          min="0"
          disabled={isSubmitting || isEditMode}
        />
      </HbcFormSection>

      {/* Outcome Value Section (Conditional) */}
      <HbcFormSection title="Outcome Value">
        {formData.outcome === 'Pending' && (
          <HbcTextField
            label="Pending Amount ($)"
            type="number"
            value={formData.amountPending?.toString() ?? ''}
            onChange={(e) =>
              handleFieldChange('amountPending', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            min="0"
            disabled={isSubmitting || isEditMode}
          />
        )}
        {formData.outcome === 'AwardedWithPrecon' && (
          <HbcTextField
            label="Awarded Value with Precon ($)"
            type="number"
            value={formData.amountAwardedWithPrecon?.toString() ?? ''}
            onChange={(e) =>
              handleFieldChange('amountAwardedWithPrecon', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            min="0"
            disabled={isSubmitting || isEditMode}
          />
        )}
        {formData.outcome === 'AwardedWithoutPrecon' && (
          <HbcTextField
            label="Awarded Value without Precon ($)"
            type="number"
            value={formData.amountAwardedWithoutPrecon?.toString() ?? ''}
            onChange={(e) =>
              handleFieldChange('amountAwardedWithoutPrecon', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            min="0"
            disabled={isSubmitting || isEditMode}
          />
        )}
        {formData.outcome === 'NotAwarded' && (
          <HbcTextField
            label="Not Awarded Amount ($)"
            type="number"
            value={formData.amountNotAwarded?.toString() ?? ''}
            onChange={(e) =>
              handleFieldChange('amountNotAwarded', e.target.value ? parseFloat(e.target.value) : undefined)
            }
            min="0"
            disabled={isSubmitting || isEditMode}
          />
        )}
        {!formData.outcome && (
          <p style={{ color: '#6C757D', fontSize: '12px' }}>
            Select an outcome to display the corresponding value field.
          </p>
        )}
      </HbcFormSection>

      {/* Lead Estimator Section */}
      <HbcFormSection title="Lead Estimator">
        <HbcPeoplePicker
          label="Lead Estimator"
          selectedPeople={
            formData.leadEstimatorUpn
              ? [{ upn: formData.leadEstimatorUpn as string }]
              : []
          }
          onChange={(people) =>
            handleFieldChange('leadEstimatorUpn', people[0]?.upn ?? '')
          }
          multiSelect={false}
          required
          error={errors.leadEstimatorUpn}
          disabled={isSubmitting || isEditMode}
        />
      </HbcFormSection>

      {/* Notes Section */}
      <HbcFormSection title="Notes">
        <HbcTextField
          label="Notes"
          multiline
          rows={3}
          placeholder="Add any relevant notes about this estimate..."
          value={formData.notes as string}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          disabled={isSubmitting}
        />
      </HbcFormSection>

      {/* Edit Mode Notice */}
      {isEditMode && (
        <div style={{ padding: '12px', backgroundColor: '#F0F2F5', borderRadius: '4px' }}>
          <p style={{ fontSize: '12px', color: '#6C757D', margin: 0 }}>
            ℹ In edit mode, you can only update the Notes field. All other fields are immutable audit records.
          </p>
        </div>
      )}

      {/* Footer Buttons */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <HbcButton
          text="Cancel"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        />
        <HbcButton
          text="Submit"
          variant="primary"
          type="submit"
          disabled={isSubmitting}
        />
      </div>
    </form>
  );
};

export default EstimateLogForm;
```

---

### Data Access Layer: estimatingQueries.ts (Estimate Log additions)

**File path:** `packages/features/estimating/src/data/estimatingQueries.ts`

**Note:** Add these estimate log query hooks to the existing estimatingQueries.ts file.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IEstimateLogEntry, IEstimateLogEntryFormData } from '@hbc/models';
import { hbcDataAccessProvider } from '@hbc/data-access';

/**
 * Fetch estimate log for a given fiscal year
 */
export async function fetchEstimateLog(fiscalYear: number): Promise<IEstimateLogEntry[]> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  const result = await repo.getEstimateLog(fiscalYear);
  return result.items;
}

/**
 * Create a new estimate log entry (append only)
 */
export async function createEstimateLogEntry(data: IEstimateLogEntryFormData): Promise<IEstimateLogEntry> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  return repo.createEstimateLogEntry(data);
}

/**
 * Update an estimate log entry (notes only in production usage)
 * Outcome and cost fields should remain immutable after creation.
 */
export async function updateEstimateLog(data: IEstimateLogEntry): Promise<IEstimateLogEntry> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  return repo.updateEstimateLogEntry(data);
}

/**
 * useEstimateLogQuery hook
 * Convenience hook for fetching log entries for a fiscal year
 */
export function useEstimateLogQuery(fiscalYear: number) {
  return useQuery({
    queryKey: ['estimating', 'log', fiscalYear],
    queryFn: () => fetchEstimateLog(fiscalYear),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useCreateEstimateLogEntryMutation hook
 */
export function useCreateEstimateLogEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEstimateLogEntry,
    onSuccess: (data) => {
      // Invalidate the fiscal year that the new entry was added to
      queryClient.invalidateQueries({
        queryKey: ['estimating', 'log', data.fiscalYear],
      });
    },
  });
}

/**
 * useUpdateEstimateLogEntryMutation hook
 */
export function useUpdateEstimateLogEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEstimateLog,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ['estimating', 'log', data.fiscalYear],
      });
    },
  });
}
```

---

## Verification

### Build & Type Check

```bash
# Verify TypeScript compilation
pnpm turbo run typecheck --filter=@hbc/features-estimating

# Full build
pnpm turbo run build --filter=@hbc/features-estimating
```

### Unit Tests (if applicable)

```bash
# Run test suite for the estimating feature
pnpm --filter=@hbc/features-estimating vitest run
```

### Manual Testing Checklist

- [ ] Page loads with estimate log table for current fiscal year
- [ ] Fiscal year selector changes table data correctly
- [ ] "View Analytics" button navigates to `/estimating/log/analytics`
- [ ] "Add Entry" button opens modal (only visible if `estimating:write` permission)
- [ ] Form validates project number format (##-###-##)
- [ ] Form requires Estimate Type, Fiscal Year, Date Submitted, Outcome, Lead Estimator
- [ ] Add submit creates new row and closes modal
- [ ] Edit button opens modal with pre-filled values (in edit mode)
- [ ] Edit mode: outcome and cost fields are disabled/read-only
- [ ] Edit mode: notes field is editable
- [ ] Edit submit updates notes field only
- [ ] Outcome badge shows correct color (Pending=warning, Awarded=success, NotAwarded=error)
- [ ] Awarded value displays correctly (sum of precon + without precon if applicable)
- [ ] Cost/GSF and Cost/Unit display with 2 decimals
- [ ] Conditional outcome-value field appears based on outcome selection (Pending, Awarded variants, NotAwarded)
- [ ] Table is sortable and filterable
- [ ] No delete button (append-only audit trail)
- [ ] RBAC: non-write users see "Add Entry" and edit buttons disabled or hidden
- [ ] Edit mode notice displays when in edit mode

---

## Definition of Done

- [ ] All components created (EstimateTrackingLogPage, EstimateLogForm)
- [ ] Data access functions implemented and integrated with TanStack Query
- [ ] TypeScript: no type errors (`pnpm turbo run typecheck` passes)
- [ ] RBAC enforcement: `estimating:write` checks in place
- [ ] Form validation: projectNumber format, required fields
- [ ] Fiscal year filtering: correctly fetches and displays log for selected year
- [ ] Edit mode: outcome/cost fields disabled, notes field editable
- [ ] Conditional outcome-value fields: show/hide based on outcome selection
- [ ] Outcome badge: color variant matches outcome (Pending=warning, Awarded=success, etc.)
- [ ] Currency display: formatted with compact notation ($1.2M) for awarded values
- [ ] Cost metrics: GSF and Unit displayed with 2 decimals
- [ ] Analytics navigation: "View Analytics" button navigates correctly
- [ ] Append-only design: no delete modal or delete button visible
- [ ] Modal flows: Add and Edit work end-to-end
- [ ] All components pass linting and build checks
- [ ] Ready for integration with Phase 7 backend and API layer

---

## Architectural Notes

### Append-Only Log Pattern

The Estimate Tracking Log enforces an **immutable audit trail** design:

1. **Create-Only (Initial Add):** New entries are added via the "Add Entry" modal.
2. **Update-Only Metadata (Edit):** Only the `notes` field may be edited after creation. Outcome, cost metrics, and fiscal year are locked.
3. **No Delete:** Log entries are permanent records. If a mistake occurs, a corrective note is added; the original entry remains.
4. **Query Key Isolation:** Each fiscal year has its own query key (`['estimating', 'log', fiscalYear]`), ensuring efficient caching and updates.

### Integration with Analytics

The "View Analytics" button navigates to `/estimating/log/analytics`, a future module for:
- Win rate analysis (awarded vs. submitted)
- Cost per GSF trending
- Awarded value by estimate type
- Pipeline by stage

This segregation allows analysts to review aggregate data without exposing individual estimates.

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Status: Ready for developer implementation
Date: 2026-03-08
Phase: 7 (Estimating)
Next: Phase 8 (Backend Integration & API)
-->
