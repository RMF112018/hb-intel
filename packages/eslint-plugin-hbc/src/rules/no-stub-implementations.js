/**
 * @hb-intel/hbc/no-stub-implementations
 * PH7.13 — Stub Detection and Incomplete Implementation Enforcement
 *
 * Detects throw statements whose Error message matches a stub/not-implemented
 * pattern, indicating an unimplemented function body.
 *
 * Escape hatch: precede the throw with a line comment containing
 *   "stub-approved:" followed by a non-empty reason.
 *
 * @see docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md
 * @see docs/architecture/adr/0095-stub-detection-enforcement-standard.md
 */
'use strict';

const STUB_PATTERN = /not.?implement|stub|placeholder|todo\s*:/i;

/**
 * Returns true if the node has a leading comment containing "stub-approved:"
 * with a non-empty reason on the same or immediately preceding line.
 */
function hasStubApprovedComment(node, sourceCode) {
  const comments = sourceCode.getCommentsBefore(node);
  return comments.some((c) => {
    const text = c.value.trim();
    const match = text.match(/stub-approved:\s*(.+)/i);
    return match && match[1].trim().length > 0;
  });
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow throw statements whose message indicates an unimplemented stub',
      category: 'HBC Quality',
      recommended: true,
      url: 'docs/architecture/plans/ph7-remediation/PH7.13-Stub-Detection-Enforcement.md',
    },
    schema: [],
    messages: {
      stubThrow:
        'Stub implementation detected: "{{msg}}". Implement the function or add ' +
        '// stub-approved: <reason> above this line.',
    },
  },

  create(context) {
    const sourceCode = context.getSourceCode();

    return {
      ThrowStatement(node) {
        // Only inspect throws whose argument is a `new Error(...)` call
        if (
          node.argument?.type !== 'NewExpression' ||
          node.argument.callee?.name !== 'Error'
        ) {
          return;
        }

        const args = node.argument.arguments;
        if (!args || args.length === 0) return;

        const firstArg = args[0];
        // Get the string value of the error message (string literal or template literal)
        let msg = null;
        if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
          msg = firstArg.value;
        } else if (firstArg.type === 'TemplateLiteral') {
          msg = firstArg.quasis.map((q) => q.value.cooked).join('');
        }

        if (!msg || !STUB_PATTERN.test(msg)) return;

        // Escape hatch: stub-approved comment on the preceding line
        if (hasStubApprovedComment(node, sourceCode)) return;

        context.report({
          node,
          messageId: 'stubThrow',
          data: { msg },
        });
      },
    };
  },
};
