export const addBusinessDays = (startIso: string, businessDays: number): string => {
  const current = new Date(startIso);
  let added = 0;

  while (added < businessDays) {
    current.setUTCDate(current.getUTCDate() + 1);
    const day = current.getUTCDay();
    if (day !== 0 && day !== 6) {
      added += 1;
    }
  }

  return current.toISOString();
};

export const isBusinessDayOverdue = (dueAtIso: string, currentAtIso: string): boolean =>
  new Date(currentAtIso).getTime() > new Date(dueAtIso).getTime();
