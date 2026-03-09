# Phase 7 Development Plan — Estimating Module: Active Preconstruction CRUD

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Feature:** Estimating > Active Preconstruction (CRUD table for preconstruction projects)
**Depends on:** EST-1 (Foundation) · Phase 4 (UI Kit) · Phase 3 (Query/State)
**Blocks:** PH7-Estimating-6-EstimateTrackingLog

---

## Summary

The Active Preconstruction page is a CRUD interface for tracking preconstruction and early design phase projects. It displays a sortable/filterable data table with budget tracking, current stage, and team assignments. Unlike the Pursuits page, preconstruction projects do not navigate on row click—they are view/edit only. This table lives in the Estimating workspace per the architectural rule: "multi-project tracking tables never live in Project Hub."

---

## Why It Matters

**Architectural Context:**
- Preconstruction tracking is distinct from active bid pursuits—it tracks projects already in pre-design or design phases, not active competitions.
- This page belongs in `@hbc/features-estimating` (not Project Hub) to keep all multi-project estimating views in one workspace.
- Uses budget formatting helpers (`$1.2M`, `$450K`) for cleaner display.
- No external platform links (unlike Pursuits).
- No row click navigation—users interact exclusively through modal forms.
- Demonstrates conditional currency field rendering and financial data handling.

**Business Context:**
- Estimators track preconstruction budgets (precon contract budget) vs. earned value (billed to date).
- Project executives monitor design budgets and stage progression.
- Leadership reviews total preconstruction pipeline exposure across the firm.

---

## Files to Create / Modify

1. **ActivePreconstructionPage.tsx** — main page component
2. **PreconForm.tsx** — reusable form (Add / Edit modal)
3. **estimatingQueries.ts** — add preconstruction query hooks (if not already present)
4. **currencyFormatters.ts** — shared currency formatting utilities

---

## Implementation

### Utility: Currency Formatters

**File path:** `packages/features/estimating/src/utils/currencyFormatters.ts`

**Purpose:** Consistent currency formatting across the Estimating module.

```typescript
/**
 * Format a currency value into a compact, readable string.
 *
 * Examples:
 * - 1200000 → "$1.2M"
 * - 450000 → "$450K"
 * - 0 → "$0"
 * - 15999 → "$16K"
 *
 * @param value - numeric value in dollars
 * @returns formatted string
 */
export function formatCurrencyCompact(value: number | null | undefined): string {
  if (!value || value === 0) return '$0';

  if (Math.abs(value) >= 1_000_000) {
    const millions = value / 1_000_000;
    // Show 1 decimal place for millions unless it's a whole number
    return millions % 1 === 0 ? `$${millions.toFixed(0)}M` : `$${millions.toFixed(1)}M`;
  }

  if (Math.abs(value) >= 1_000) {
    const thousands = value / 1_000;
    // Show 1 decimal place for thousands unless it's a whole number
    return thousands % 1 === 0 ? `$${thousands.toFixed(0)}K` : `$${thousands.toFixed(1)}K`;
  }

  return `$${value.toLocaleString()}`;
}

/**
 * Format a currency value with 2 decimal places.
 *
 * Examples:
 * - 123.4 → "$123.40"
 * - 1000 → "$1,000.00"
 *
 * @param value - numeric value in dollars
 * @returns formatted string with 2 decimals
 */
export function formatCurrencyDecimal(value: number | null | undefined): string {
  if (!value && value !== 0) return '$0.00';
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
```

---

### Component 1: ActivePreconstructionPage.tsx

**File path:** `packages/features/estimating/src/ActivePreconstructionPage.tsx`

**Purpose:** Main page displaying CRUD table of active preconstruction projects. No row click navigation.

