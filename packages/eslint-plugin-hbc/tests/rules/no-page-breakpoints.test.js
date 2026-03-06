/**
 * Tests for no-page-breakpoints rule (D-09)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/no-page-breakpoints');

const tester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
});

describe('no-page-breakpoints', () => {
  it('detects manual breakpoint logic', () => {
    tester.run('no-page-breakpoints', rule, {
      valid: [
        { code: "const isMobile = useIsMobile();" },
        { code: "const isTablet = useIsTablet();" },
        { code: "const width = element.clientWidth;" },
      ],
      invalid: [
        {
          code: "const css = '@media (max-width: 768px) { }';",
          errors: [{ messageId: 'noMediaQuery' }],
        },
        {
          code: "const w = window.innerWidth;",
          errors: [{ messageId: 'noWindowSize' }],
        },
        {
          code: "const mq = window.matchMedia('(max-width: 768px)');",
          errors: [{ messageId: 'noMatchMedia' }],
        },
        {
          code: "const mq = matchMedia('(max-width: 768px)');",
          errors: [{ messageId: 'noMatchMedia' }],
        },
      ],
    });
  });
});
