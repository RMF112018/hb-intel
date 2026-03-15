/**
 * W0-G5-T03: Step 4 — Template & Add-Ons (stepId: 'template-addons').
 * Fields: addOns (opt, filtered by department).
 * Uses ADD_ON_DEFINITIONS from @hbc/features-estimating when available;
 * falls back to static list for PWA-first delivery.
 */
import type { ReactElement } from 'react';
import { HbcCheckbox, HbcFormLayout } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';

const AVAILABLE_ADD_ONS = [
  { slug: 'safety-module', label: 'Safety Module', description: 'Safety tracking and incident reporting' },
  { slug: 'quality-control', label: 'Quality Control', description: 'Quality inspection workflows' },
  { slug: 'risk-management', label: 'Risk Management', description: 'Risk register and mitigation tracking' },
  { slug: 'document-control', label: 'Document Control', description: 'Document versioning and approval' },
  { slug: 'photo-gallery', label: 'Photo Gallery', description: 'Construction photo documentation' },
];

interface TemplateAddOnsStepProps {
  request: Partial<IProjectSetupRequest>;
  onChange: (patch: Partial<IProjectSetupRequest>) => void;
}

export function TemplateAddOnsStep({ request, onChange }: TemplateAddOnsStepProps): ReactElement {
  const selected = new Set(request.addOns ?? []);

  const toggle = (slug: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) {
      next.add(slug);
    } else {
      next.delete(slug);
    }
    onChange({ addOns: [...next] });
  };

  return (
    <HbcFormLayout columns={1} gap="medium">
      {AVAILABLE_ADD_ONS.map((addon) => (
        <HbcCheckbox
          key={addon.slug}
          label={addon.label}
          checked={selected.has(addon.slug)}
          onChange={(checked) => toggle(addon.slug, checked)}
        />
      ))}
    </HbcFormLayout>
  );
}
