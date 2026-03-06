/**
 * Tests for no-inline-feedback rule (D-08)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/no-inline-feedback');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
});

describe('no-inline-feedback', () => {
  it('detects inline feedback components', () => {
    tester.run('no-inline-feedback', rule, {
      valid: [
        { code: "<HbcToast message='Saved' />;" },
        { code: "<HbcBanner variant='info'>Info</HbcBanner>;" },
        { code: "<div>Content</div>;" },
      ],
      invalid: [
        {
          code: "<Alert>Error occurred</Alert>;",
          errors: [{ messageId: 'noInlineFeedback' }],
        },
        {
          code: "<MessageBar>Notice</MessageBar>;",
          errors: [{ messageId: 'noInlineFeedback' }],
        },
      ],
    });
  });
});
