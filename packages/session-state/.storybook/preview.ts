/**
 * Storybook preview configuration — @hbc/session-state
 * SF12-T08 — Testing Strategy
 *
 * Minimal preview — components use inline styles (no theme provider needed).
 */
import type { Preview } from '@storybook/react';

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /date$/i } },
  },
};

export default preview;
