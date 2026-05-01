import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccTeamAccessSurface } from '../surfaces/teamAccess/PccTeamAccessSurface';

describe('PccTeamAccessSurface preview branches', () => {
  it('renders access-manager branch with all three lanes and manager affordances', () => {
    const { container } = render(
      <PccBentoGrid>
        <PccTeamAccessSurface previewPersona="project-manager" previewHasProjectSiteAccess={true} />
      </PccBentoGrid>,
    );

    expect(container.querySelector('[data-pcc-team-access-lane="team-viewer"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane="permission-request"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane="access-manager"]')).not.toBeNull();
    expect(container.textContent).toContain('Add/search user (preview-only)');
    expect(container.textContent).toContain('Execution status: backend-gated-later');
  });

  it('renders non-manager with project access as Team Viewer only', () => {
    const { container } = render(
      <PccBentoGrid>
        <PccTeamAccessSurface previewPersona="project-team-member" previewHasProjectSiteAccess={true} />
      </PccBentoGrid>,
    );

    expect(container.querySelector('[data-pcc-team-access-lane="team-viewer"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane="permission-request"]')).toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane="access-manager"]')).toBeNull();
    expect(container.querySelector('[data-pcc-current-role]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-current-permission-template]')).not.toBeNull();
  });

  it('renders non-manager without project access as request-access entry only', () => {
    const { container } = render(
      <PccBentoGrid>
        <PccTeamAccessSurface previewPersona="viewer" previewHasProjectSiteAccess={false} />
      </PccBentoGrid>,
    );

    expect(container.querySelector('[data-pcc-team-access-lane="team-viewer"]')).toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane="permission-request"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-team-access-lane="access-manager"]')).toBeNull();
    expect(container.querySelector('[data-pcc-access-request-form]')).not.toBeNull();
    expect(container.textContent).toContain('Request access (preview-only)');
    expect(container.querySelector('[data-pcc-no-permission-change-notice]')).not.toBeNull();
    expect(container.textContent).toContain('No permission change has been executed');
  });
});
