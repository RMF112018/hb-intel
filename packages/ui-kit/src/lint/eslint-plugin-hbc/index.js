/**
 * eslint-plugin-hbc — Local ESLint plugin for HBC Design System enforcement
 * Phase 4.15 §15 — "Build Modern From Day One"
 *
 * Rule: enforce-hbc-tokens
 * Warns on hardcoded hex color string literals (#xxxxxx).
 * Use HBC design tokens from @hbc/ui-kit/theme instead.
 */
'use strict';

const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/;

/** @type {import('eslint').Rule.RuleModule} */
const enforceHbcTokens = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce usage of HBC design tokens instead of hardcoded hex color values',
      recommended: false,
    },
    schema: [],
    messages: {
      noHardcodedHex:
        'Hardcoded hex value detected. Use HBC design tokens from @hbc/ui-kit/theme instead.',
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

module.exports = {
  rules: {
    'enforce-hbc-tokens': enforceHbcTokens,
  },
};
