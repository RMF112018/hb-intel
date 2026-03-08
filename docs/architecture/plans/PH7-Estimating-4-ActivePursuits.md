# Phase 7 Development Plan — Estimating Module: Active Pursuits CRUD

**Version:** 1.0
**Governed by:** CLAUDE.md v1.2 · HB-Intel-Blueprint-V4.md
**Date:** 2026-03-08
**Feature:** Estimating > Active Pursuits (CRUD table for active bids)
**Depends on:** EST-1 (Foundation) · Phase 4 (UI Kit) · Phase 3 (Query/State)
**Blocks:** PH7-Estimating-5-ActivePreconstruction, PH7-Estimating-6-EstimateTrackingLog

---

## Summary

The Active Pursuits page is a full CRUD interface for managing active construction bids in-flight. It displays a sortable/filterable data table with project details, key dates, team assignments, and external platform links. Users with `estimating:write` permission can add, edit, and delete pursuits; others may only view. Row clicks navigate to the Project Hub kickoff checklist.

---

## Why It Matters

**Architectural Context:**
- This page belongs in the `@hbc/features-estimating` package (not Project Hub) per the rule: "multi-project tracking tables live in Estimating, not Project Hub."
- Uses TanStack Query for CRUD operations and caching.
- Uses `@hbc/ui-kit` components for consistency.
- Supports dual external platforms (Building Connected, Procore) with safe click handling.
- Demonstrates form validation patterns, conditional rendering (RBAC), and modal flows that replicate across the Estimating module.

**Business Context:**
- Estimators need a centralized view of all active bids to track deadlines and team allocation.
- Executive sponsors use this table to see overall pipeline health and win strategy progress.
- The checklist badge (7/9 items complete) provides at-a-glance status before drilling into Project Hub.

---

## Files to Create / Modify

1. **ActivePursuitsPage.tsx** — main page component
2. **PursuitForm.tsx** — reusable form (Add / Edit modal)
3. **PursuitChecklistInline.tsx** — checklist badge component (delegated to Project Hub for detail)
4. **ExternalPlatformLinks.tsx** — BC / Procore button pair
5. **estimatingQueries.ts** — add query hooks (if not already present)

---

## Implementation

### Component 1: ActivePursuitsPage.tsx

**File path:** `packages/features/estimating/src/ActivePursuitsPage.tsx`

**Purpose:** Main page displaying CRUD table of active pursuits. Handles query caching, modal state, and delete confirmation.

