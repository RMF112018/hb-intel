/**
 * ESLint rule stub: enforce-hbc-tokens
 * PH4.3 §3 — Warns on hardcoded hex color values; use HBC design tokens instead.
 * Stub only — will be wired into active ESLint config in Phase 8 CI integration.
 */

const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/;

interface RuleMeta {
  type: string;
  docs: { description: string; recommended: boolean };
  schema: never[];
  messages: Record<string, string>;
}

interface RuleModule {
  meta: RuleMeta;
  create(context: {
    report(descriptor: { node: unknown; messageId: string }): void;
  }): Record<string, (node: { value: unknown }) => void>;
}

const rule: RuleModule = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce usage of HBC design tokens instead of hardcoded hex color values',
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

export default rule;
