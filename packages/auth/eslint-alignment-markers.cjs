// packages/auth/eslint-alignment-markers.cjs
// D-PH5C-08: Custom ESLint rule for alignment marker validation
// Version: 1.0
// Last Updated: 2026-03-07
// Purpose: Ensure critical files have alignment markers for audit trail & drift prevention

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce alignment markers in critical authentication files for architectural consistency',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          requiredFiles: {
            type: 'array',
            description: 'List of files that require alignment markers',
            items: { type: 'string' },
            default: [
              'src/ShellCore.tsx',
              'src/authStore.ts',
              'src/guardResolution.ts',
              'src/sessionNormalization.ts',
            ],
          },
          markerPattern: {
            type: 'string',
            description: 'Regex pattern for valid alignment markers',
            default: 'ALIGNMENT:.*(?:PH5C|D-PH5C-\\d{2})',
          },
        },
      },
    ],
  },

  create(context) {
    const sourceCode = context.sourceCode;
    const filename = context.filename;
    const options = context.options[0] || {};

    const requiredFiles = options.requiredFiles || [
      'src/ShellCore.tsx',
      'src/authStore.ts',
      'src/guardResolution.ts',
      'src/sessionNormalization.ts',
    ];

    const markerPattern = new RegExp(
      options.markerPattern || 'ALIGNMENT:.*(?:PH5C|D-PH5C-\\d{2})'
    );

    // Check if current file is in required list
    const isRequiredFile = requiredFiles.some((file) =>
      filename.endsWith(file)
    );

    if (!isRequiredFile) {
      return {};
    }

    // Check if file has alignment markers
    const comments = sourceCode.getAllComments();
    const hasAlignmentMarker = comments.some((comment) =>
      markerPattern.test(comment.value)
    );

    return {
      Program(node) {
        if (!hasAlignmentMarker) {
          context.report({
            node,
            level: 'warn',
            message: `Critical authentication file "${filename}" is missing alignment markers. ` +
              `Add comment: "// ALIGNMENT: [description] [PH5C task] [decisions]" ` +
              `See docs/reference/auth/alignment-markers.md for details.`,
          });
        }
      },
    };
  },
};
