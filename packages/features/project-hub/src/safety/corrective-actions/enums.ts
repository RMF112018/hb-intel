/**
 * P3-E8-T05 Corrective actions, incidents, evidence enumerations.
 */

// -- Incident Person Role (§2.4) --------------------------------------------

export type IncidentPersonRole =
  | 'INJURED_PARTY'
  | 'WITNESS'
  | 'SUPERVISOR_ON_DUTY'
  | 'FIRST_RESPONDER';
