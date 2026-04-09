/**
 * HbcNewsroomSurface stories — visual proof for the signature Company Pulse
 * newsroom surface family.
 *
 * Wave 01 follow-on: Company Pulse migration to @hbc/ui-kit/homepage.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  HbcNewsroomSurface,
  type HbcNewsroomSurfaceModel,
} from './index.js';

const meta: Meta<typeof HbcNewsroomSurface> = {
  title: 'Homepage Surfaces/HbcNewsroomSurface',
  component: HbcNewsroomSurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcNewsroomSurface>;

const richModel: HbcNewsroomSurfaceModel = {
  heading: 'Company Pulse',
  archiveHref: '#pulse-archive',
  lead: {
    id: 'lead',
    title: 'Q2 Safety & Quality Milestone Achieved',
    summary:
      'Operations and field teams completed a major safety and quality milestone, marking the strongest audit quarter in company history.',
    category: 'milestone',
    byline: 'Corporate Communications',
    publishDate: '2026-04-07',
    media: {
      src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80',
      alt: 'Field team celebrating safety milestone',
    },
    cta: { label: 'Read highlights', href: '#q2-milestone' },
  },
  secondary: [
    {
      id: 'sec-1',
      title: 'Weekly Safety Briefing: Toolbox Talk Completion',
      category: 'safety',
      byline: 'Safety & Field Excellence',
      publishDate: '2026-04-06',
      cta: { label: 'View details', href: '#toolbox' },
    },
    {
      id: 'sec-2',
      title: 'New Subcontractor Onboarding Process Launches',
      category: 'update',
      byline: 'Operations',
      publishDate: '2026-04-05',
    },
    {
      id: 'sec-3',
      title: 'Field Team Recognition: Schedule Recovery',
      category: 'recognition',
      byline: 'Project Controls',
      publishDate: '2026-04-04',
    },
  ],
  tertiary: [
    { id: 'ter-1', title: 'IT Systems Maintenance Window', category: 'update' },
    { id: 'ter-2', title: 'PPE Refresh Reminder', category: 'safety' },
  ],
};

const sparseModel: HbcNewsroomSurfaceModel = {
  heading: 'Company Pulse',
  archiveHref: '#pulse-archive',
  lead: {
    id: 'lead',
    title: 'Leadership Commemorates Milestone',
    summary:
      'A single featured story with no supporting headlines — sparse-state layout keeps the editorial gravity on the lead.',
    category: 'milestone',
    byline: 'Corporate Communications',
    publishDate: '2026-04-07',
    media: {
      src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
      alt: 'Milestone celebration',
    },
    cta: { label: 'Read the story', href: '#milestone' },
  },
  secondary: [],
};

const headlineOnlyModel: HbcNewsroomSurfaceModel = {
  heading: 'Company Pulse',
  archiveHref: '#pulse-archive',
  lead: undefined,
  secondary: [
    {
      id: 'ho-1',
      title: 'IT Systems Maintenance Window This Weekend',
      category: 'update',
      byline: 'IT Operations',
      publishDate: '2026-04-06',
      cta: { label: 'Details', href: '#it' },
    },
    {
      id: 'ho-2',
      title: 'PPE Compliance Reminder',
      category: 'safety',
      byline: 'Safety & Field Excellence',
      publishDate: '2026-04-06',
    },
    {
      id: 'ho-3',
      title: 'Welcome New Field Engineers',
      category: 'recognition',
      byline: 'HR',
      publishDate: '2026-04-05',
    },
  ],
  tertiary: [{ id: 'ho-ter-1', title: 'Toolbox Talk Archive', category: 'safety' }],
};

const wrapStyle: React.CSSProperties = { maxWidth: 1200 };
const mobileWrapStyle: React.CSSProperties = { maxWidth: 420 };

export const Default: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcNewsroomSurface model={richModel} />
    </div>
  ),
};

export const Sparse: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcNewsroomSurface model={sparseModel} />
    </div>
  ),
};

export const HeadlineOnly: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcNewsroomSurface model={headlineOnlyModel} />
    </div>
  ),
};

export const Mobile: Story = {
  render: () => (
    <div style={mobileWrapStyle}>
      <HbcNewsroomSurface model={richModel} />
    </div>
  ),
};
