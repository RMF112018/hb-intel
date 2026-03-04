/**
 * HbcTooltip — Storybook Stories
 * Phase 4.9 Messaging & Feedback System
 */
import * as React from 'react';
import { FluentProvider } from '@fluentui/react-components';
import { HbcTooltip } from './index.js';
import { hbcLightTheme, hbcFieldTheme } from '../theme/index.js';
import { HbcButton } from '../HbcButton/index.js';

export default {
  title: 'Messaging/HbcTooltip',
  component: HbcTooltip,
  decorators: [
    (Story: React.FC) => (
      <FluentProvider theme={hbcLightTheme}>
        <div style={{ padding: 80, display: 'flex', justifyContent: 'center' }}>
          <Story />
        </div>
      </FluentProvider>
    ),
  ],
};

export const Default = () => (
  <HbcTooltip content="Save your current changes">
    <HbcButton>Hover me</HbcButton>
  </HbcTooltip>
);

export const AllPositions = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
    <HbcTooltip content="Top tooltip" position="top">
      <HbcButton>Top</HbcButton>
    </HbcTooltip>
    <HbcTooltip content="Bottom tooltip" position="bottom">
      <HbcButton>Bottom</HbcButton>
    </HbcTooltip>
    <HbcTooltip content="Left tooltip" position="left">
      <HbcButton>Left</HbcButton>
    </HbcTooltip>
    <HbcTooltip content="Right tooltip" position="right">
      <HbcButton>Right</HbcButton>
    </HbcTooltip>
  </div>
);

export const LongContent = () => (
  <HbcTooltip content="This is a longer tooltip message that demonstrates text wrapping behavior within the 280px maximum width constraint of the tooltip component.">
    <HbcButton>Hover for long text</HbcButton>
  </HbcTooltip>
);

export const AllVariants = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Positions</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, padding: '40px 80px' }}>
        <HbcTooltip content="Top tooltip" position="top">
          <HbcButton>Top</HbcButton>
        </HbcTooltip>
        <HbcTooltip content="Bottom tooltip" position="bottom">
          <HbcButton>Bottom</HbcButton>
        </HbcTooltip>
        <HbcTooltip content="Left tooltip" position="left">
          <HbcButton>Left</HbcButton>
        </HbcTooltip>
        <HbcTooltip content="Right tooltip" position="right">
          <HbcButton>Right</HbcButton>
        </HbcTooltip>
      </div>
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Long content</p>
      <div style={{ padding: '0 80px' }}>
        <HbcTooltip content="This is a longer tooltip message that demonstrates text wrapping behavior within the maximum width constraint.">
          <HbcButton>Hover for long text</HbcButton>
        </HbcTooltip>
      </div>
    </div>
  </div>
);

export const FieldMode = () => (
  <FluentProvider theme={hbcFieldTheme}>
    <div style={{ padding: 80, backgroundColor: '#0F1419', display: 'flex', justifyContent: 'center' }}>
      <HbcTooltip content="Field mode tooltip">
        <HbcButton>Hover me (Field Mode)</HbcButton>
      </HbcTooltip>
    </div>
  </FluentProvider>
);

export const A11yTest = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <p>Tab to the button to trigger tooltip via focus (immediate, no delay).</p>
    <HbcTooltip content="Accessible tooltip with aria-describedby">
      <HbcButton>Focus me via Tab</HbcButton>
    </HbcTooltip>
  </div>
);
