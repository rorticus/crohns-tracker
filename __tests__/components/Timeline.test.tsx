import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { TimelineComponent } from '@/components/Timeline/TimelineComponent';
import { Entry, BowelMovement, Note } from '@/types/entry';

describe('TimelineComponent', () => {
  const mockEntries: Array<Entry & { bowelMovement?: BowelMovement; note?: Note }> = [
    {
      id: 1,
      type: 'bowel_movement',
      date: '2025-10-25',
      time: '09:00',
      timestamp: '2025-10-25T09:00:00.000Z',
      createdAt: '2025-10-25T09:00:00.000Z',
      updatedAt: '2025-10-25T09:00:00.000Z',
      bowelMovement: {
        id: 1,
        entryId: 1,
        consistency: 4,
        urgency: 2,
        notes: 'Morning routine',
      },
    },
    {
      id: 2,
      type: 'note',
      date: '2025-10-25',
      time: '08:00',
      timestamp: '2025-10-25T08:00:00.000Z',
      createdAt: '2025-10-25T08:00:00.000Z',
      updatedAt: '2025-10-25T08:00:00.000Z',
      note: {
        id: 1,
        entryId: 2,
        category: 'food',
        content: 'Had oatmeal for breakfast',
        tags: 'breakfast,fiber',
      },
    },
    {
      id: 3,
      type: 'bowel_movement',
      date: '2025-10-25',
      time: '14:30',
      timestamp: '2025-10-25T14:30:00.000Z',
      createdAt: '2025-10-25T14:30:00.000Z',
      updatedAt: '2025-10-25T14:30:00.000Z',
      bowelMovement: {
        id: 2,
        entryId: 3,
        consistency: 5,
        urgency: 3,
        notes: undefined,
      },
    },
  ];

  it('should render timeline with multiple entries', () => {
    render(<TimelineComponent entries={mockEntries} />);

    expect(screen.getAllByTestId('timeline-item')).toHaveLength(3);
  });

  it('should display entries in chronological order (earliest first)', () => {
    render(<TimelineComponent entries={mockEntries} />);

    const items = screen.getAllByTestId('timeline-item');
    // First item should be the earliest entry (08:00)
    expect(items[0]).toHaveTextContent('08:00');
    expect(items[1]).toHaveTextContent('09:00');
    expect(items[2]).toHaveTextContent('14:30');
  });

  it('should display bowel movement entry with consistency and urgency', () => {
    render(<TimelineComponent entries={mockEntries.slice(0, 1)} />);

    expect(screen.getByText(/consistency/i)).toBeDefined();
    expect(screen.getByText(/urgency/i)).toBeDefined();
  });

  it('should display note entry with category and content', () => {
    render(<TimelineComponent entries={mockEntries.slice(1, 2)} />);

    expect(screen.getByText(/food/i)).toBeDefined();
    expect(screen.getByText(/oatmeal/i)).toBeDefined();
  });

  it('should handle empty entries array', () => {
    render(<TimelineComponent entries={[]} />);

    expect(screen.getByTestId('empty-timeline')).toBeDefined();
  });

  it('should optimize rendering for large lists with FlatList', () => {
    const largeEntrySet = Array.from({ length: 100 }, (_, i) => ({
      ...mockEntries[0],
      id: i + 1,
      timestamp: `2025-10-25T${String(i % 24).padStart(2, '0')}:00:00.000Z`,
    }));

    const { getByTestId } = render(<TimelineComponent entries={largeEntrySet} />);

    // Should use FlatList component
    expect(getByTestId('timeline-flatlist')).toBeDefined();
  });
});
