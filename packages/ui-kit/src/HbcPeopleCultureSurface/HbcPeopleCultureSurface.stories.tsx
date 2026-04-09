/**
 * HbcPeopleCultureSurface stories — visual proof for the signature
 * People & Culture homepage surface family. Wave 01 follow-on.
 *
 * W01r-P26: adds `PeopleCultureHomepageNarrow` that renders the
 * full model inside a ~720px SharePoint-column wrapper with
 * `variant="people-culture-homepage"`, proving the new scoped
 * refinement keeps the rail full-width below the spotlight and
 * tightens the hero + spotlight + recent list + rail rhythm.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  HbcPeopleCultureSurface,
  type PeopleCultureSurfaceModel,
} from './index.js';

const meta: Meta<typeof HbcPeopleCultureSurface> = {
  title: 'Homepage Surfaces/HbcPeopleCultureSurface',
  component: HbcPeopleCultureSurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcPeopleCultureSurface>;

const fullModel: PeopleCultureSurfaceModel = {
  heading: 'Celebrating Our People',
  kudos: {
    isEmpty: false,
    featured: {
      id: 'k-1',
      headline: 'Outstanding Safety Leadership on the Riverside Project',
      excerpt:
        'Riley led the entire crew through a complex pour with zero incidents and stayed late three nights in a row to keep the schedule on track. The whole site felt the difference.',
      recipients: [
        { id: 'p-1', name: 'Riley Brooks' },
        { id: 'p-2', name: 'Morgan Chen' },
        { id: 'p-3', name: 'Jamie Patel' },
      ],
      submittedByName: 'Casey Nguyen',
      celebrateCount: 12,
      celebrateHref: '#celebrate',
    },
    recent: [
      {
        id: 'k-2',
        headline: 'Best Quality Pour This Quarter',
        recipients: [{ id: 'p-4', name: 'Sam Rivera' }],
        submittedByName: 'Alex Kim',
        celebrateCount: 8,
      },
      {
        id: 'k-3',
        headline: 'Crew of the Month — March 2026',
        recipients: [{ id: 'p-5', name: 'Taylor Reyes' }, { id: 'p-6', name: 'Jordan Wu' }],
        submittedByName: 'Casey Nguyen',
        celebrateCount: 5,
      },
    ],
  },
  announcements: [
    { id: 'a-1', personName: 'Riley Brooks', headline: 'Promoted to Site Superintendent', type: 'promotion' },
    { id: 'a-2', personName: 'Jamie Patel', headline: 'Joining Operations team', type: 'newHire' },
    { id: 'a-3', personName: 'Morgan Chen', headline: 'Welcomed a new baby', type: 'baby' },
  ],
  celebrations: [
    { id: 'c-1', personName: 'Alex Kim', type: 'birthday', celebrationDate: '2026-04-10' },
    { id: 'c-2', personName: 'Sam Rivera', type: 'anniversary', celebrationDate: '2026-04-11', anniversaryYears: 5 },
    { id: 'c-3', personName: 'Taylor Reyes', type: 'birthday', celebrationDate: '2026-04-12' },
    { id: 'c-4', personName: 'Jordan Wu', type: 'anniversary', celebrationDate: '2026-04-14', anniversaryYears: 3 },
  ],
};

const sparseModel: PeopleCultureSurfaceModel = {
  heading: 'Celebrating Our People',
  kudos: { isEmpty: true },
  announcements: fullModel.announcements,
  celebrations: fullModel.celebrations,
};

const wrapStyle: React.CSSProperties = { maxWidth: 960 };
const homepageWrapStyle: React.CSSProperties = { maxWidth: 720 };
const mobileWrapStyle: React.CSSProperties = { maxWidth: 420 };

export const Default: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcPeopleCultureSurface
        model={fullModel}
        viewAllHref="#all"
        celebrateHref="#celebrate"
        onGiveKudos={() => {
          /* story noop */
        }}
      />
    </div>
  ),
};

export const Sparse: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcPeopleCultureSurface
        model={sparseModel}
        viewAllHref="#all"
        onGiveKudos={() => {
          /* story noop */
        }}
      />
    </div>
  ),
};

export const PeopleCultureHomepageNarrow: Story = {
  render: () => (
    <div style={homepageWrapStyle}>
      <HbcPeopleCultureSurface
        model={fullModel}
        viewAllHref="#all"
        celebrateHref="#celebrate"
        variant="people-culture-homepage"
        onGiveKudos={() => {
          /* story noop */
        }}
      />
    </div>
  ),
};

export const Mobile: Story = {
  render: () => (
    <div style={mobileWrapStyle}>
      <HbcPeopleCultureSurface
        model={fullModel}
        viewAllHref="#all"
        celebrateHref="#celebrate"
        onGiveKudos={() => {
          /* story noop */
        }}
      />
    </div>
  ),
};
