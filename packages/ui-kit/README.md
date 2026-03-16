# @hbc/ui-kit

## Storybook Development

All @hbc/ui-kit components are documented in Storybook with visual and accessibility testing.

### Starting Storybook

```bash
pnpm --filter @hbc/ui-kit storybook
```

Opens Storybook at [http://localhost:6006](http://localhost:6006)

### Mock Authentication in Storybook

Auth-dependent components automatically receive a mock authenticated user context. This is configured
via the global `withMockAuth` decorator in `.storybook/preview.tsx`.

**Mock User Details:**
- **Name:** HB Dev User
- **Email:** dev.user@hbcorp.com
- **Roles:** Estimator, ProjectManager
- **ID:** storybook-dev-user-001

The mock user is only available in Storybook; it is **not** exported from @hbc/ui-kit and
is **not** included in production builds.

### Adding New Stories

When creating a story for an auth-dependent component:

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { HbcAppShell } from './index';

const meta: Meta<typeof HbcAppShell> = {
  component: HbcAppShell,
  title: 'Components/HbcAppShell',
};

export default meta;
type Story = StoryObj<typeof HbcAppShell>;

export const Default: Story = {
  // No auth mocking needed — global decorator handles it
  render: () => <HbcAppShell>{/* content */}</HbcAppShell>,
};
```

The `withMockAuth` decorator automatically initializes auth state, so components that call
auth hooks (`useCurrentUser()`, `useResolvedRuntimeMode()`, `usePermission()`) receive mock data.

### Testing Role-Specific Behavior

To test stories with different roles (e.g., FieldUser), update the Storybook mock persona wiring in:
- `.storybook/mockAuth.ts`
- `.storybook/decorators/withMockAuth.tsx`

### Accessibility Testing

Storybook includes the Axe accessibility addon. For every new component:

1. Write stories covering all visual states (light, field, disabled, etc.)
2. Open Storybook and navigate to the component
3. Addons panel -> Accessibility
4. Verify 0 critical and 0 serious violations
5. Commit stories alongside component code

See `PH4C.8` (Verification & Testing) for full A11y sweep requirements.

### Building Storybook Static Site

To generate a static Storybook build:

```bash
pnpm --filter @hbc/ui-kit build-storybook
# Output: packages/ui-kit/storybook-static/
```

## Contribution Governance (WS1-T12)

These rules prevent standards drift after the WS1 production scrub closes.

1. **New reusable UI primitives belong in `@hbc/ui-kit`.** Any component intended for use in more than one feature package must be proposed as a kit addition, not created as a local duplicate.

2. **Visual standards apply to all application UI.** Every new feature-specific UI component — regardless of package — must meet density compliance, field readability, accessibility, and token compliance standards.

3. **Kit additions require review.** New kit components must include: Storybook story, accessibility review, density compliance, token compliance, and a README entry before merge.

4. **Feature packages do not own reusable primitives.** When a feature-local component becomes a candidate for kit promotion (used in 2+ features), it must be promoted via a kit PR, not copied across feature packages.

5. **No hardcoded visual values.** No component may use hardcoded color values, font sizes, or spacing values. All visual values must reference kit design tokens. Enforced by `@hbc/eslint-plugin-hbc/enforce-hbc-tokens`.

6. **Accessibility is not optional in any layer.** New components must meet WCAG AA keyboard, ARIA, and contrast requirements from T09 before merge.

See `docs/reference/ui-kit/UI-Kit-Usage-and-Composition-Guide.md` for detailed contribution guidance.

## Architecture References

- `docs/architecture/adr/ADR-0075-dev-auth-bypass-storybook-boundary.md` — MockAdapter boundary
- `packages/ui-kit/.storybook/mockAuth.ts` — Mock user configuration
- `packages/ui-kit/.storybook/decorators/withMockAuth.tsx` — Decorator implementation
