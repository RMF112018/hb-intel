import { describe, expect, it } from 'vitest';
import {
  resolveHomepageHeroBannerDaypartAt,
  resolveHomepageHeroBannerFileNameAt,
} from '../../webparts/hbSignatureHero/homepageHeroBannerTimeOfDaySelector.js';

function localDateAt(hour: number, minute: number): Date {
  const dt = new Date(2026, 3, 19, 0, 0, 0, 0);
  dt.setHours(hour, minute, 0, 0);
  return dt;
}

describe('homepageHeroBannerTimeOfDaySelector — Prompt-03 boundary contract', () => {
  it.each([
    [5, 0, 'morning', 'banner_home_7_morning.png'],
    [9, 0, 'morning', 'banner_home_7_morning.png'],
    [9, 1, 'mid-day', 'banner_home_7_mid-day.png'],
    [17, 0, 'mid-day', 'banner_home_7_mid-day.png'],
    [17, 1, 'evening', 'banner_home_7_evening.png'],
    [20, 0, 'evening', 'banner_home_7_evening.png'],
    [20, 1, 'night', 'banner_home_7_night.png'],
    [4, 59, 'night', 'banner_home_7_night.png'],
  ] as const)(
    'maps %i:%i to %s (%s)',
    (hour, minute, expectedDaypart, expectedBannerFile) => {
      const now = localDateAt(hour, minute);
      expect(resolveHomepageHeroBannerDaypartAt(now)).toBe(expectedDaypart);
      expect(resolveHomepageHeroBannerFileNameAt(now)).toBe(expectedBannerFile);
    },
  );
});
