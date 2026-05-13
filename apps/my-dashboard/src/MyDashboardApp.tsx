import type { FC } from 'react';
import { MyWorkShell } from './shell/MyWorkShell.js';

export interface MyDashboardAppProps {
  spfxContext?: { pageContext: { user: { loginName: string } } };
  /** B02 token-provider seam — wired here so later prompts can hand it to a backend context without re-shaping the mount call. */
  getApiToken?: () => Promise<string>;
}

export const MyDashboardApp: FC<MyDashboardAppProps> = ({ spfxContext, getApiToken }) => {
  return (
    <div data-my-dashboard-app-root="true">
      <MyWorkShell spfxContext={spfxContext} getApiToken={getApiToken} />
    </div>
  );
};

export default MyDashboardApp;
