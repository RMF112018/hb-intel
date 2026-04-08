/**
 * HbcSignatureHeroSurface Stories — Visual proof for presentation-lane flagship hero.
 * Wave-01r Prompt-01: Capture Visual Proof
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcSignatureHeroSurface } from './index.js';

const meta: Meta<typeof HbcSignatureHeroSurface> = {
  title: 'Homepage Surfaces/HbcSignatureHeroSurface',
  component: HbcSignatureHeroSurface,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj<typeof HbcSignatureHeroSurface>;

export const Default: Story = {
  render: () => (
    <HbcSignatureHeroSurface
      eyebrow={<span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.8, color: '#fff' }}>HB Intel Platform</span>}
      greeting={
        <div style={{ color: '#fff' }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>Good morning, Sarah</h2>
          <p style={{ margin: '8px 0 0', fontSize: 14, opacity: 0.85 }}>Wednesday, April 8 2026</p>
        </div>
      }
      editorial={
        <div style={{ color: '#fff' }}>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, lineHeight: 1.2 }}>
            Q2 Strategic Priorities
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 16, opacity: 0.9, maxWidth: 480, lineHeight: 1.5 }}>
            Three critical initiatives are driving our focus this quarter: safety excellence, operational efficiency, and talent development across all regions.
          </p>
        </div>
      }
      ctas={
        <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
          <button type="button" style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: '#fff', color: '#0A2540', fontWeight: 600, cursor: 'pointer' }}>View Priorities</button>
          <button type="button" style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.4)', background: 'transparent', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>My Dashboard</button>
        </div>
      }
      context={
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>3 alerts require attention</span>
      }
      metadata={
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Region: Northeast &bull; Role: Project Director</span>
      }
    />
  ),
};

export const CompactLayout: Story = {
  render: () => (
    <HbcSignatureHeroSurface
      layout="compact"
      greeting={
        <div style={{ color: '#fff' }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600 }}>Welcome back, Marcus</h2>
        </div>
      }
      editorial={
        <div style={{ color: '#fff' }}>
          <p style={{ margin: 0, fontSize: 15, opacity: 0.9 }}>
            Your team has 5 open action items this week.
          </p>
        </div>
      }
    />
  ),
};
