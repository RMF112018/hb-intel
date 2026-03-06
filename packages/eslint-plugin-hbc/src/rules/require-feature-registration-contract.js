/**
 * Rule: require-feature-registration-contract (Phase 5.9)
 *
 * Disallow direct protected-feature access wiring calls from app code.
 * Protected features must be declared via centralized registration contracts
 * and consumed through shared guard/hook APIs.
 *
 * @type {import('eslint').Rule.RuleModule}
 */
'use strict';

const BLOCKED_METHODS = new Set([
  'hasFeatureAccess',
  'getFeatureAccess',
  'registerFeature',
  'setFeatureRegistrations',
]);

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require centralized protected feature registration contract usage (PH5.9 Option C).',
      recommended: true,
    },
    schema: [],
    messages: {
      requireContract:
        'Do not wire protected feature access directly with {{method}}(). Use centralized protected feature registration contracts and shared guard/hook APIs (PH5.9).',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          BLOCKED_METHODS.has(node.callee.property.name)
        ) {
          context.report({
            node,
            messageId: 'requireContract',
            data: { method: node.callee.property.name },
          });
        }
      },
    };
  },
};
