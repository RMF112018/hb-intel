/**
 * HbcCalendarGrid — Storybook stories
 * PH4.13 §13.5 | Blueprint §1d
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcCalendarGrid } from './index.js';
import type { CalendarDayData } from './types.js';

const sampleDays: CalendarDayData[] = [
  { date: '2026-03-02', status: 'approved', crewCount: 24 },
  { date: '2026-03-03', status: 'approved', crewCount: 22 },
  { date: '2026-03-04', status: 'submitted', crewCount: 18 },
  { date: '2026-03-05', status: 'draft', crewCount: 20 },
  { date: '2026-03-09', status: 'approved', crewCount: 26 },
  { date: '2026-03-10', status: 'approved', crewCount: 25 },
  { date: '2026-03-11', status: 'submitted', crewCount: 19 },
  { date: '2026-03-16', status: 'approved', crewCount: 30 },
  { date: '2026-03-17', status: 'draft' },
];

const meta: Meta<typeof HbcCalendarGrid> = {
  title: 'Components/HbcCalendarGrid',
  component: HbcCalendarGrid,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcCalendarGrid>;

export const Default: Story = {
  args: {
    year: 2026,
    month: 2, // March (0-indexed)
    days: [],
  },
};

export const WithData: Story = {
  args: {
    year: 2026,
    month: 2,
    days: sampleDays,
    onDayClick: (date) => console.log('Day clicked:', date),
  },
};

export const NavigateMonths: Story = {
  render: () => {
    const [year, setYear] = React.useState(2026);
    const [month, setMonth] = React.useState(2);

    const handleMonthChange = (direction: number) => {
      let newMonth = month + direction;
      let newYear = year;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setMonth(newMonth);
      setYear(newYear);
    };

    return (
      <div style={{ maxWidth: 500 }}>
        <HbcCalendarGrid
          year={year}
          month={month}
          days={sampleDays}
          onMonthChange={handleMonthChange}
          onDayClick={(date) => console.log('Day clicked:', date)}
        />
      </div>
    );
  },
};

export const Today: Story = {
  render: () => {
    const now = new Date();
    return (
      <div style={{ maxWidth: 500 }}>
        <p style={{ marginBottom: 8, fontSize: 13 }}>
          <small>Today&apos;s date is highlighted with an orange ring.</small>
        </p>
        <HbcCalendarGrid
          year={now.getFullYear()}
          month={now.getMonth()}
          days={sampleDays}
          onDayClick={(date) => console.log('Day clicked:', date)}
        />
      </div>
    );
  },
};
