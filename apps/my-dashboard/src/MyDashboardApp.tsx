import type { FC } from 'react';

export interface MyDashboardAppProps {
  spfxContext?: { pageContext: { user: { loginName: string } } };
  /** B02 token-provider seam — wired here so later prompts can hand it to a backend context without re-shaping the mount call. */
  getApiToken?: () => Promise<string>;
}

export const MyDashboardApp: FC<MyDashboardAppProps> = ({
  spfxContext: _spfxContext,
  getApiToken: _getApiToken,
}) => {
  return (
    <div data-my-dashboard-app-root="true">
      My Dashboard runtime host (B02). Shell, navigation, queue UI, and read-model wiring land in later batches.
    </div>
  );
};

export default MyDashboardApp;
