/**
 * Thin bridge that renders the shared `HbcPeoplePicker` in bare mode
 * inside the kudos composer bucket layout. Converts between the
 * Kudos draft shape (`string[]` of UPNs) and the picker's
 * `PersonEntry[]`.
 *
 * Maintains a local person cache so selected chips show display names,
 * givenName/surname, and photo URLs rather than raw UPN strings after
 * the PersonEntry[] → string[] → PersonEntry[] round-trip.
 */
import * as React from 'react';
import { HbcPeoplePicker } from '../../HbcPeoplePicker/index.js';
import type {
  PersonEntry,
  PeopleSearchFn,
  PersonPhotoFn,
} from '../../HbcPeoplePicker/types.js';
import formStyles from '../styles/form.module.css';
import { BUCKET_CONFIG } from './bucketConfig.js';

export interface SharedPickerBridgeProps {
  values: string[];
  onChange: (next: string[]) => void;
  onDisplayMapChange?: (map: Record<string, string>) => void;
  onPhotoMapChange?: (map: Record<string, string>) => void;
  disabled: boolean;
  searchPeople: PeopleSearchFn;
  fetchPersonPhoto?: PersonPhotoFn;
  errorMessage?: string;
}

export function SharedPickerBridge({
  values,
  onChange,
  onDisplayMapChange,
  onPhotoMapChange,
  disabled,
  searchPeople,
  fetchPersonPhoto,
  errorMessage,
}: SharedPickerBridgeProps): React.JSX.Element {
  const BucketIcon = BUCKET_CONFIG.individualEmails.icon;

  const personCacheRef = React.useRef<Map<string, PersonEntry>>(new Map());

  const pickerValue = React.useMemo<PersonEntry[]>(
    () =>
      values.filter(Boolean).map((upn) => {
        const cached = personCacheRef.current.get(upn.toLowerCase());
        if (cached) return cached;
        return { upn, displayName: upn };
      }),
    [values],
  );

  const handlePickerChange = React.useCallback(
    (people: PersonEntry[]) => {
      for (const p of people) {
        personCacheRef.current.set(p.upn.toLowerCase(), p);
      }
      onChange(people.map((p) => p.upn));
      if (onDisplayMapChange) {
        const map: Record<string, string> = {};
        for (const p of people) {
          map[p.upn] = p.displayName || p.upn;
        }
        onDisplayMapChange(map);
      }
      if (onPhotoMapChange) {
        const map: Record<string, string> = {};
        for (const p of people) {
          if (p.photoUrl) map[p.upn] = p.photoUrl;
        }
        onPhotoMapChange(map);
      }
    },
    [onChange, onDisplayMapChange, onPhotoMapChange],
  );

  return (
    <div className={formStyles.field}>
      <label className={formStyles.label}>
        Recipients <span className={formStyles.requiredMark}>*</span>
      </label>
      <div className={formStyles.pickerContainer}>
        <div className={formStyles.bucket}>
          <div className={formStyles.bucketLabel}>
            <BucketIcon
              size={12}
              strokeWidth={2.2}
              aria-hidden="true"
              className={formStyles.bucketLabelIcon}
            />
            People
          </div>
          <HbcPeoplePicker
            label="People"
            value={pickerValue}
            onChange={handlePickerChange}
            searchPeople={searchPeople}
            fetchPersonPhoto={fetchPersonPhoto}
            mode="multi"
            disabled={disabled}
            placeholder="Who are you giving kudos to? Type to search..."
            validationMessage={errorMessage}
            bare
          />
        </div>
      </div>
      <div className={formStyles.hint}>
        Search by name or email. Select from results.
      </div>
    </div>
  );
}
