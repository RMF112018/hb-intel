import type { FC } from 'react';
import { SAMPLE_WORKFLOW_ITEMS, type IWorkflowItem, type WorkflowModuleId } from '@hbc/models/pcc';
import { PccDashboardCard } from '../../layout/PccDashboardCard';
import { PccPreviewState } from '../../ui/PccPreviewState';
import type { PccProjectHomeCardProps } from './shared';
import styles from './PccProjectHome.module.css';

const READINESS_MODULES: ReadonlySet<WorkflowModuleId> = new Set([
  'startup-tasks',
  'permits',
  'required-inspections',
]);

function isReadinessItem(item: IWorkflowItem): boolean {
  return READINESS_MODULES.has(item.moduleId);
}

const ProjectReadinessBody: FC = () => {
  const items = SAMPLE_WORKFLOW_ITEMS.filter(isReadinessItem);
  return (
    <ul className={styles.list} data-pcc-project-readiness-body="">
      {items.map((item) => (
        <li
          key={item.id}
          className={styles.listRow}
          data-pcc-readiness-item-id={item.id}
          data-pcc-readiness-status={item.status}
          data-pcc-readiness-module={item.moduleId}
        >
          <div className={styles.listRowMain}>
            <span className={styles.listRowTitle}>{item.title}</span>
            <span className={styles.listRowMeta}>
              <span>{item.moduleId}</span>
              <span className={styles.listRowMetaSep}>{item.status}</span>
              {item.dueDate ? (
                <span className={styles.listRowMetaSep}>Due {item.dueDate}</span>
              ) : null}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export const PccProjectReadinessCard: FC<PccProjectHomeCardProps> = ({ state = 'preview' }) => (
  <PccDashboardCard
    footprint="standard"
    tier="tier2"
    region="operational"
    eyebrow="Readiness"
    title="Project Readiness"
  >
    {state === 'preview' ? <ProjectReadinessBody /> : <PccPreviewState state={state} />}
  </PccDashboardCard>
);

export default PccProjectReadinessCard;
