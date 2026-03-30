import type { ReactNode } from 'react';
import { makeStyles } from '@griffel/react';
import { getAddOnsForDepartment } from '@hbc/features-estimating';
import type { ProjectDepartment } from '@hbc/models';
import { DEPARTMENT_DISPLAY_LABELS } from '@hbc/provisioning';
import { HbcCheckbox, HbcEmptyState, HbcFormSection, HbcTypography } from '@hbc/ui-kit';
import { HBC_SURFACE_LIGHT, HBC_SPACE_XS, bodySmall } from '@hbc/ui-kit/theme';
import type { StepBodyProps } from './StepBodyProps.js';

const useStyles = makeStyles({
  addOnItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_XS / 2}px`,
  },
  addOnDescription: {
    fontSize: bodySmall.fontSize,
    color: HBC_SURFACE_LIGHT['text-muted'],
    paddingLeft: `${HBC_SPACE_XS * 7}px`,
  },
});

/**
 * Step 4 — Template add-on selection, filtered by department.
 * Shows intentional empty state when no department is selected or no add-ons are available.
 */
export function TemplateAddOnsStepBody({ request, onChange }: StepBodyProps): ReactNode {
  const styles = useStyles();
  const addOns = getAddOnsForDepartment(request.department as ProjectDepartment | undefined);
  const selected = request.addOns ?? [];
  const departmentLabel = request.department
    ? DEPARTMENT_DISPLAY_LABELS[request.department] ?? request.department
    : undefined;

  function toggleAddOn(slug: string): void {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    onChange({ addOns: next });
  }

  // No department selected
  if (!request.department) {
    return (
      <HbcFormSection title="Template Add-Ons">
        <HbcEmptyState
          title="Department Required"
          description="Select a department in the Department & Type step to see available template add-ons for your project."
        />
      </HbcFormSection>
    );
  }

  // Department selected but no add-ons available
  if (addOns.length === 0) {
    return (
      <HbcFormSection
        title="Template Add-Ons"
        description={`Showing add-ons for ${departmentLabel}.`}
      >
        <HbcEmptyState
          title="No Add-Ons Available"
          description={`There are no template add-ons configured for ${departmentLabel} projects. You can continue to the next step.`}
        />
      </HbcFormSection>
    );
  }

  // Add-ons available
  return (
    <HbcFormSection
      title="Template Add-Ons"
      description={`Optional templates for ${departmentLabel} projects. Select any that apply.`}
    >
      {addOns.map((addOn) => (
        <div key={addOn.slug} className={styles.addOnItem}>
          <HbcCheckbox
            label={addOn.label}
            checked={selected.includes(addOn.slug)}
            onChange={() => toggleAddOn(addOn.slug)}
          />
          <HbcTypography intent="bodySmall" className={styles.addOnDescription}>
            {addOn.description}
          </HbcTypography>
        </div>
      ))}
    </HbcFormSection>
  );
}
