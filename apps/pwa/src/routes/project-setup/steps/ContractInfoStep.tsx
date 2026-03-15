/**
 * W0-G5-T01: Step 2 — Contract Info.
 * Fields: contractType.
 */
import type { ReactElement } from 'react';
import { HbcSelect, HbcFormLayout } from '@hbc/ui-kit';
import type { IProjectSetupRequest } from '@hbc/models';

const CONTRACT_TYPE_OPTIONS = [
  { value: 'lump-sum', label: 'Lump Sum' },
  { value: 'gmp', label: 'Guaranteed Maximum Price (GMP)' },
  { value: 'cost-plus', label: 'Cost Plus' },
  { value: 'design-build', label: 'Design-Build' },
  { value: 'time-and-materials', label: 'Time & Materials' },
];

interface ContractInfoStepProps {
  item: Partial<IProjectSetupRequest>;
  onChange: (patch: Partial<IProjectSetupRequest>) => void;
}

export function ContractInfoStep({ item, onChange }: ContractInfoStepProps): ReactElement {
  return (
    <HbcFormLayout columns={1} gap="medium">
      <HbcSelect
        label="Contract Type"
        value={item.contractType ?? ''}
        onChange={(v) => onChange({ contractType: v })}
        options={CONTRACT_TYPE_OPTIONS}
        required
        placeholder="Select contract type"
      />
    </HbcFormLayout>
  );
}
