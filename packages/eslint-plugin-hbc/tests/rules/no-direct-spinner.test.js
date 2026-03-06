/**
 * Tests for no-direct-spinner rule (D-06)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/no-direct-spinner');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
});

describe('no-direct-spinner', () => {
  it('detects direct spinner usage', () => {
    tester.run('no-direct-spinner', rule, {
      valid: [
        { code: "<WorkspacePageShell isLoading={true} layout='list'>Content</WorkspacePageShell>;" },
        { code: "<div>Loading...</div>;" },
      ],
      invalid: [
        {
          code: "<HbcSpinner label='Loading...' />;",
          errors: [{ messageId: 'noDirectSpinner' }],
        },
        {
          code: "<Spinner size='large' />;",
          errors: [{ messageId: 'noDirectSpinner' }],
        },
      ],
    });
  });
});
