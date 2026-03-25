/**
 * Tests for enforce-hbc-tokens rule (D-05)
 * PH4B.11 §4b.11.1
 */
'use strict';

const { describe, it } = require('node:test');
const { RuleTester } = require('eslint');
const rule = require('../../src/rules/enforce-hbc-tokens');

const tester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: { ecmaVersion: 2022, sourceType: 'module', ecmaFeatures: { jsx: true } },
});

describe('enforce-hbc-tokens', () => {
  it('detects hardcoded style literals in style-bearing contexts only', () => {
    tester.run('enforce-hbc-tokens', rule, {
      valid: [
        {
          code: "const styles = makeStyles({ root: { gap: `${HBC_SPACE_MD}px`, color: tokens.colorNeutralForeground1 } });",
        },
        {
          code: "const inlineStyle: CSSProperties = { gap: tokenizedGap, color: themeColor };",
        },
        {
          code: "const ui = <div style={{ gap: `${HBC_SPACE_SM}px`, color: tokens.colorBrandForeground1 }} />;",
        },
        { code: "const url = 'https://example.com';" },
        { code: "const message = '#FF0000 should not be treated as a style literal here';" },
      ],
      invalid: [
        {
          code: "const styles = makeStyles({ root: { color: '#FF0000' } });",
          errors: [{ messageId: 'noHardcodedHex' }],
        },
        {
          code: "const styles = makeStyles({ root: { backgroundColor: 'rgb(255, 0, 0)' } });",
          errors: [{ messageId: 'noHardcodedRgb' }],
        },
        {
          code: "const layout = makeStyles({ root: { gap: '12px', gridTemplateColumns: 'repeat(2, minmax(280px, 1fr))' } });",
          errors: [{ messageId: 'noHardcodedPixel' }, { messageId: 'noHardcodedPixel' }],
        },
        {
          code: "const style: CSSProperties = { gap: 16, marginTop: '24px' };",
          errors: [{ messageId: 'noHardcodedPixel' }, { messageId: 'noHardcodedPixel' }],
        },
        {
          code: "const ui = <div style={{ paddingLeft: 18, color: 'rgba(0, 0, 0, 0.5)' }} />;",
          errors: [{ messageId: 'noHardcodedPixel' }, { messageId: 'noHardcodedRgb' }],
        },
      ],
    });
  });
});
