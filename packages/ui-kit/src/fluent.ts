/**
 * @hbc/ui-kit/fluent
 *
 * Fluent UI passthrough adapters — controlled re-exports that enforce the
 * no-direct-Fluent-import rule (R3 in package-relationship-map.md).
 *
 * These re-exports exist so apps can consume Fluent primitives through ui-kit
 * without adding @fluentui/* as a direct dependency. Where an HBC-branded
 * equivalent exists (HbcButton, HbcCard, HbcSpinner), prefer the HBC component.
 *
 * Naming collisions with HBC components:
 * - Fluent `Button` → prefer `HbcButton` from @hbc/ui-kit or @hbc/ui-kit/primitives
 * - Fluent `Card` → prefer `HbcCard` from @hbc/ui-kit or @hbc/ui-kit/primitives
 * - Fluent `Spinner` → prefer `HbcSpinner` from @hbc/ui-kit or @hbc/ui-kit/primitives
 *
 * @see docs/architecture/blueprint/package-relationship-map.md (Rule R3)
 * @version W01-P06
 */

export {
  FluentProvider,
  Text,
  Badge,
  Switch,
  Spinner,
  TabList,
  Tab,
  Card,
  CardHeader,
  Button,
  tokens,
} from '@fluentui/react-components';

export type { SelectTabData } from '@fluentui/react-components';
