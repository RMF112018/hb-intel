/**
 * Tests for no-manual-nav-active rule (D-04)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/no-manual-nav-active');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

describe('no-manual-nav-active', () => {
  it('detects setActiveNavItem calls', () => {
    tester.run('no-manual-nav-active', rule, {
      valid: [
        { code: "const active = useActiveNavItem();" },
        { code: "setOtherThing('foo');" },
      ],
      invalid: [
        {
          code: "setActiveNavItem('dashboard');",
          errors: [{ messageId: 'noManualNav' }],
        },
        {
          code: "nav.setActiveNavItem('dashboard');",
          errors: [{ messageId: 'noManualNav' }],
        },
      ],
    });
  });
});
