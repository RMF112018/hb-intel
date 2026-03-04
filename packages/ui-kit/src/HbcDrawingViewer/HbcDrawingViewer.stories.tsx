/**
 * HbcDrawingViewer — Storybook stories
 * PH4.13 §13.6 | Blueprint §1d
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcDrawingViewer } from './index.js';
import type { DrawingMarkup } from './types.js';

// Using a small public-domain PDF for stories
const SAMPLE_PDF = 'https://raw.githubusercontent.com/nickmccurdy/example-pdf/main/example.pdf';

const sampleMarkups: DrawingMarkup[] = [
  {
    id: 'markup-1',
    type: 'rectangle',
    points: [
      { x: 50, y: 50 },
      { x: 200, y: 150 },
    ],
    bounds: { x: 50, y: 50, width: 150, height: 100 },
    color: '#FF4D4D',
    createdBy: 'user-1',
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'markup-2',
    type: 'arrow',
    points: [
      { x: 300, y: 80 },
      { x: 450, y: 200 },
    ],
    color: '#3B9FFF',
  },
  {
    id: 'markup-3',
    type: 'pin',
    points: [{ x: 250, y: 300 }],
    color: '#F37021',
    linkedItem: { type: 'RFI', id: 'rfi-42', label: 'RFI-042' },
  },
];

const meta: Meta<typeof HbcDrawingViewer> = {
  title: 'Components/HbcDrawingViewer',
  component: HbcDrawingViewer,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof HbcDrawingViewer>;

export const Default: Story = {
  args: {
    pdfUrl: SAMPLE_PDF,
    sheetOptions: [
      { id: 'S-101', label: 'S-101 Foundation Plan' },
      { id: 'S-102', label: 'S-102 Level 2 Framing' },
    ],
    revisionOptions: [
      { id: 'rev-3', label: 'Rev 3 (Current)' },
      { id: 'rev-2', label: 'Rev 2' },
      { id: 'rev-1', label: 'Rev 1' },
    ],
    currentSheet: 'S-101',
    currentRevision: 'rev-3',
  },
};

export const WithMarkups: Story = {
  args: {
    pdfUrl: SAMPLE_PDF,
    markups: sampleMarkups,
  },
};

export const MarkupMode: Story = {
  args: {
    pdfUrl: SAMPLE_PDF,
    enableMarkup: true,
    markups: sampleMarkups,
    onMarkupCreate: (markup) => console.log('New markup:', markup),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With sheet/revision selectors</p>
        <div style={{ height: '300px' }}>
          <HbcDrawingViewer
            pdfUrl={SAMPLE_PDF}
            sheetOptions={[
              { id: 'S-101', label: 'S-101 Foundation' },
              { id: 'S-102', label: 'S-102 Framing' },
            ]}
            revisionOptions={[
              { id: 'rev-3', label: 'Rev 3' },
              { id: 'rev-2', label: 'Rev 2' },
            ]}
            currentSheet="S-101"
            currentRevision="rev-3"
          />
        </div>
      </div>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>With markups</p>
        <div style={{ height: '300px' }}>
          <HbcDrawingViewer pdfUrl={SAMPLE_PDF} markups={sampleMarkups} />
        </div>
      </div>
    </div>
  ),
};

export const FieldMode: Story = {
  render: () => (
    <div style={{ backgroundColor: '#0F1419', height: '80vh' }}>
      <HbcDrawingViewer pdfUrl={SAMPLE_PDF} markups={sampleMarkups} />
    </div>
  ),
};

export const A11yTest: Story = {
  render: () => (
    <div>
      <p style={{ fontSize: '0.875rem', color: '#605E5C', marginBottom: '16px' }}>
        Drawing viewer toolbar buttons are keyboard accessible. Zoom controls have aria-labels.
        Markup pins have aria-describedby linking to their RFI/item labels.
      </p>
      <div style={{ height: '60vh' }}>
        <HbcDrawingViewer pdfUrl={SAMPLE_PDF} markups={sampleMarkups} />
      </div>
    </div>
  ),
};

export const TouchGestures: Story = {
  render: () => (
    <div style={{ height: '80vh' }}>
      <p style={{ padding: 12, margin: 0, fontSize: 13 }}>
        <small>Pinch to zoom, drag to pan. Click &quot;Reset&quot; to restore default view.</small>
      </p>
      <HbcDrawingViewer pdfUrl={SAMPLE_PDF} />
    </div>
  ),
};
