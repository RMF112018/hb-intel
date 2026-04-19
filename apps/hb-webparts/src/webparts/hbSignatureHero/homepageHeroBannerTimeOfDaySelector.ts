/**
 * Homepage hero default-banner daypart selector.
 *
 * Contract (local system time):
 * - 5:00 AM through 9:00 AM  => morning
 * - 9:01 AM through 5:00 PM  => mid-day
 * - 5:01 PM through 8:00 PM  => evening
 * - 8:01 PM through 4:59 AM  => night
 */

export type HomepageHeroBannerDaypart =
  | 'morning'
  | 'mid-day'
  | 'evening'
  | 'night';

export const HOMEPAGE_HERO_BANNER_FILE_BY_DAYPART: Record<
  HomepageHeroBannerDaypart,
  string
> = {
  morning: 'banner_home_7_morning.png',
  'mid-day': 'banner_home_7_mid-day.png',
  evening: 'banner_home_7_evening.png',
  night: 'banner_home_7_night.png',
};

export function resolveHomepageHeroBannerDaypartAt(
  now: Date,
): HomepageHeroBannerDaypart {
  const minutes = now.getHours() * 60 + now.getMinutes();
  const morningStart = 5 * 60; // 5:00 AM
  const morningEnd = 9 * 60; // 9:00 AM
  const midDayStart = 9 * 60 + 1; // 9:01 AM
  const midDayEnd = 17 * 60; // 5:00 PM
  const eveningStart = 17 * 60 + 1; // 5:01 PM
  const eveningEnd = 20 * 60; // 8:00 PM

  if (minutes >= morningStart && minutes <= morningEnd) {
    return 'morning';
  }
  if (minutes >= midDayStart && minutes <= midDayEnd) {
    return 'mid-day';
  }
  if (minutes >= eveningStart && minutes <= eveningEnd) {
    return 'evening';
  }
  return 'night';
}

export function resolveHomepageHeroBannerFileNameAt(now: Date): string {
  return HOMEPAGE_HERO_BANNER_FILE_BY_DAYPART[resolveHomepageHeroBannerDaypartAt(now)];
}
