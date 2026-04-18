/**
 * Dev-harness HB Homepage tab.
 *
 * Mounts the real `HbHomepage` wrapper + shell runtime so hosted-fit
 * diagnostics can be validated through Playwright across viewport classes.
 */
import { HbHomepage } from '../../../hb-webparts/src/webparts/hbHomepage/HbHomepage.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

export function HbHomepageTab(): React.ReactNode {
  const styles = usePreviewShellStyles();

  return (
    <div className={styles.scrollContainer}>
      <section data-hbc-webpart="hb-homepage" data-hbc-testid="hb-homepage-host-root">
        <HbHomepage
          identity={{
            displayName: 'Harness Viewer',
            email: 'harness.viewer@local.test',
          }}
          siteUrl="https://example.sharepoint.com/sites/HBCentralDev"
          getGraphToken={async () => 'harness-graph-token'}
          getApiToken={async () => 'harness-api-token'}
        />
      </section>
    </div>
  );
}
