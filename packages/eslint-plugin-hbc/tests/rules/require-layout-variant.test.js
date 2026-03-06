/**
 * Tests for require-layout-variant rule (D-02)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/require-layout-variant');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
});

describe('require-layout-variant', () => {
  it('requires layout prop on WorkspacePageShell', () => {
    tester.run('require-layout-variant', rule, {
      valid: [
        { code: "<WorkspacePageShell layout='dashboard'>Content</WorkspacePageShell>;" },
        { code: "<WorkspacePageShell layout='list' title='Items'>Content</WorkspacePageShell>;" },
        { code: "<div>Not a shell</div>;" },
      ],
      invalid: [
        {
          code: "<WorkspacePageShell title='Dashboard'>Content</WorkspacePageShell>;",
          errors: [{ messageId: 'missingLayout' }],
        },
        {
          code: "<WorkspacePageShell>Content</WorkspacePageShell>;",
          errors: [{ messageId: 'missingLayout' }],
        },
      ],
    });
  });
});
