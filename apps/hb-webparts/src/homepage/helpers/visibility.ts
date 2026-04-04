export function isVisibleForAudience(
  allowedAudiences: string[] | undefined,
  activeAudience: string | undefined,
): boolean {
  if (!allowedAudiences || allowedAudiences.length === 0) {
    return true;
  }

  if (!activeAudience) {
    return false;
  }

  return allowedAudiences.includes(activeAudience);
}
