/**
 * Tests for require-workspace-page-shell rule (D-01)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/require-workspace-page-shell');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
});

describe('require-workspace-page-shell', () => {
  it('enforces WorkspacePageShell in *Page.tsx files', () => {
    tester.run('require-workspace-page-shell', rule, {
      valid: [
        {
          code: "import { WorkspacePageShell } from '@hb-intel/ui-kit';\nexport default function DashboardPage() { return <WorkspacePageShell layout='dashboard' />; }",
          filename: 'DashboardPage.tsx',
        },
        {
          /* Non-Page files are not checked */
          code: "export default function MyComponent() { return <div />; }",
          filename: 'MyComponent.tsx',
        },
      ],
      invalid: [
        {
          code: "export default function OverviewPage() { return <div>Content</div>; }",
          filename: 'OverviewPage.tsx',
          errors: [{ messageId: 'missingShell' }],
        },
      ],
    });
  });
});
