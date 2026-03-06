/**
 * Tests for no-raw-form-elements rule (D-07)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/no-raw-form-elements');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
});

describe('no-raw-form-elements', () => {
  it('detects raw HTML form elements', () => {
    tester.run('no-raw-form-elements', rule, {
      valid: [
        { code: "<HbcTextField label='Name' />;" },
        { code: "<HbcSelect options={options} />;" },
        { code: "<div>Content</div>;" },
      ],
      invalid: [
        {
          code: "<input type='text' />;",
          errors: [{ messageId: 'noRawFormElement' }],
        },
        {
          code: "<select><option>A</option></select>;",
          errors: [{ messageId: 'noRawFormElement' }],
        },
        {
          code: "<textarea rows={4} />;",
          errors: [{ messageId: 'noRawFormElement' }],
        },
      ],
    });
  });
});
