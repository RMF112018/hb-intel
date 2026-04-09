/**
 * HbcEditorialSurface Stories — Visual proof for the executive editorial
 * presentation-lane surface family used by Leadership Message.
 *
 * W01r-P17: stories exercise the new nameplate masthead, quote-framed
 * featured block, signature, archive rail, and footer strip.
 *
 * W01r-P23: adds `ExecutiveLeadershipNarrow` story that renders the
 * surface with `variant="leadership"` inside a ~540px SharePoint-column
 * wrapper, proving the narrow-section refinement tightens the
 * masthead → featured → archive → footer rhythm while preserving the
 * executive editorial register. The default `Executive` story and all
 * wider-section consumers stay on the original scale.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcEditorialSurface } from './index.js';
import { Briefcase } from 'lucide-react';

const meta: Meta<typeof HbcEditorialSurface> = {
  title: 'Homepage Surfaces/HbcEditorialSurface',
  component: HbcEditorialSurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcEditorialSurface>;

const wrapStyle: React.CSSProperties = { maxWidth: 820 };
const narrowSectionWrapStyle: React.CSSProperties = { maxWidth: 540 };
const mobileWrapStyle: React.CSSProperties = { maxWidth: 420 };

export const Executive: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcEditorialSurface
        title="Leadership Message"
        icon={Briefcase}
        mastheadEyebrow="From Leadership"
        archiveHref="#leadership-archive"
        archiveTitle="From the archive"
        featured={{
          eyebrow: 'Message of the week',
          title: 'Building With Discipline',
          excerpt:
            'Our focus this month is execution quality and proactive field communication. Every closeout we deliver on schedule is a promise kept to our clients, our trade partners, and each other.',
          leaderName: 'Alex Carter',
          leaderRole: 'Chief Operating Officer',
          publishDate: '2026-04-07',
          cta: { label: 'Read the full note', href: '#note' },
        }}
        items={[
          {
            id: 'a1',
            title: 'April field priorities',
            meta: 'Alex Carter  ·  April 5, 2026',
            href: '#a1',
          },
          {
            id: 'a2',
            title: 'Q1 financial summary',
            meta: 'Maya Reeves, CFO  ·  April 3, 2026',
            href: '#a2',
          },
          {
            id: 'a3',
            title: 'Benefits enrollment now open',
            meta: 'HR Team  ·  April 1, 2026',
            href: '#a3',
          },
        ]}
      />
    </div>
  ),
};

export const ExecutiveWithMedia: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcEditorialSurface
        title="Leadership Message"
        icon={Briefcase}
        mastheadEyebrow="From Leadership"
        archiveHref="#leadership-archive"
        featured={{
          eyebrow: 'A note from the CEO',
          title: 'Building for the Next Decade',
          excerpt:
            'As we enter Q2, I want to share our strategic vision for sustained growth and how each of you plays a critical role in achieving our goals across all regions.',
          leaderName: 'Jordan Pierce',
          leaderRole: 'Chief Executive Officer',
          publishDate: '2026-04-07',
          mediaImage: {
            src: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
            alt: 'Leadership gathering',
          },
          cta: { label: 'Read the full message', href: '#ceo-note' },
        }}
        items={[
          { id: 'a1', title: 'Q1 operational review', meta: 'April 5, 2026', href: '#a1' },
          { id: 'a2', title: 'Safety recognition awards', meta: 'April 2, 2026', href: '#a2' },
        ]}
      />
    </div>
  ),
};

export const SparseFeaturedOnly: Story = {
  render: () => (
    <div style={wrapStyle}>
      <HbcEditorialSurface
        title="Leadership Message"
        icon={Briefcase}
        mastheadEyebrow="From Leadership"
        archiveHref="#leadership-archive"
        featured={{
          eyebrow: 'Field note',
          title: 'Stay aligned on schedule discipline',
          excerpt: 'A short reminder that safety-first decisions always outweigh the clock.',
          leaderName: 'Alex Carter',
          leaderRole: 'Chief Operating Officer',
          publishDate: '2026-04-06',
          cta: { label: 'Read note', href: '#note' },
        }}
      />
    </div>
  ),
};

export const ExecutiveLeadershipNarrow: Story = {
  render: () => (
    <div style={narrowSectionWrapStyle}>
      <HbcEditorialSurface
        title="Leadership Message"
        icon={Briefcase}
        mastheadEyebrow="From Leadership"
        archiveHref="#leadership-archive"
        archiveTitle="From the archive"
        variant="leadership"
        featured={{
          eyebrow: 'Message of the week',
          title: 'Building With Discipline',
          excerpt:
            'Our focus this month is execution quality and proactive field communication. Every closeout we deliver on schedule is a promise kept to our clients, our trade partners, and each other.',
          leaderName: 'Alex Carter',
          leaderRole: 'Chief Operating Officer',
          publishDate: '2026-04-07',
          cta: { label: 'Read the full note', href: '#note' },
        }}
        items={[
          {
            id: 'a1',
            title: 'April field priorities',
            meta: 'Alex Carter  ·  April 5, 2026',
            href: '#a1',
          },
          {
            id: 'a2',
            title: 'Q1 financial summary',
            meta: 'Maya Reeves, CFO  ·  April 3, 2026',
            href: '#a2',
          },
          {
            id: 'a3',
            title: 'Benefits enrollment now open',
            meta: 'HR Team  ·  April 1, 2026',
            href: '#a3',
          },
        ]}
      />
    </div>
  ),
};

export const Mobile: Story = {
  render: () => (
    <div style={mobileWrapStyle}>
      <HbcEditorialSurface
        title="Leadership Message"
        icon={Briefcase}
        mastheadEyebrow="From Leadership"
        archiveHref="#leadership-archive"
        featured={{
          eyebrow: 'Message of the week',
          title: 'Building With Discipline',
          excerpt:
            'Our focus this month is execution quality and proactive field communication.',
          leaderName: 'Alex Carter',
          leaderRole: 'Chief Operating Officer',
          publishDate: '2026-04-07',
          cta: { label: 'Read the full note', href: '#note' },
        }}
        items={[
          { id: 'a1', title: 'April field priorities', meta: 'Alex Carter  ·  April 5, 2026', href: '#a1' },
          { id: 'a2', title: 'Q1 financial summary', meta: 'Maya Reeves, CFO  ·  April 3, 2026', href: '#a2' },
        ]}
      />
    </div>
  ),
};
