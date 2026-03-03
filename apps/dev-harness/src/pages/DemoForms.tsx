/**
 * DemoForms — HbcTextField + HbcSelect + HbcCheckbox + HbcFormLayout demo.
 * Foundation Plan Phase 3.
 */
import { useState } from 'react';
import { HbcTextField, HbcSelect, HbcCheckbox, HbcFormLayout } from '@hbc/ui-kit';

export function DemoForms() {
  const [name, setName] = useState('Harbor View Medical Center');
  const [number, setNumber] = useState('HV-2025-001');
  const [status, setStatus] = useState('active');
  const [email, setEmail] = useState('pm@hbintel.local');
  const [isActive, setIsActive] = useState(true);
  const [notifyOnChange, setNotifyOnChange] = useState(false);

  return (
    <div>
      <h3 className="harness-section-title">Forms — Project Details</h3>
      <HbcFormLayout columns={2} gap="medium">
        <HbcTextField
          label="Project Name"
          value={name}
          onChange={setName}
          required
          placeholder="Enter project name"
        />
        <HbcTextField
          label="Project Number"
          value={number}
          onChange={setNumber}
          required
        />
        <HbcSelect
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'planning', label: 'Planning' },
            { value: 'on-hold', label: 'On Hold' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
        <HbcTextField
          label="PM Email"
          value={email}
          onChange={setEmail}
          type="email"
        />
        <HbcCheckbox
          label="Project is active"
          checked={isActive}
          onChange={setIsActive}
        />
        <HbcCheckbox
          label="Notify on status change"
          checked={notifyOnChange}
          onChange={setNotifyOnChange}
        />
      </HbcFormLayout>
    </div>
  );
}
