import { LockKeyhole } from 'lucide-react';
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export interface LimitedModeWorkspaceNoticeProps {
  readonly writeBlockMessage: string;
  readonly managerReadPathProven: boolean;
}

export function LimitedModeWorkspaceNotice(
  props: LimitedModeWorkspaceNoticeProps,
): React.ReactNode {
  return (
    <section role="status" className={shell.limitedModeWorkspaceNotice} aria-label="Limited mode">
      <div className={shell.limitedModeNoticeIcon} aria-hidden>
        <LockKeyhole size={22} />
      </div>
      <div>
        <p className={f.guidanceKicker}>Designed limited mode</p>
        <h3 className={f.sectionTitle}>API approval is required before this workspace can read, write, or sync live content.</h3>
        <p className={shell.limitedModeCopy}>
          The Manager still shows the intended homepage lane structure so marketing admins can understand where Project Spotlight,
          Company Pulse, and Leadership Message will be managed after tenant API access is approved.
        </p>
        <p className={shell.limitedModeSubcopy}>
          Read path proven: {props.managerReadPathProven ? 'yes' : 'not yet'}. Write and placement actions are unavailable:
          {' '}{props.writeBlockMessage}.
        </p>
      </div>
    </section>
  );
}