```typescript
import { FC, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { WorkspacePageShell, HbcDataTable, HbcButton, HbcStatusBadge, HbcModal, HbcConfirmDialog } from '@hbc/ui-kit';
import { useAuth } from '@hbc/auth'; // RBAC context
import { IActivePursuit, IActivePursuitFormData } from '@hbc/models';
import {
  fetchActivePursuits,
  createPursuit,
  updatePursuit,
  deletePursuit,
} from './data/estimatingQueries';
import { PursuitForm } from './components/PursuitForm';
import { PursuitChecklistInline } from './components/PursuitChecklistInline';
import { ExternalPlatformLinks } from './components/ExternalPlatformLinks';

/**
 * ActivePursuitsPage
 *
 * Displays a CRUD table of active construction bids (pursuits).
 * - RBAC: view all, create/edit/delete only if `estimating:write`
 * - Row click navigates to Project Hub kickoff checklist
 * - External platform links (BC, Procore) open in new tabs
 * - Delete is reversible via undo until page reload
 */
const ActivePursuitsPage: FC = () => {
  const navigate = useNavigate();
  const { userClaims } = useAuth();
  const queryClient = useQueryClient();

  // RBAC: check for estimating:write permission
  const canWrite = userClaims?.scopes?.includes('estimating:write') ?? false;

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPursuit, setSelectedPursuit] = useState<IActivePursuit | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pursuitToDelete, setPursuitToDelete] = useState<IActivePursuit | null>(null);

  // Query: fetch all active pursuits
  const { data: pursuits = [], isLoading, error } = useQuery({
    queryKey: ['estimating', 'pursuits'],
    queryFn: fetchActivePursuits,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation: create new pursuit
  const createMutation = useMutation({
    mutationFn: createPursuit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] });
      setIsAddModalOpen(false);
    },
  });

  // Mutation: update pursuit
  const updateMutation = useMutation({
    mutationFn: updatePursuit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] });
      setIsEditModalOpen(false);
      setSelectedPursuit(null);
    },
  });

  // Mutation: delete pursuit
  const deleteMutation = useMutation({
    mutationFn: deletePursuit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] });
      setDeleteConfirmOpen(false);
      setPursuitToDelete(null);
    },
  });

  // Handlers
  const handleAddClick = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleEditClick = useCallback(
    (e: React.MouseEvent, pursuit: IActivePursuit) => {
      e.stopPropagation();
      setSelectedPursuit(pursuit);
      setIsEditModalOpen(true);
    },
    []
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, pursuit: IActivePursuit) => {
      e.stopPropagation();
      setPursuitToDelete(pursuit);
      setDeleteConfirmOpen(true);
    },
    []
  );

  const handleRowClick = useCallback(
    (pursuit: IActivePursuit) => {
      navigate({
        to: '/project-hub/$projectNumber/kickoff',
        params: { projectNumber: pursuit.projectNumber },
      });
    },
    [navigate]
  );

  const handleAddSubmit = useCallback(
    (formData: IActivePursuitFormData) => {
      createMutation.mutate(formData);
    },
    [createMutation]
  );

  const handleEditSubmit = useCallback(
    (formData: IActivePursuitFormData) => {
      if (selectedPursuit) {
        updateMutation.mutate({
          id: selectedPursuit.id,
          ...formData,
        });
      }
    },
    [selectedPursuit, updateMutation]
  );

  const handleConfirmDelete = useCallback(() => {
    if (pursuitToDelete) {
      deleteMutation.mutate(pursuitToDelete.id);
    }
  }, [pursuitToDelete, deleteMutation]);

  // Status badge variant mapping
  const getStatusVariant = (status: string): 'neutral' | 'warning' | 'success' | 'error' => {
    switch (status) {
      case 'Active':
        return 'neutral';
      case 'Submitted':
        return 'warning';
      case 'Awarded':
        return 'success';
      case 'NotAwarded':
        return 'error';
      case 'OnHold':
        return 'warning';
      case 'Withdrawn':
        return 'error';
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
      render: (row: IActivePursuit) => row.projectNumber,
    },
    {
      key: 'projectName',
      label: 'Project Name',
      width: 220,
      sortable: true,
      render: (row: IActivePursuit) => row.projectName,
    },
    {
      key: 'deliverable',
      label: 'Deliverable',
      width: 140,
      sortable: true,
      render: (row: IActivePursuit) => row.deliverable || '—',
    },
    {
      key: 'subBidsDue',
      label: 'Sub Bids Due',
      width: 120,
      sortable: true,
      render: (row: IActivePursuit) => row.subBidsDue ? new Date(row.subBidsDue).toLocaleDateString() : '—',
    },
    {
      key: 'presubmissionReview',
      label: 'Pre-Sub Review',
      width: 130,
      sortable: true,
      render: (row: IActivePursuit) => row.presubmissionReview ? new Date(row.presubmissionReview).toLocaleDateString() : '—',
    },
    {
      key: 'winStrategyMeeting',
      label: 'Win Strategy',
      width: 120,
      sortable: true,
      render: (row: IActivePursuit) => row.winStrategyMeeting ? new Date(row.winStrategyMeeting).toLocaleDateString() : '—',
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      width: 110,
      sortable: true,
      render: (row: IActivePursuit) => new Date(row.dueDate).toLocaleDateString(),
    },
    {
      key: 'leadEstimatorName',
      label: 'Lead Estimator',
      width: 150,
      sortable: true,
      render: (row: IActivePursuit) => row.leadEstimatorName,
    },
    {
      key: 'checklist',
      label: 'Checklist',
      width: 110,
      sortable: false,
      render: (row: IActivePursuit) => <PursuitChecklistInline pursuit={row} />,
    },
    {
      key: 'status',
      label: 'Status',
      width: 120,
      sortable: true,
      render: (row: IActivePursuit) => (
        <HbcStatusBadge
          variant={getStatusVariant(row.status)}
          text={row.status}
        />
      ),
    },
    {
      key: 'platforms',
      label: 'Platforms',
      width: 80,
      sortable: false,
      render: (row: IActivePursuit) => <ExternalPlatformLinks pursuit={row} />,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 80,
      sortable: false,
      render: (row: IActivePursuit) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {canWrite && (
            <>
              <HbcButton
                icon="Edit"
                variant="text"
                onClick={(e) => handleEditClick(e, row)}
                title="Edit pursuit"
              />
              <HbcButton
                icon="Delete"
                variant="text"
                onClick={(e) => handleDeleteClick(e, row)}
                title="Delete pursuit"
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <WorkspacePageShell
      title="Active Pursuits"
      subtitle="Click a row to open the project kickoff checklist in Project Hub."
      status={error ? 'error' : isLoading ? 'loading' : 'idle'}
      statusMessage={error ? `Error loading pursuits: ${error.message}` : undefined}
    >
      {/* Toolbar */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
        {canWrite && (
          <HbcButton
            variant="primary"
            text="+ Add Pursuit"
            onClick={handleAddClick}
            icon="Add"
          />
        )}
      </div>

      {/* Data Table */}
      <HbcDataTable
        columns={columns}
        data={pursuits}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        striped
        hoverable
      />

      {/* Add Modal */}
      <HbcModal
        isOpen={isAddModalOpen}
        title="Add New Pursuit"
        onClose={() => setIsAddModalOpen(false)}
      >
        <PursuitForm
          onSubmit={handleAddSubmit}
          isSubmitting={createMutation.isPending}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </HbcModal>

      {/* Edit Modal */}
      <HbcModal
        isOpen={isEditModalOpen}
        title={`Edit "${selectedPursuit?.projectName}"`}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPursuit(null);
        }}
      >
        {selectedPursuit && (
          <PursuitForm
            initialValues={{
              projectNumber: selectedPursuit.projectNumber,
              projectName: selectedPursuit.projectName,
              source: selectedPursuit.source,
              deliverable: selectedPursuit.deliverable,
              dueDate: selectedPursuit.dueDate,
              subBidsDue: selectedPursuit.subBidsDue,
              presubmissionReview: selectedPursuit.presubmissionReview,
              winStrategyMeeting: selectedPursuit.winStrategyMeeting,
              leadEstimatorUpn: selectedPursuit.leadEstimatorUpn,
              contributorUpns: selectedPursuit.contributorUpns,
              projectExecutiveUpn: selectedPursuit.projectExecutiveUpn,
              buildingConnectedUrl: selectedPursuit.buildingConnectedUrl,
              procoreUrl: selectedPursuit.procoreUrl,
            }}
            onSubmit={handleEditSubmit}
            isSubmitting={updateMutation.isPending}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedPursuit(null);
            }}
          />
        )}
      </HbcModal>

      {/* Delete Confirmation Dialog */}
      <HbcConfirmDialog
        isOpen={deleteConfirmOpen}
        title="Delete Pursuit"
        message={`Remove "${pursuitToDelete?.projectName}" from Current Pursuits? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setPursuitToDelete(null);
        }}
        isLoading={deleteMutation.isPending}
      />
    </WorkspacePageShell>
  );
};

