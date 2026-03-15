import type { ReactNode } from 'react';
import { getAddOnsForDepartment } from '@hbc/features-estimating';
import type { ProjectDepartment } from '@hbc/models';
import { HbcCheckbox, HbcFormSection } from '@hbc/ui-kit';
import type { StepBodyProps } from './StepBodyProps.js';

/**
 * Step 4 — Template add-on selection, filtered by department.
 * W0-G4-T01 step body for the `template-addons` wizard step.
 */
export function TemplateAddOnsStepBody({ request, onChange }: StepBodyProps): ReactNode {
  const addOns = getAddOnsForDepartment(request.department as ProjectDepartment | undefined);
  const selected = request.addOns ?? [];

  function toggleAddOn(slug: string): void {
    const next = selected.includes(slug)
      ? selected.filter((s) => s !== slug)
      : [...selected, slug];
    onChange({ addOns: next });
  }

  return (
    <HbcFormSection title="Template Add-Ons">
      {addOns.length === 0 ? (
        <p>Select a department in Step 2 to see available add-ons.</p>
      ) : (
        addOns.map((addOn) => (
          <HbcCheckbox
            key={addOn.slug}
            label={`${addOn.label} — ${addOn.description}`}
            checked={selected.includes(addOn.slug)}
            onChange={() => toggleAddOn(addOn.slug)}
          />
        ))
      )}
    </HbcFormSection>
  );
}
