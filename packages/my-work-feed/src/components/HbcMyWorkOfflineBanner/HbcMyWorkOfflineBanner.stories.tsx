import type { Meta, StoryObj } from '@storybook/react';
import { HbcMyWorkOfflineBanner } from './index.js';

const meta: Meta<typeof HbcMyWorkOfflineBanner> = {
  title: 'MyWorkFeed/HbcMyWorkOfflineBanner',
  component: HbcMyWorkOfflineBanner,
};

export default meta;
type Story = StoryObj<typeof HbcMyWorkOfflineBanner>;

export const Online: Story = {
  parameters: {
    docs: { description: { story: 'Returns null when online — no visible output.' } },
  },
};

export const Offline: Story = {
  parameters: {
    docs: { description: { story: 'Offline state with last-sync indicator and queued action count.' } },
  },
};

export const ExpertWithQueue: Story = {
  parameters: {
    docs: { description: { story: 'Expert tier offline — shows full queued actions list.' } },
  },
};
