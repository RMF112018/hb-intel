/**
 * Tests for enforce-hbc-tokens rule (D-05)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/enforce-hbc-tokens');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

describe('enforce-hbc-tokens', () => {
  it('detects hardcoded hex values', () => {
    tester.run('enforce-hbc-tokens', rule, {
      valid: [
        { code: "const color = tokens.colorBrandBackground;" },
        { code: "const url = 'https://example.com';" },
        { code: "const id = 'abc123';" },
      ],
      invalid: [
        {
          code: "const color = '#FF0000';",
          errors: [{ messageId: 'noHardcodedHex' }],
        },
        {
          code: "const bg = '#003366';",
          errors: [{ messageId: 'noHardcodedHex' }],
        },
        {
          code: "const border = '#ccc';",
          errors: [{ messageId: 'noHardcodedHex' }],
        },
      ],
    });
  });
});