```typescript
import { FC, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkspacePageShell, HbcDataTable, HbcButton, HbcStatusBadge, HbcModal, HbcConfirmDialog } from '@hbc/ui-kit';
import { useAuth } from '@hbc/auth'; // RBAC context
import { IActivePreconstruction, IActivePreconstructionFormData } from '@hbc/models';
import {
  fetchActivePreconstruction,
  createPreconstruction,
  updatePreconstruction,
  deletePreconstruction,
} from './data/estimatingQueries';
import { PreconForm } from './components/PreconForm';
import { formatCurrencyCompact } from './utils/currencyFormatters';

/**
 * ActivePreconstructionPage
 *
 * Displays a CRUD table of active preconstruction and early design phase projects.
 * - RBAC: view all, create/edit/delete only if `estimating:write`
 * - No row click navigation (unlike Pursuits)
 * - Budget tracking: precon budget vs. billed to date
 * - Stage progression: Schematic → DD → 50% CD → GMP → Closed/On Hold
 */
const ActivePreconstructionPage: FC = () => {
  const { userClaims } = useAuth();
  const queryClient = useQueryClient();

  // RBAC: check for estimating:write permission
  const canWrite = userClaims?.scopes?.includes('estimating:write') ?? false;

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IActivePreconstruction | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<IActivePreconstruction | null>(null);

  // Query: fetch all active preconstruction projects
  const { data: preconstructions = [], isLoading, error } = useQuery({
    queryKey: ['estimating', 'preconstruction'],
    queryFn: fetchActivePreconstruction,
    staleTime: 5 * 60 * 1000,
  });

  // Mutation: create new preconstruction project
  const createMutation = useMutation({
    mutationFn: createPreconstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] });
      setIsAddModalOpen(false);
    },
  });

  // Mutation: update preconstruction project
  const updateMutation = useMutation({
    mutationFn: updatePreconstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] });
      setIsEditModalOpen(false);
      setSelectedItem(null);
    },
  });

  // Mutation: delete preconstruction project
  const deleteMutation = useMutation({
    mutationFn: deletePreconstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] });
      setDeleteConfirmOpen(false);
      setItemToDelete(null);
    },
  });

  // Handlers
  const handleAddClick = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleEditClick = useCallback(
    (e: React.MouseEvent, item: IActivePreconstruction) => {
      e.stopPropagation();
      setSelectedItem(item);
      setIsEditModalOpen(true);
    },
    []
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, item: IActivePreconstruction) => {
      e.stopPropagation();
      setItemToDelete(item);
      setDeleteConfirmOpen(true);
    },
    []
  );

  const handleAddSubmit = useCallback(
    (formData: IActivePreconstructionFormData) => {
      createMutation.mutate(formData);
    },
    [createMutation]
  );

  const handleEditSubmit = useCallback(
    (formData: IActivePreconstructionFormData) => {
      if (selectedItem) {
        updateMutation.mutate({
          id: selectedItem.id,
          ...formData,
        });
      }
    },
    [selectedItem, updateMutation]
  );

  const handleConfirmDelete = useCallback(() => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  }, [itemToDelete, deleteMutation]);

  // Stage badge variant mapping
  const getStageVariant = (stage: string): 'success' | 'warning' | 'neutral' => {
    switch (stage) {
      case 'Closed':
        return 'success';
      case 'OnHold':
      case 'GMP':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  // Table column definitions
  const columns = [
    {
      key: 'projectNumber',
      label: 'Project #',
      width: 110,
      sortable: true,
      render: (row: IActivePreconstruction) => row.projectNumber,
    },
    {
      key: 'projectName',
      label: 'Project Name',
      width: 240,
      sortable: true,
      render: (row: IActivePreconstruction) => row.projectName,
    },
    {
      key: 'currentStage',
      label: 'Current Stage',
      width: 130,
      sortable: true,
      render: (row: IActivePreconstruction) => (
        <HbcStatusBadge
          variant={getStageVariant(row.currentStage)}
          text={row.currentStage}
        />
      ),
    },
    {
      key: 'preconBudget',
      label: 'Precon Budget',
      width: 130,
      sortable: true,
      render: (row: IActivePreconstruction) => formatCurrencyCompact(row.preconBudget),
    },
    {
      key: 'designBudget',
      label: 'Design Budget',
      width: 130,
      sortable: true,
      render: (row: IActivePreconstruction) => formatCurrencyCompact(row.designBudget),
    },
    {
      key: 'billedToDate',
      label: 'Billed to Date',
      width: 130,
      sortable: true,
      render: (row: IActivePreconstruction) => formatCurrencyCompact(row.billedToDate),
    },
    {
      key: 'leadEstimatorName',
      label: 'Lead Estimator',
      width: 150,
      sortable: true,
      render: (row: IActivePreconstruction) => row.leadEstimatorName,
    },
    {
      key: 'projectExecutiveName',
      label: 'PX',
      width: 140,
      sortable: true,
      render: (row: IActivePreconstruction) => row.projectExecutiveName || '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 100,
      sortable: false,
      render: (row: IActivePreconstruction) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {canWrite && (
            <>
              <HbcButton
                icon="Edit"
                variant="text"
                onClick={(e) => handleEditClick(e, row)}
                title="Edit preconstruction project"
              />
              <HbcButton
                icon="Delete"
                variant="text"
                onClick={(e) => handleDeleteClick(e, row)}
                title="Delete preconstruction project"
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <WorkspacePageShell
      title="Active Preconstruction"
      subtitle="Track early design phase and preconstruction projects. Edit to update budget and stage information."
      status={error ? 'error' : isLoading ? 'loading' : 'idle'}
      statusMessage={error ? `Error loading preconstruction data: ${error.message}` : undefined}
    >
      {/* Toolbar */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        {canWrite && (
          <HbcButton
            variant="primary"
            text="+ Add Project"
            onClick={handleAddClick}
            icon="Add"
          />
        )}
      </div>

      {/* Data Table */}
      <HbcDataTable
        columns={columns}
        data={preconstructions}
        isLoading={isLoading}
        striped
        hoverable
      />

      {/* Add Modal */}
      <HbcModal
        isOpen={isAddModalOpen}
        title="Add Preconstruction Project"
        onClose={() => setIsAddModalOpen(false)}
      >
        <PreconForm
          onSubmit={handleAddSubmit}
          isSubmitting={createMutation.isPending}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </HbcModal>

      {/* Edit Modal */}
      <HbcModal
        isOpen={isEditModalOpen}
        title={`Edit "${selectedItem?.projectName}"`}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
      >
        {selectedItem && (
          <PreconForm
            initialValues={{
              projectNumber: selectedItem.projectNumber,
              projectName: selectedItem.projectName,
              currentStage: selectedItem.currentStage,
              preconBudget: selectedItem.preconBudget,
              designBudget: selectedItem.designBudget,
              billedToDate: selectedItem.billedToDate,
              leadEstimatorUpn: selectedItem.leadEstimatorUpn,
              projectExecutiveUpn: selectedItem.projectExecutiveUpn,
              notes: selectedItem.notes,
            }}
            onSubmit={handleEditSubmit}
            isSubmitting={updateMutation.isPending}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedItem(null);
            }}
          />
        )}
      </HbcModal>

      {/* Delete Confirmation Dialog */}
      <HbcConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Preconstruction Project"
        message={`Remove "${itemToDelete?.projectName}" from Active Preconstruction?`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        isLoading={deleteMutation.isPending}
      />
    </WorkspacePageShell>
  );
};

export default ActivePreconstructionPage;
```

