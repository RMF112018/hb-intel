/**
 * Daily Log Module Config — PH4.13 §13.7
 * Blueprint §1d — Daily construction log / field reports
 */

/** Collapsible form sections for Daily Log create/edit */
export const dailyLogSections = [
  { id: 'general', label: 'General Information', collapsible: false },
  { id: 'weather', label: 'Weather Conditions', collapsible: true },
  { id: 'manpower', label: 'Manpower & Crew', collapsible: true },
  { id: 'work', label: 'Work Performed', collapsible: true },
  { id: 'materials', label: 'Materials Received', collapsible: true },
  { id: 'safety', label: 'Safety & Incidents', collapsible: true },
  { id: 'notes', label: 'General Notes', collapsible: true },
] as const;

/** Fields that support voice dictation input */
export const dailyLogVoiceFields = ['generalNotes'] as const;
