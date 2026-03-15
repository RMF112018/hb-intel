import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkReasonDrawer } from './index.js';

const meta: Meta<typeof HbcMyWorkReasonDrawer> = {
  title: 'MyWorkFeed/HbcMyWorkReasonDrawer',
  component: HbcMyWorkReasonDrawer,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkReasonDrawer>;

export const Standard: Story = {
  args: {
    itemId: 'work-001',
    open: true,
    onClose: () => {},
  },
};

export const Expert: Story = {
  args: {
    itemId: 'work-001',
    open: true,
    onClose: () => {},
  },
  parameters: {
    docs: { description: { story: 'Expert tier shows score, source provenance, dedupe/supersession detail.' } },
  },
};

export const WithDedupe: Story = {
  args: {
    itemId: 'work-001',
    open: true,
    onClose: () => {},
  },
  parameters: {
    docs: { description: { story: 'Item with dedupe metadata — shows merge provenance at expert tier.' } },
  },
};

export const WithSupersession: Story = {
  args: {
    itemId: 'work-001',
    open: true,
    onClose: () => {},
  },
  parameters: {
    docs: { description: { story: 'Item with supersession metadata — shows replacement context at expert tier.' } },
  },
};

export const CannotAct: Story = {
  args: {
    itemId: 'work-001',
    open: true,
    onClose: () => {},
  },
  parameters: {
    docs: { description: { story: 'Item where user cannot act — shows cannotActReason.' } },
  },
};