---

### Component 2: PreconForm.tsx

**File path:** `packages/features/estimating/src/components/PreconForm.tsx`

**Purpose:** Reusable form for adding and editing preconstruction projects. Includes conditional validation for budget fields.

```typescript
import { FC, useState } from 'react';
import {
  HbcTextField,
  HbcSelect,
  HbcPeoplePicker,
  HbcFormSection,
  HbcButton,
} from '@hbc/ui-kit';
import { IActivePreconstructionFormData, PreconStage } from '@hbc/models';

export interface PreconFormProps {
  initialValues?: Partial<IActivePreconstructionFormData>;
  onSubmit: (data: IActivePreconstructionFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

// Stage options derived from PreconStage enum
const STAGE_OPTIONS = [
  { key: 'Schematic', text: 'Schematic' },
  { key: 'DD', text: 'DD (Design Development)' },
  { key: '50% CD', text: '50% CD' },
  { key: 'GMP', text: 'GMP' },
  { key: 'Closed', text: 'Closed' },
  { key: 'On Hold', text: 'On Hold' },
];

/**
 * PreconForm
 *
 * A reusable form for creating and editing preconstruction projects.
 *
 * Validation rules:
 * - projectNumber: required, format ##-###-##
 * - projectName: required
 * - currentStage: required
 * - leadEstimatorUpn: required
 * - billedToDate: if present, warn (not error) if exceeds preconBudget
 *
 * Layout uses HbcFormSection for grouping:
 * - Project Details
 * - Budget
 * - Team
 * - Notes
 */
const PreconForm: FC<PreconFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<IActivePreconstructionFormData>>({
    projectNumber: initialValues?.projectNumber ?? '',
    projectName: initialValues?.projectName ?? '',
    currentStage: initialValues?.currentStage ?? '',
    preconBudget: initialValues?.preconBudget ?? undefined,
    designBudget: initialValues?.designBudget ?? undefined,
    billedToDate: initialValues?.billedToDate ?? undefined,
    leadEstimatorUpn: initialValues?.leadEstimatorUpn ?? '',
    projectExecutiveUpn: initialValues?.projectExecutiveUpn ?? '',
    notes: initialValues?.notes ?? '',
  });

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validation warnings (non-blocking)
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    const newWarnings: Record<string, string> = {};

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

    // currentStage validation
    if (!formData.currentStage) {
      newErrors.currentStage = 'Current Stage is required';
    }

    // leadEstimatorUpn validation
    if (!formData.leadEstimatorUpn) {
      newErrors.leadEstimatorUpn = 'Lead Estimator is required';
    }

    // Budget validation (warning only if billedToDate > preconBudget)
    if (
      formData.preconBudget &&
      formData.billedToDate &&
      formData.billedToDate > formData.preconBudget
    ) {
      newWarnings.billedToDate = `Billed to Date (${formData.billedToDate}) exceeds Precon Budget (${formData.preconBudget})`;
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        projectNumber: formData.projectNumber as string,
        projectName: formData.projectName as string,
        currentStage: formData.currentStage as string,
        preconBudget: formData.preconBudget,
        designBudget: formData.designBudget,
        billedToDate: formData.billedToDate,
        leadEstimatorUpn: formData.leadEstimatorUpn as string,
        projectExecutiveUpn: formData.projectExecutiveUpn,
        notes: formData.notes,
      });
    }
  };

  const handleFieldChange = (field: keyof IActivePreconstructionFormData, value: any) => {
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
          disabled={isSubmitting}
        />
        <HbcTextField
          label="Project Name"
          placeholder="Enter project name"
          value={formData.projectName as string}
          onChange={(e) => handleFieldChange('projectName', e.target.value)}
          required
          error={errors.projectName}
          disabled={isSubmitting}
        />
        <HbcSelect
          label="Current Stage"
          options={STAGE_OPTIONS}
          selectedKey={formData.currentStage}
          onChange={(e, option) =>
            handleFieldChange('currentStage', option?.key ?? '')
          }
          required
          error={errors.currentStage}
          disabled={isSubmitting}
        />
      </HbcFormSection>

      {/* Budget Section */}
      <HbcFormSection title="Budget">
        <HbcTextField
          label="Precon Contract Budget ($)"
          type="number"
          value={formData.preconBudget?.toString() ?? ''}
          onChange={(e) =>
            handleFieldChange('preconBudget', e.target.value ? parseFloat(e.target.value) : undefined)
          }
          min="0"
          disabled={isSubmitting}
        />
        <HbcTextField
          label="Design Budget ($)"
          type="number"
          value={formData.designBudget?.toString() ?? ''}
          onChange={(e) =>
            handleFieldChange('designBudget', e.target.value ? parseFloat(e.target.value) : undefined)
          }
          min="0"
          disabled={isSubmitting}
        />
        <HbcTextField
          label="Billed to Date ($)"
          type="number"
          value={formData.billedToDate?.toString() ?? ''}
          onChange={(e) =>
            handleFieldChange('billedToDate', e.target.value ? parseFloat(e.target.value) : undefined)
          }
          min="0"
          error={errors.billedToDate}
          disabled={isSubmitting}
        />
        {warnings.billedToDate && (
          <p style={{ color: '#FFB020', fontSize: '12px', margin: '4px 0 0 0' }}>
            ⚠ {warnings.billedToDate}
          </p>
        )}
      </HbcFormSection>

      {/* Team Section */}
      <HbcFormSection title="Team">
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
          disabled={isSubmitting}
        />
        <HbcPeoplePicker
          label="Project Executive"
          selectedPeople={
            formData.projectExecutiveUpn
              ? [{ upn: formData.projectExecutiveUpn as string }]
              : []
          }
          onChange={(people) =>
            handleFieldChange('projectExecutiveUpn', people[0]?.upn ?? '')
          }
          multiSelect={false}
          disabled={isSubmitting}
        />
      </HbcFormSection>

      {/* Notes Section */}
      <HbcFormSection title="Notes">
        <HbcTextField
          label="Notes"
          multiline
          rows={3}
          placeholder="Add any relevant notes about this preconstruction project..."
          value={formData.notes as string}
          onChange={(e) => handleFieldChange('notes', e.target.value)}
          disabled={isSubmitting}
        />
      </HbcFormSection>

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

export default PreconForm;
```

