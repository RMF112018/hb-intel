/**
 * HbcProjectSpotlightSurface — proof-grade stories.
 *
 * Each story proves a specific behavior of the redesigned Spotlight
 * contract (layout modes, disclosure defaults, sparse-content
 * degradation, narrowest stable nested mode, rail absence). Play
 * functions drive the interactive disclosures so reviewers do not have
 * to click manually to see expanded states.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import userEvent from '@testing-library/user-event';
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

// ── Models ────────────────────────────────────────────────────────────

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
      { id: 'm3', title: 'Commissioning walkthrough', completed: false },
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
    completeness: 'full',
  },
  secondary: [
    {
      id: 'secondary-1',
      title: 'Fort Lauderdale Waterfront Residence',
      location: 'Fort Lauderdale, FL',
      sector: 'Luxury Residential',
      status: { label: 'Watchlist', variant: 'warning' },
      cta: { label: 'Open', href: '#ftl' },
      completeness: 'full',
    },
    {
      id: 'secondary-2',
      title: 'Boca Raton Corporate Campus',
      location: 'Boca Raton, FL',
      sector: 'Commercial',
      status: { label: 'On Track', variant: 'success' },
      cta: { label: 'Open', href: '#boca' },
      completeness: 'full',
    },
    {
      id: 'secondary-3',
      title: 'Jupiter Inlet Marina Renovation',
      location: 'Jupiter, FL',
      sector: 'Marine',
      status: { label: 'On Track', variant: 'success' },
      isStale: true,
      cta: { label: 'Open', href: '#jup' },
      completeness: 'partial',
    },
  ],
};

const partialModel: ProjectSpotlightSurfaceModel = {
  ...fullModel,
  featured: {
    ...fullModel.featured,
    headline: undefined,
    milestones: [{ id: 'm1', title: 'Pre-construction', completed: false }],
    teamMembers: [],
    completeness: 'partial',
  },
};

const sparseModel: ProjectSpotlightSurfaceModel = {
  heading: 'Project Spotlight',
  featured: {
    id: 'sparse-featured',
    title: 'Riverside Infrastructure Upgrade',
    summary:
      'Initial mobilization underway. Additional details will be published as the project team is assembled.',
    completeness: 'minimal',
  },
  secondary: [],
};

const noRailModel: ProjectSpotlightSurfaceModel = {
  ...fullModel,
  secondary: [],
};

// ── Wrappers ──────────────────────────────────────────────────────────

const wideWrap: React.CSSProperties = { maxWidth: 1180 };
const sharePointSectionWrap: React.CSSProperties = { maxWidth: 920 };
const compactWrap: React.CSSProperties = { maxWidth: 560 };
const minimalWrap: React.CSSProperties = { maxWidth: 380 };
const handheldWrap: React.CSSProperties = { maxWidth: 360 };

// ── Play helpers ──────────────────────────────────────────────────────

async function clickByName(
  canvasElement: HTMLElement,
  regex: RegExp,
): Promise<void> {
  const user = userEvent.setup();
  const buttons = Array.from(
    canvasElement.querySelectorAll<HTMLButtonElement>('button'),
  );
  const target = buttons.find((b) => regex.test(b.textContent ?? ''));
  if (!target) {
    throw new Error(
      `Expected a button matching ${regex} in the rendered Spotlight.`,
    );
  }
  await user.click(target);
}

// ─────────────────────────────────────────────────────────────────────
// Live-measured stories — prove the ResizeObserver-backed resolver
// picks the right mode from the surrounding container width.
// ─────────────────────────────────────────────────────────────────────

/**
 * Proves: a full editorial payload at an unconstrained ~1180px wrapper
 * resolves to `wide` via live container measurement. Details + history
 * disclosures render in their open-by-default posture.
 */
export const FullEditorial: Story = {
  name: 'Full Editorial — live-measured wide',
  render: () => (
    <div style={wideWrap}>
      <HbcProjectSpotlightSurface model={fullModel} />
    </div>
  ),
};

/**
 * Proves: a realistic SharePoint section width (~920px) resolves to
 * `medium` via live measurement, with details + history still open.
 */
export const NarrowSharePointSection: Story = {
  name: 'Narrow SharePoint Section — live-measured medium',
  render: () => (
    <div style={sharePointSectionWrap}>
      <HbcProjectSpotlightSurface model={fullModel} />
    </div>
  ),
};

/**
 * Proves: a handheld-width container (~360px) settles into `minimal`
 * from live measurement alone. No forced mode. Title, compact milestone
 * pill, and both disclosures (closed) carry recognition.
 */
