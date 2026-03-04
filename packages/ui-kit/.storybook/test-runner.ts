/**
 * Storybook test-runner configuration — PH4.17
 * Integrates axe-playwright for WCAG 2.2 AA automated testing in CI.
 * Runs on every story: injects axe in preVisit, checks a11y in postVisit.
 */
import type { TestRunnerConfig } from '@storybook/test-runner';
import { injectAxe, checkA11y } from 'axe-playwright';

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page);
  },
  async postVisit(page) {
    await checkA11y(page, '#storybook-root', {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'],
        },
      },
    });
  },
};

export default config;