---

### Data Access Layer: estimatingQueries.ts (Preconstruction additions)

**File path:** `packages/features/estimating/src/data/estimatingQueries.ts`

**Note:** Add these preconstruction query hooks to the existing estimatingQueries.ts file created in PH7-Estimating-4.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IActivePreconstruction, IActivePreconstructionFormData } from '@hbc/models';
import { hbcDataAccessProvider } from '@hbc/data-access';

/**
 * Fetch all active preconstruction projects
 */
export async function fetchActivePreconstruction(): Promise<IActivePreconstruction[]> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  const result = await repo.getActivePreconstruction();
  return result.items;
}

/**
 * Create a new preconstruction project
 */
export async function createPreconstruction(data: IActivePreconstructionFormData): Promise<IActivePreconstruction> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  return repo.createPreconstruction(data);
}

/**
 * Update an existing preconstruction project
 */
export async function updatePreconstruction(data: IActivePreconstruction): Promise<IActivePreconstruction> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  return repo.updatePreconstruction(data);
}

/**
 * Delete a preconstruction project by ID
 */
export async function deletePreconstruction(id: string): Promise<void> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  return repo.deletePreconstruction(id);
}

/**
 * useActivePreconstruction hook
 * Convenience hook for fetching all active preconstruction projects
 */