export const HandheldWidth: Story = {
  name: 'Handheld Width — live-measured minimal',
  render: () => (
    <div style={handheldWrap}>
      <HbcProjectSpotlightSurface model={fullModel} />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────
// Forced-mode stories — deterministic proof of each mode's posture.
// ─────────────────────────────────────────────────────────────────────

/**
 * Proves: `wide` posture — tall hero media, overlay chips visible,
 * full milestone list open, history rail expanded by default. Premium
 * editorial density.
 */
export const ModeWide: Story = {
  name: 'Mode / Wide — details + history open by default',
  render: () => (
    <div style={wideWrap}>
      <HbcProjectSpotlightSurface model={fullModel} forceMode="wide" />
    </div>
  ),
};

/**
 * Proves: `medium` posture — balanced hero, milestones + history open,
 * summary clamp relaxed. Default SharePoint section behavior.
 */
export const ModeMedium: Story = {
  name: 'Mode / Medium — details + history open by default',
  render: () => (
    <div style={sharePointSectionWrap}>
      <HbcProjectSpotlightSurface model={fullModel} forceMode="medium" />
    </div>
  ),
};

/**
 * Proves: `compact` closed posture — image-first media reduced, details
 * disclosure CLOSED by default, history disclosure CLOSED by default.
 * The first-paint footprint is media + title + compact pill + two
 * disclosures. No headline, summary, milestone list, team strip, or
 * rail content is visible until a user acts.
 */
export const ModeCompactCollapsed: Story = {
  name: 'Mode / Compact — details + history collapsed by default',
  render: () => (
    <div style={compactWrap}>
      <HbcProjectSpotlightSurface model={fullModel} forceMode="compact" />
    </div>
  ),
};

/**
 * Proves: `minimal` posture — narrowest stable nested mode. Subordinate
 * hero (140–180px), no inline meta chips, both disclosures closed,
 * milestone list always hidden, team strip never rendered. Title +
 * compact pill + disclosures lead recognition.
 */
export const ModeMinimal: Story = {
  name: 'Mode / Minimal — narrowest stable',
  render: () => (
    <div style={minimalWrap}>
      <HbcProjectSpotlightSurface model={fullModel} forceMode="minimal" />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────
// Disclosure interaction proofs — drive the collapsed defaults open.
// ─────────────────────────────────────────────────────────────────────

/**
 * Proves: the details disclosure expands the featured body in a mode
 * where it is collapsed by default. The play function clicks
 * "Show spotlight details" and verifies the panel becomes visible.
 */
export const CompactDetailsExpanded: Story = {
  name: 'Compact — details expanded (after click)',
  render: () => (
    <div style={compactWrap}>
      <HbcProjectSpotlightSurface model={fullModel} forceMode="compact" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await clickByName(canvasElement, /Show spotlight details/i);
    const hideButton = Array.from(
      canvasElement.querySelectorAll('button'),
    ).find((b) => /Hide spotlight details/i.test(b.textContent ?? ''));
    if (!hideButton) {
      throw new Error(
        'Details disclosure did not enter the open state after click.',
      );
    }
  },
};

/**
 * Proves: the history disclosure expands the supporting rail in a mode
 * where it is collapsed by default. Rail rendering (numbered 01/02/03
 * index, tiles, footer CTA) appears under the featured slot.
 */
export const CompactHistoryExpanded: Story = {
  name: 'Compact — history expanded (after click)',
  render: () => (
    <div style={compactWrap}>
      <HbcProjectSpotlightSurface model={fullModel} forceMode="compact" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await clickByName(canvasElement, /Show past spotlights/i);
    const rail = canvasElement.querySelector('[aria-label="Additional projects"]');
    if (!rail) {
      throw new Error(
        'Expected the supporting rail to render after opening the history disclosure.',
      );
    }
  },
};

// ─────────────────────────────────────────────────────────────────────
// Content-completeness degradation proofs.
// ─────────────────────────────────────────────────────────────────────

/**
 * Proves: `completeness: 'minimal'` suppresses the headline, milestone
 * list, and team strip even in wide mode; the details region defaults
 * to closed; if nothing meaningful would reveal, the disclosure control
 * itself disappears. The surface reads as intentionally compact, not
 * under-authored.
 */
export const SparseMinimalCompleteness: Story = {
  name: 'Sparse Content — completeness "minimal"',
  render: () => (
    <div style={wideWrap}>
      <HbcProjectSpotlightSurface model={sparseModel} forceMode="wide" />
    </div>
  ),
};

/**
 * Proves: `completeness: 'partial'` trims the milestone list when it
 * would carry only one entry, while keeping the mode's default-open
 * posture and the progress pill in the essentials block.
 */
export const PartialCompleteness: Story = {
  name: 'Partial Content — completeness "partial"',
  render: () => (
    <div style={wideWrap}>
      <HbcProjectSpotlightSurface model={partialModel} forceMode="wide" />
    </div>
  ),
};

// ─────────────────────────────────────────────────────────────────────
// Rail-absence proof.
// ─────────────────────────────────────────────────────────────────────

/**
 * Proves: when `secondary` is empty, the history disclosure is not
 * rendered at all — no empty-looking "Show past spotlights (0)" button.
 */
export const NoHistoryRailless: Story = {
  name: 'No history — railless',
  render: () => (
    <div style={wideWrap}>
      <HbcProjectSpotlightSurface model={noRailModel} forceMode="wide" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const historyButton = Array.from(
      canvasElement.querySelectorAll('button'),
    ).find((b) => /past spotlights/i.test(b.textContent ?? ''));
    if (historyButton) {
      throw new Error(
        'History disclosure rendered despite empty `secondary` — rail should be absent.',
      );
    }
  },
};
