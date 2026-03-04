/**
 * Elevation Showcase — PH4.8 §Step 8
 * Visual demo of all 4 V2.1 dual-shadow levels + Field Mode toggle
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  elevationLevel0,
  elevationLevel1,
  elevationLevel2,
  elevationLevel3,
  hbcElevationField,
} from './elevation.js';

const meta: Meta = {
  title: 'Theme/Elevation',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

const levels = [
  { name: 'Level 0 (rest)', value: elevationLevel0, fieldValue: hbcElevationField.level0 },
  { name: 'Level 1 (card)', value: elevationLevel1, fieldValue: hbcElevationField.level1 },
  { name: 'Level 2 (raised)', value: elevationLevel2, fieldValue: hbcElevationField.level2 },
  { name: 'Level 3 (modal)', value: elevationLevel3, fieldValue: hbcElevationField.level3 },
];

const ElevationShowcase: React.FC = () => {
  const [fieldMode, setFieldMode] = React.useState(false);
  const bg = fieldMode ? '#0F1419' : '#F0F2F5';
  const cardBg = fieldMode ? '#1A2332' : '#FFFFFF';
  const text = fieldMode ? '#E8EAED' : '#1A1D23';

  return (
    <div style={{ padding: '32px', backgroundColor: bg, minHeight: '400px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, color: text }}>V2.1 Dual-Shadow Elevation Scale</h2>
        <label style={{ color: text, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={fieldMode}
            onChange={() => setFieldMode(!fieldMode)}
            style={{ marginRight: '8px' }}
          />
          Field Mode (+50% opacity)
        </label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {levels.map((level) => (
          <div
            key={level.name}
            style={{
              backgroundColor: cardBg,
              borderRadius: '8px',
              padding: '24px',
              boxShadow: fieldMode ? level.fieldValue : level.value,
              border: `1px solid ${fieldMode ? '#3A4A5C' : '#D1D5DB'}`,
            }}
          >
            <h4 style={{ margin: '0 0 8px', color: text }}>{level.name}</h4>
            <code style={{ fontSize: '0.75rem', color: fieldMode ? '#8B95A5' : '#6B7280', wordBreak: 'break-all' }}>
              {fieldMode ? level.fieldValue : level.value}
            </code>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Default: Story = {
  render: () => <ElevationShowcase />,
};