export function useActivePreconstructionQuery() {
  return useQuery({
    queryKey: ['estimating', 'preconstruction'],
    queryFn: fetchActivePreconstruction,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useCreatePreconstructionMutation hook
 */
export function useCreatePreconstructionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPreconstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] });
    },
  });
}

/**
 * useUpdatePreconstructionMutation hook
 */
export function useUpdatePreconstructionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePreconstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] });
    },
  });
}

/**
 * useDeletePreconstructionMutation hook
 */
export function useDeletePreconstructionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePreconstruction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'preconstruction'] });
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

- [ ] Page loads with data table of active preconstruction projects
- [ ] "Add Project" button opens modal (only visible if `estimating:write` permission)
- [ ] Form validates project number format (##-###-##)
- [ ] Form requires Current Stage selection
- [ ] Form requires Lead Estimator selection
- [ ] Add submit creates new row and closes modal
- [ ] Edit button opens modal with pre-filled values
- [ ] Edit submit updates row
- [ ] Delete button opens confirmation dialog
- [ ] Delete confirmation removes row
- [ ] Currency formatting displays correctly (e.g., $1.2M, $450K)
- [ ] Table is sortable and filterable
- [ ] Budget warning displays when Billed to Date > Precon Budget (non-blocking)
- [ ] RBAC: non-write users see edit/delete buttons disabled or hidden
- [ ] Row click does NOT navigate (unlike Pursuits page)
- [ ] No external platform links visible

---

## Definition of Done

- [ ] All components created (ActivePreconstructionPage, PreconForm)
- [ ] Currency formatter utilities implemented and tested
- [ ] Data access functions implemented and integrated with TanStack Query
- [ ] TypeScript: no type errors (`pnpm turbo run typecheck` passes)
- [ ] RBAC enforcement: `estimating:write` checks in place
- [ ] Form validation: projectNumber format, required fields, budget warnings
- [ ] Modal flows: Add, Edit, Delete work end-to-end
- [ ] No row click navigation (unlike Pursuits)
- [ ] Budget display: formatted with compact currency (e.g., $1.2M)
- [ ] Stage badge: color variant matches project stage (Closed=success, OnHold/GMP=warning, others=neutral)
- [ ] Team display: Lead Estimator and Project Executive shown in table
- [ ] Notes field: optional, max 1000 chars, renders in textarea
- [ ] All components pass linting and build checks
- [ ] Ready for integration with Phase 7 backend and API layer

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Status: Ready for developer implementation
Date: 2026-03-08
Phase: 7 (Estimating)
Next: PH7-Estimating-6-EstimateTrackingLog.md
-->