export default ActivePursuitsPage;
```

---

### Component 2: PursuitForm.tsx

**File path:** `packages/features/estimating/src/components/PursuitForm.tsx`

**Purpose:** Reusable form component for adding and editing pursuits. Validates project number format, dates, and team assignments.

```typescript
import { FC, useState } from 'react';
import {
  HbcTextField,
  HbcSelect,
  HbcPeoplePicker,
  HbcFormSection,
  HbcButton,
} from '@hbc/ui-kit';
import { IActivePursuitFormData } from '@hbc/models';

export interface PursuitFormProps {
  initialValues?: Partial<IActivePursuitFormData>;
  onSubmit: (data: IActivePursuitFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const DELIVERABLE_OPTIONS = [
  { key: 'lump-sum', text: 'Lump Sum' },
  { key: 'gmp', text: 'GMP' },
  { key: 'hard-bid', text: 'Hard Bid' },
  { key: 'design-build', text: 'Design Build' },
  { key: 'rom', text: 'ROM' },
  { key: 'sd-estimate', text: 'SD Estimate' },
  { key: 'schematic-estimate', text: 'Schematic Estimate' },
  { key: 'conceptual-estimate', text: 'Conceptual Estimate' },
];

/**
 * PursuitForm
 *
 * A reusable form for creating and editing active pursuits.
 *
 * Validation rules:
 * - projectNumber: required, format ##-###-##
 * - projectName: required, minLength 2
 * - dueDate: required, must be today or in future
 * - leadEstimatorUpn: required, single select
 *
 * Layout uses HbcFormSection for grouping:
 * - Project Details
 * - Key Dates
 * - Team
 * - External Platforms (Optional)
 */
const PursuitForm: FC<PursuitFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<IActivePursuitFormData>>({
    projectNumber: initialValues?.projectNumber ?? '',
    projectName: initialValues?.projectName ?? '',
    source: initialValues?.source ?? '',
    deliverable: initialValues?.deliverable ?? '',
    dueDate: initialValues?.dueDate ?? '',
    subBidsDue: initialValues?.subBidsDue ?? '',
    presubmissionReview: initialValues?.presubmissionReview ?? '',
    winStrategyMeeting: initialValues?.winStrategyMeeting ?? '',
    leadEstimatorUpn: initialValues?.leadEstimatorUpn ?? '',
    contributorUpns: initialValues?.contributorUpns ?? [],
    projectExecutiveUpn: initialValues?.projectExecutiveUpn ?? '',
    buildingConnectedUrl: initialValues?.buildingConnectedUrl ?? '',
    procoreUrl: initialValues?.procoreUrl ?? '',
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
    } else if (formData.projectName.length < 2) {
      newErrors.projectName = 'Project Name must be at least 2 characters';
    }

    // dueDate validation
    if (!formData.dueDate) {
      newErrors.dueDate = 'Proposal Due Date is required';
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        newErrors.dueDate = 'Due Date must be today or in the future';
      }
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
        source: formData.source,
        deliverable: formData.deliverable,
        dueDate: formData.dueDate as string,
        subBidsDue: formData.subBidsDue,
        presubmissionReview: formData.presubmissionReview,
        winStrategyMeeting: formData.winStrategyMeeting,
        leadEstimatorUpn: formData.leadEstimatorUpn as string,
        contributorUpns: formData.contributorUpns,
        projectExecutiveUpn: formData.projectExecutiveUpn,
        buildingConnectedUrl: formData.buildingConnectedUrl,
        procoreUrl: formData.procoreUrl,
      });
    }
  };

  const handleFieldChange = (field: keyof IActivePursuitFormData, value: any) => {
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
        <HbcTextField
          label="Source"
          placeholder="Owner direct, GC referral, public bid..."
          value={formData.source as string}
          onChange={(e) => handleFieldChange('source', e.target.value)}
          disabled={isSubmitting}
        />
        <HbcSelect
          label="Deliverable Type"
          options={DELIVERABLE_OPTIONS}
          selectedKey={formData.deliverable}
          onChange={(e, option) =>
            handleFieldChange('deliverable', option?.key ?? '')
          }
          disabled={isSubmitting}
        />
      </HbcFormSection>

      {/* Key Dates Section */}
      <HbcFormSection title="Key Dates">
        <HbcTextField
          label="Proposal Due Date"
          type="date"
          value={formData.dueDate as string}
          onChange={(e) => handleFieldChange('dueDate', e.target.value)}
          required
          error={errors.dueDate}
          disabled={isSubmitting}
        />
        <HbcTextField
          label="Sub Bids Due"
          type="date"
          value={formData.subBidsDue as string}
          onChange={(e) => handleFieldChange('subBidsDue', e.target.value)}
          disabled={isSubmitting}
        />
        <HbcTextField
          label="Pre-Submission Review"
          type="date"
          value={formData.presubmissionReview as string}
          onChange={(e) => handleFieldChange('presubmissionReview', e.target.value)}
          disabled={isSubmitting}
        />
        <HbcTextField
          label="Win Strategy Meeting"
          type="date"
          value={formData.winStrategyMeeting as string}
          onChange={(e) => handleFieldChange('winStrategyMeeting', e.target.value)}
          disabled={isSubmitting}
        />
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
          label="Estimating Team (Contributors)"
          selectedPeople={
            (formData.contributorUpns as string[])?.map((upn) => ({
              upn,
            })) ?? []
          }
          onChange={(people) =>
            handleFieldChange('contributorUpns', people.map((p) => p.upn))
          }
          multiSelect={true}
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

      {/* External Platforms Section */}
      <HbcFormSection title="External Platforms (Optional)">
        <HbcTextField
          label="Building Connected URL"
          type="url"
          placeholder="https://..."
          value={formData.buildingConnectedUrl as string}
          onChange={(e) => handleFieldChange('buildingConnectedUrl', e.target.value)}
          disabled={isSubmitting}
        />
        <HbcTextField
          label="Procore URL"
          type="url"
          placeholder="https://..."
          value={formData.procoreUrl as string}
          onChange={(e) => handleFieldChange('procoreUrl', e.target.value)}
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

export default PursuitForm;
```

---

### Component 3: PursuitChecklistInline.tsx

**File path:** `packages/features/estimating/src/components/PursuitChecklistInline.tsx`

**Purpose:** Displays a compact checklist completion badge (e.g., "7/9"). Click navigates to Project Hub kickoff page.

```typescript
import { FC } from 'react';
import { HbcStatusBadge } from '@hbc/ui-kit';
import { IActivePursuit } from '@hbc/models';

export interface PursuitChecklistInlineProps {
  pursuit: IActivePursuit;
}

/**
 * PursuitChecklistInline
 *
 * Displays a badge showing checklist completion count (e.g., "7/9").
 * Badge color reflects completion level:
 * - 9/9: success (green)
 * - 7-8/9: warning (amber)
 * - Below 7: neutral (gray)
 *
 * Click is handled by parent row click handler via project number navigation.
 */
const PursuitChecklistInline: FC<PursuitChecklistInlineProps> = ({ pursuit }) => {
  // Checklist keys to count
  const CHECKLIST_KEYS: (keyof IActivePursuit)[] = [
    'checkBidBond',
    'checkPPBond',
    'checkSchedule',
    'checkLogistics',
    'checkBimProposal',
    'checkPreconProposal',
    'checkProposalTabs',
    'checkMarketingCoordination',
    'checkBusinessTerms',
  ];

  // Count completed items
  const completedCount = CHECKLIST_KEYS.filter(
    (key) => pursuit[key] === true
  ).length;
  const totalCount = CHECKLIST_KEYS.length;

  // Determine badge variant based on completion percentage
  const getVariant = (): 'success' | 'warning' | 'neutral' => {
    if (completedCount === totalCount) {
      return 'success';
    } else if (completedCount >= 7) {
      return 'warning';
    }
    return 'neutral';
  };

  return (
    <HbcStatusBadge
      variant={getVariant()}
      text={`${completedCount}/${totalCount}`}
    />
  );
};

export default PursuitChecklistInline;
```

---

### Component 4: ExternalPlatformLinks.tsx

**File path:** `packages/features/estimating/src/components/ExternalPlatformLinks.tsx`

**Purpose:** Renders clickable buttons for Building Connected and Procore URLs. Safely prevents row click propagation.

```typescript
import { FC } from 'react';
import { HbcButton } from '@hbc/ui-kit';
import { IActivePursuit } from '@hbc/models';

export interface ExternalPlatformLinksProps {
  pursuit: IActivePursuit;
}

/**
 * ExternalPlatformLinks
 *
 * Displays two optional buttons:
 * - BC: opens buildingConnectedUrl in new tab (only if URL is set)
 * - PC: opens procoreUrl in new tab (only if URL is set)
 *
 * Both buttons call e.stopPropagation() to prevent row click navigation.
 */
const ExternalPlatformLinks: FC<ExternalPlatformLinksProps> = ({ pursuit }) => {
  const handleBCClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pursuit.buildingConnectedUrl) {
      window.open(pursuit.buildingConnectedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleProcoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pursuit.procoreUrl) {
      window.open(pursuit.procoreUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {pursuit.buildingConnectedUrl && (
        <HbcButton
          text="BC"
          variant="text"
          size="small"
          onClick={handleBCClick}
          title="Open Building Connected"
        />
      )}
      {pursuit.procoreUrl && (
        <HbcButton
          text="PC"
          variant="text"
          size="small"
          onClick={handleProcoreClick}
          title="Open Procore"
        />
      )}
    </div>
  );
};

export default ExternalPlatformLinks;
```

---

### Data Access Layer: estimatingQueries.ts

**File path:** `packages/features/estimating/src/data/estimatingQueries.ts`

**Note:** These query hooks are provided if not already present in your codebase. Add them to the existing file if it exists.

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IActivePursuit, IActivePursuitFormData } from '@hbc/models';
import { hbcDataAccessProvider } from '@hbc/data-access'; // port/adapter factory

/**
 * Fetch all active pursuits
 */
export async function fetchActivePursuits(): Promise<IActivePursuit[]> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  const result = await repo.getActivePursuits();
  return result.items;
}

/**
 * Create a new pursuit
 */
export async function createPursuit(data: IActivePursuitFormData): Promise<IActivePursuit> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  return repo.createPursuit(data);
}

/**
 * Update an existing pursuit
 */
export async function updatePursuit(data: IActivePursuit): Promise<IActivePursuit> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  return repo.updatePursuit(data);
}

/**
 * Delete a pursuit by ID
 */
export async function deletePursuit(id: string): Promise<void> {
  const repo = hbcDataAccessProvider.getEstimatingRepository();
  return repo.deletePursuit(id);
}

/**
 * useActivePursuitsQuery hook
 * Convenience hook for fetching all active pursuits
 */
export function useActivePursuitsQuery() {
  return useQuery({
    queryKey: ['estimating', 'pursuits'],
    queryFn: fetchActivePursuits,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * useCreatePursuitMutation hook
 * Convenience hook for creating a pursuit
 */
export function useCreatePursuitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPursuit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] });
    },
  });
}

/**
 * useUpdatePursuitMutation hook
 * Convenience hook for updating a pursuit
 */
export function useUpdatePursuitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePursuit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] });
    },
  });
}

/**
 * useDeletePursuitMutation hook
 * Convenience hook for deleting a pursuit
 */
export function useDeletePursuitMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePursuit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estimating', 'pursuits'] });
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

- [ ] Page loads with data table of active pursuits
- [ ] "Add Pursuit" button opens modal (only visible if `estimating:write` permission)
- [ ] Form validates project number format (##-###-##)
- [ ] Form validates due date (must be future or today)
- [ ] Form requires Lead Estimator selection
- [ ] Add submit creates new row and closes modal
- [ ] Edit button opens modal with pre-filled values
- [ ] Edit submit updates row
- [ ] Delete button opens confirmation dialog
- [ ] Delete confirmation removes row
- [ ] Row click navigates to `/project-hub/{projectNumber}/kickoff`
- [ ] Building Connected button opens URL in new tab (if set)
- [ ] Procore button opens URL in new tab (if set)
- [ ] Checklist badge displays completion count (e.g., 7/9)
- [ ] Status badge shows correct color (Active=neutral, Submitted=warning, Awarded=success, etc.)
- [ ] Table is sortable and filterable
- [ ] RBAC: non-write users see edit/delete buttons disabled or hidden

---

## Definition of Done

- [ ] All four components created (ActivePursuitsPage, PursuitForm, PursuitChecklistInline, ExternalPlatformLinks)
- [ ] Data access functions implemented and integrated with TanStack Query
- [ ] TypeScript: no type errors (`pnpm turbo run typecheck` passes)
- [ ] RBAC enforcement: `estimating:write` checks in place
- [ ] Form validation: projectNumber format, dueDate future check, required fields
- [ ] Modal flows: Add, Edit, Delete work end-to-end
- [ ] Navigation: row click navigates to Project Hub kickoff page
- [ ] External links: BC and Procore buttons prevent row click propagation
- [ ] Checklist badge: renders completion count with correct color variant
- [ ] Status badge: color variant matches pursuit status
- [ ] Responsive layout: columns sized for readability on desktop
- [ ] All components pass linting and build checks
- [ ] Ready for integration with Phase 7 backend and API layer

---

<!-- IMPLEMENTATION PROGRESS & NOTES
Status: Ready for developer implementation
Date: 2026-03-08
Phase: 7 (Estimating)
Next: PH7-Estimating-5-ActivePreconstruction.md
-->
