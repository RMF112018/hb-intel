export type TimeOfDayGreeting = 'Good morning' | 'Good afternoon' | 'Good evening';

export function resolveGreetingForHour(hour24: number): TimeOfDayGreeting {
  if (hour24 >= 5 && hour24 < 12) {
    return 'Good morning';
  }

  if (hour24 >= 12 && hour24 < 18) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

export function resolveGreetingAt(date: Date): TimeOfDayGreeting {
  return resolveGreetingForHour(date.getHours());
}
