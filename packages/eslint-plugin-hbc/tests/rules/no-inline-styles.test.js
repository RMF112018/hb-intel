/**
 * Tests for no-inline-styles rule (D-10)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/no-inline-styles');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
});

describe('no-inline-styles', () => {
  it('detects inline style props', () => {
    tester.run('no-inline-styles', rule, {
      valid: [
        { code: "<div className={styles.root} />;" },
        { code: "<HbcCard />;" },
        { code: "<div data-testid='test' />;" },
      ],
      invalid: [
        {
          code: "<div style={{ color: 'red' }} />;",
          errors: [{ messageId: 'noInlineStyle' }],
        },
        {
          code: "<span style={{ padding: '8px' }}>text</span>;",
          errors: [{ messageId: 'noInlineStyle' }],
        },
      ],
    });
  });
});
