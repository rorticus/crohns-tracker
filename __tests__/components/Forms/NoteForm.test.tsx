import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NoteForm } from '@/components/Forms/NoteForm';
import { CreateNoteInput } from '@/types/entry';

describe('NoteForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render note form with all fields', () => {
    const { getByLabelText, getByText } = render(
      <NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(getByText('Log Note')).toBeDefined();
    expect(getByLabelText('Entry date')).toBeDefined();
    expect(getByLabelText('Entry time')).toBeDefined();
    expect(getByText(/category/i)).toBeDefined();
    expect(getByLabelText('Note content')).toBeDefined();
  });

  it('should display all category options', () => {
    const { getByText } = render(
      <NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    expect(getByText(/food/i)).toBeDefined();
    expect(getByText(/exercise/i)).toBeDefined();
    expect(getByText(/medication/i)).toBeDefined();
    expect(getByText(/other/i)).toBeDefined();
  });

  it('should handle category selection', async () => {
    const { getByText } = render(
      <NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const foodButton = getByText(/food/i);
    fireEvent.press(foodButton);

    // Category should be selected (visual feedback)
    await waitFor(() => {
      expect(foodButton.props.accessibilityState?.selected).toBe(true);
    });
  });

  it('should validate required content field', async () => {
    const { getByText } = render(
      <NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const saveButton = getByText('Save Note');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  it('should validate content max length (1000 characters)', async () => {
    const { getByLabelText, getByText } = render(
      <NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const contentInput = getByLabelText('Note content');
    const longContent = 'a'.repeat(1001);

    fireEvent.changeText(contentInput, longContent);

    const saveButton = getByText('Save Note');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText(/cannot exceed 1000 characters/i)).toBeDefined();
    });
  });

  it('should call onSubmit with valid note data', async () => {
    const { getByLabelText, getByText } = render(
      <NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const dateInput = getByLabelText('Entry date');
    const timeInput = getByLabelText('Entry time');
    const contentInput = getByLabelText('Note content');

    fireEvent.changeText(dateInput, '2025-10-25');
    fireEvent.changeText(timeInput, '14:30');

    const foodCategory = getByText(/food/i);
    fireEvent.press(foodCategory);

    fireEvent.changeText(contentInput, 'Had a salad for lunch');

    const saveButton = getByText('Save Note');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          date: '2025-10-25',
          time: '14:30',
          category: 'food',
          content: 'Had a salad for lunch',
        })
      );
    });
  });

  it('should handle tags input', async () => {
    const { getByLabelText, getByText } = render(
      <NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const tagsInput = getByLabelText(/tags/i);
    fireEvent.changeText(tagsInput, 'lunch, healthy, fiber');

    const saveButton = getByText('Save Note');

    // Also fill required fields
    const contentInput = getByLabelText('Note content');
    fireEvent.changeText(contentInput, 'Salad with spinach');
    const foodCategory = getByText(/food/i);
    fireEvent.press(foodCategory);

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: 'lunch, healthy, fiber',
        })
      );
    });
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <NoteForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const cancelButton = getByText('Cancel');
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should populate form with initial data', () => {
    const initialData: Partial<CreateNoteInput> = {
      date: '2025-10-25',
      time: '12:00',
      category: 'exercise',
      content: 'Morning run',
      tags: 'cardio, outdoor',
    };

    const { getByLabelText, getByText } = render(
      <NoteForm initialData={initialData} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );

    const dateInput = getByLabelText('Entry date');
    const timeInput = getByLabelText('Entry time');
    const contentInput = getByLabelText('Note content');
    const tagsInput = getByLabelText(/tags/i);

    expect(dateInput.props.value).toBe('2025-10-25');
    expect(timeInput.props.value).toBe('12:00');
    expect(contentInput.props.value).toBe('Morning run');
    expect(tagsInput.props.value).toBe('cardio, outdoor');
  });
});
