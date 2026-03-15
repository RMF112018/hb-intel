/**
 * W0-G5-T01: Step 4 — Add-Ons.
 * Fields: addOns (pack slugs) — checkbox/toggle list.
 */
import type { ReactElement } from 'react';
import { HbcCheckbox, HbcFormLayout } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';

const AVAILABLE_ADD_ONS = [
  { slug: 'safety-module', label: 'Safety Module' },
  { slug: 'quality-control', label: 'Quality Control' },
  { slug: 'risk-management', label: 'Risk Management' },
  { slug: 'document-control', label: 'Document Control' },
  { slug: 'photo-gallery', label: 'Photo Gallery' },
];

interface AddOnsStepProps {
  item: Partial<IProjectSetupRequest>;
  onChange: (patch: Partial<IProjectSetupRequest>) => void;
}

export function AddOnsStep({ item, onChange }: AddOnsStepProps): ReactElement {
  const selected = new Set(item.addOns ?? []);

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
