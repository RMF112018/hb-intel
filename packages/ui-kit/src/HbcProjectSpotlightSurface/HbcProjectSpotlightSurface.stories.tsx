/**
 * HbcProjectSpotlightSurface stories — visual proof for the signature
 * Project / Portfolio Spotlight homepage surface family.
 *
 * Wave 01 follow-on: Project / Portfolio Spotlight migration to
 * @hbc/ui-kit/homepage.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  HbcProjectSpotlightSurface,
  type ProjectSpotlightSurfaceModel,
} from './index.js';

const meta: Meta<typeof HbcProjectSpotlightSurface> = {
  title: 'Homepage Surfaces/HbcProjectSpotlightSurface',
  component: HbcProjectSpotlightSurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcProjectSpotlightSurface>;

const fullModel: ProjectSpotlightSurfaceModel = {
  heading: 'Project Spotlight',
  allProjectsLabel: 'View all projects',
  allProjectsUrl: '#all-projects',
  featured: {
    id: 'featured',
    title: 'Palm Beach Medical Campus Expansion',
    headline: 'Final structural turnover phase — field walkthroughs underway',
    summary:
      'Structural turnover enters final phase with field quality walkthroughs scheduled this week. Owner coordination and commissioning prep are on track.',
    location: 'Palm Beach, FL',
    sector: 'Healthcare',
    image: {
      src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1200&q=80',
      alt: 'Palm Beach Medical Campus construction site',
    },
    status: { label: 'On Track', variant: 'success' },
    strategicEmphasis: true,
    freshnessLabel: 'Updated today',
    milestones: [
      { id: 'm1', title: 'MEP closeout', completed: true },
      { id: 'm2', title: 'Owner turnover prep', completed: false },
    ],
    teamMembers: [
      { id: 'tm1', displayName: 'Jane Smith', role: 'Project Manager' },
      { id: 'tm2', displayName: 'Mike Torres', role: 'Superintendent' },
      { id: 'tm3', displayName: 'Sarah Chen', role: 'Safety Director' },
      { id: 'tm4', displayName: 'Alex Rivera', role: 'Estimator' },
      { id: 'tm5', displayName: 'Chris Park', role: 'Field Engineer' },
      { id: 'tm6', displayName: 'Dana Wilson', role: 'MEP Coordinator' },
    ],
    cta: { label: 'View project brief', href: '#brief' },
  },
  secondary: [
    {
      id: 'secondary-1',
      title: 'Fort Lauderdale Waterfront Residence',
      location: 'Fort Lauderdale, FL',
      sector: 'Luxury Residential',
      status: { label: 'Watchlist', variant: 'warning' },
      cta: { label: 'Open', href: '#ftl' },
    },
    {
      id: 'secondary-2',
      title: 'Boca Raton Corporate Campus',
      location: 'Boca Raton, FL',
      sector: 'Commercial',
      status: { label: 'On Track', variant: 'success' },
      cta: { label: 'Open', href: '#boca' },
    },
    {
      id: 'secondary-3',
      title: 'Jupiter Inlet Marina Renovation',
      location: 'Jupiter, FL',
      sector: 'Marine',
      status: { label: 'On Track', variant: 'success' },
      isStale: true,
      cta: { label: 'Open', href: '#jup' },
    },
  ],
};

const sparseModel: ProjectSpotlightSurfaceModel = {
  heading: 'Project Spotlight',
  featured: {
    id: 'sparse-featured',
    title: 'Riverside Infrastructure Upgrade',
    summary:
      'Initial mobilization underway. Additional details will be published as the project team is assembled.',
  },
  secondary: [],
};

const noRailModel: ProjectSpotlightSurfaceModel = {
  ...fullModel,
  secondary: [],
};

const wrapStyle: React.CSSProperties = { maxWidth: 1200 };
const mobileWrapStyle: React.CSSProperties = { maxWidth: 420 };

export const Default: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcProjectSpotlightSurface model={fullModel} />
    </div>
  ),
};

export const Sparse: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcProjectSpotlightSurface model={sparseModel} />
    </div>
  ),
};

export const NoRail: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcProjectSpotlightSurface model={noRailModel} />
    </div>
  ),
};

export const Mobile: Story = {
  render: () => (
    <div style={mobileWrapStyle}>
      <HbcProjectSpotlightSurface model={fullModel} />
    </div>
  ),
};
