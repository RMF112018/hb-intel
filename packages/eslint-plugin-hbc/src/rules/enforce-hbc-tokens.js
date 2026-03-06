/**
 * Rule: enforce-hbc-tokens (D-05)
 * PH4B.11 §4b.11.1 — Component Consumption Enforcement
 *
 * Detects hardcoded hex color values (#xxxxxx) in string literals.
 * All color values must use HBC design tokens from @hb-intel/ui-kit/theme.
 *
 * Binding decision D-05: all visual tokens must come from the design system.
 * Set to 'error' in apps/, 'warn' in packages/ui-kit/ (excluding theme/).
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

/** Matches hex color patterns: #RGB, #RRGGBB, #RRGGBBAA */
const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/;

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce usage of HBC design tokens instead of hardcoded hex color values (D-05)',
      recommended: true,
    },
    schema: [],
    messages: {
      noHardcodedHex:
        'Hardcoded hex value detected. Use HBC design tokens from @hb-intel/ui-kit/theme instead (D-05).',
    },
  },
  create(context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && HEX_PATTERN.test(node.value)) {
          context.report({
            node,
            messageId: 'noHardcodedHex',
          });
        }
      },
    };
  },
};
