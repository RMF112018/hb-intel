import * as React from 'react';
import {
  ARTICLE_SUBJECT_VALUES,
  PROJECT_STAGE_VALUES,
  SPOTLIGHT_TYPE_VALUES,
  type ArticleSubject,
  type ProjectStage,
  type PromotionPolicyResult,
  type SpotlightType,
} from '../../../data/publisherAdapter/index.js';
import {
  type ProjectLookupEntry,
  type ProjectLookupSearchFn,
} from '../../../data/publisherAdapter/projectsLookupSource.js';
import { ProjectPicker, type ProjectPickerValue } from '../ProjectPicker.js';
import {
  articleContentTypeLabel,
  articleSubjectLabel,
  destinationLabel,
  projectStageLabel,
  spotlightTypeLabel,
} from '../authorLabels.js';
import { defaultTeamHeading } from '../metadataDefaults.js';
import { ChooserGroup, Field } from '../sharedChrome/index.js';
import styles from '../article-publisher.module.css';
import {
  contentTypeOptionsForDraft,
  milestoneLegacyNotice,
  update,
  type PanelProps,
} from './draftHelpers.js';

export interface MetadataPanelProps extends PanelProps {
  readonly searchProjects?: ProjectLookupSearchFn;
  readonly promotionPolicy?: PromotionPolicyResult;
}

export function MetadataPanel({ draft, onChange, searchProjects }: MetadataPanelProps) {
  const contentTypeOptions = contentTypeOptionsForDraft(draft.ArticleContentType);
  const legacyMilestoneMessage = milestoneLegacyNotice(draft.ArticleContentType);
  const destinationReadout = destinationLabel(draft.Destination);
  const projectValue: ProjectPickerValue | null =
    draft.ProjectId && draft.ProjectName
      ? {
          projectId: draft.ProjectId,
          projectName: draft.ProjectName,
          projectLocation: draft.ProjectLocation,
        }
      : null;

  const handleProjectChange = React.useCallback(
    (entry: ProjectLookupEntry | null) => {
      if (!entry) {
        onChange({
          ...draft,
          ProjectId: undefined,
          ProjectName: undefined,
          ProjectLocation: undefined,
        });
        return;
      }
      // Opportunistically fill the team heading default the moment a
      // project is picked, so the author sees the resolved heading
      // immediately. Only fills when the heading is currently blank
      // — author-typed values are preserved.
      const headingIsBlank =
        !draft.TeamViewerTitle || draft.TeamViewerTitle.trim().length === 0;
      const nextTeamViewerTitle = headingIsBlank
        ? defaultTeamHeading(entry.projectName)
        : draft.TeamViewerTitle;
      onChange({
        ...draft,
        ProjectId: entry.projectId,
        ProjectName: entry.projectName,
        ProjectLocation: entry.projectLocation ?? draft.ProjectLocation,
        TeamViewerTitle: nextTeamViewerTitle,
      });
    },
    [draft, onChange],
  );

  // Slug, TemplateKey, TargetSiteUrl are intentionally hidden from
  // the author. Slug is system-managed at save via `resolveSlugForSave`;
  // TemplateKey is system-resolved on save via
  // `resolveTemplateKeySystemManaged`; TargetSiteUrl is derived from
  // Destination at publish time.
  return (
    <div className={styles.editorialForm}>
      <Field label="Headline">
        <input
          className={styles.input}
          value={draft.Title}
          placeholder="Give this article a headline"
          onChange={(e) => onChange(update(draft, 'Title', e.target.value))}
        />
      </Field>
      <Field
        label="Summary excerpt"
        helper="Shown in homepage cards, listings, and social previews. Lead with the outcome — one to two crisp sentences."
        counter={{ value: draft.SummaryExcerpt.length, soft: 200, hard: 280 }}
      >
        <textarea
          className={styles.textarea}
          value={draft.SummaryExcerpt}
          placeholder="One or two sentences readers will see before they open the article."
          onChange={(e) => onChange(update(draft, 'SummaryExcerpt', e.target.value))}
          maxLength={320}
        />
      </Field>

      <ChooserGroup
        label="Article type"
        value={draft.ArticleContentType}
        options={contentTypeOptions}
        getLabel={articleContentTypeLabel}
        onChange={(next) => {
          if (!next) return;
          onChange(update(draft, 'ArticleContentType', next));
        }}
      />
      {legacyMilestoneMessage && (
        <p className={styles.editorialNotice}>{legacyMilestoneMessage}</p>
      )}

      <div className={styles.editorialReadout}>
        <span className={styles.editorialReadoutLabel}>Publishes to</span>
        <span className={styles.editorialReadoutValue}>{destinationReadout}</span>
      </div>

      <ChooserGroup
        label="Spotlight type"
        value={draft.SpotlightType}
        options={SPOTLIGHT_TYPE_VALUES}
        getLabel={spotlightTypeLabel}
        onChange={(next) =>
          onChange(update(draft, 'SpotlightType', next as SpotlightType | undefined))
        }
        allowClear
        clearLabel="No spotlight"
      />
      <ChooserGroup
        label="Project stage"
        value={draft.ProjectStage}
        options={PROJECT_STAGE_VALUES}
        getLabel={projectStageLabel}
        onChange={(next) =>
          onChange(update(draft, 'ProjectStage', next as ProjectStage | undefined))
        }
        allowClear
        clearLabel="Unspecified"
      />
      <ChooserGroup
        label="Subject"
        value={draft.ArticleSubject}
        options={ARTICLE_SUBJECT_VALUES}
        getLabel={articleSubjectLabel}
        onChange={(next) =>
          onChange(update(draft, 'ArticleSubject', next as ArticleSubject | undefined))
        }
        allowClear
        clearLabel="Unspecified"
      />

      <Field label="Project">
        {searchProjects ? (
          <ProjectPicker
            value={projectValue}
            onChange={handleProjectChange}
            searchProjects={searchProjects}
          />
        ) : projectValue ? (
          // The picker is unavailable in this runtime context, but a
          // prior selection is on the row — render it read-only so
          // the author can still see what is bound. Manual ProjectId /
          // ProjectName text entry is intentionally not offered:
          // authoritative project identity belongs to the picker.
          <div className={styles.projectPickerChip} data-testid="project-picker-readonly">
            <div className={styles.projectPickerChipMain}>
              <span className={styles.projectPickerChipName}>{projectValue.projectName}</span>
              <span className={styles.projectPickerChipMeta}>
                ID {projectValue.projectId}
                {projectValue.projectLocation ? ` · ${projectValue.projectLocation}` : ''}
              </span>
            </div>
            <span className={styles.projectPickerHint}>Lookup unavailable</span>
          </div>
        ) : (
          <p className={styles.editorialNotice} role="status">
            Project lookup is unavailable in this context. Reload the Publisher in its hosted
            page so the HBCentral Projects list can be searched.
          </p>
        )}
      </Field>
    </div>
  );
}
