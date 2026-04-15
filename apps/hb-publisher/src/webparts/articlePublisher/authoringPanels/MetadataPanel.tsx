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
import {
  ProjectPicker,
  SelectedProjectChip,
  type ProjectPickerValue,
} from '../ProjectPicker.js';
import {
  articleContentTypeLabel,
  articleSubjectLabel,
  destinationLabel,
  projectStageLabel,
  spotlightTypeLabel,
} from '../authorLabels.js';
import { defaultTeamHeading } from '../metadataDefaults.js';
import {
  ChooserGroup,
  DisclosureSection,
  ExceptionalNotice,
  Field,
} from '../sharedChrome/index.js';
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
  // Session cache for the richer project-identity fields that the
  // lookup returns but the article row does not persist today (notably
  // ProjectNumber). Keyed by ProjectId so the chip display stays in
  // sync with the currently-bound project.
  const [lookupCache, setLookupCache] = React.useState<
    Record<string, { readonly projectNumber?: string }>
  >({});
  const cachedForDraft = draft.ProjectId ? lookupCache[draft.ProjectId] : undefined;
  const projectValue: ProjectPickerValue | null =
    draft.ProjectId && draft.ProjectName
      ? {
          projectId: draft.ProjectId,
          projectName: draft.ProjectName,
          projectLocation: draft.ProjectLocation,
          projectNumber: cachedForDraft?.projectNumber,
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
      setLookupCache((prev) => ({
        ...prev,
        [entry.projectId]: { projectNumber: entry.projectNumber || undefined },
      }));
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
  //
  // Primary path carries the four first-pass decisions: bind the
  // project, name the article, write the summary, pick the article
  // type. Spotlight type, project stage, and subject are editorial
  // metadata — useful, but not default-path decisions — so they live
  // behind a disclosure that opens automatically when any of them are
  // already populated.
  const hasEditorialMetadata =
    !!draft.SpotlightType || !!draft.ProjectStage || !!draft.ArticleSubject;
  const initialMetadataOpen = React.useRef(hasEditorialMetadata).current;

  return (
    <div className={styles.editorialForm}>
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
          <div data-testid="project-picker-readonly">
            <SelectedProjectChip value={projectValue} />
            <p className={styles.projectPickerUnavailableHint} role="status">
              Lookup unavailable. Reload the Publisher in its hosted page to change
              the binding.
            </p>
          </div>
        ) : (
          <p className={styles.editorialNotice} role="status">
            Project lookup is unavailable in this context. Reload the Publisher in its hosted
            page so the HBCentral Projects list can be searched.
          </p>
        )}
      </Field>

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
        <ExceptionalNotice
          tone="warn"
          headline="Legacy milestone content type"
          hint="Pick a supported content type above to move this article off the legacy milestone posture."
          detailsLabel="Legacy-state details"
          details={legacyMilestoneMessage}
        />
      )}

      <div className={styles.editorialReadout}>
        <span className={styles.editorialReadoutLabel}>Publishes to</span>
        <span className={styles.editorialReadoutValue}>{destinationReadout}</span>
      </div>

      <DisclosureSection
        label="Editorial metadata"
        summaryHint="Spotlight type, project stage, and subject — shown in listings and filters. Optional."
        defaultOpen={initialMetadataOpen}
        testId="metadata-advanced-section"
      >
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
      </DisclosureSection>
    </div>
  );
}
