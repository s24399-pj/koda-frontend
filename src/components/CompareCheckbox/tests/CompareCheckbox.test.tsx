import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import CompareCheckbox from '../CompareCheckbox';

describe('CompareCheckbox', () => {
  const mockOnToggle = vi.fn();

  const defaultProps = {
    offerId: 'offer-123',
    isSelected: false,
    isDisabled: false,
    onToggle: mockOnToggle,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders checkbox and label', () => {
    render(<CompareCheckbox {...defaultProps} />);

    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(screen.getByText('Dodaj do porównania')).toBeInTheDocument();
  });

  test('sets correct id and htmlFor attributes', () => {
    render(<CompareCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Dodaj do porównania');

    expect(checkbox).toHaveAttribute('id', 'compare-offer-123');
    expect(label).toHaveAttribute('for', 'compare-offer-123');
  });

  test('shows "Dodaj do porównania" when not selected', () => {
    render(<CompareCheckbox {...defaultProps} isSelected={false} />);

    expect(screen.getByText('Dodaj do porównania')).toBeInTheDocument();
    expect(screen.queryByText('Dodano do porównania')).not.toBeInTheDocument();
  });

  test('shows "Dodano do porównania" when selected', () => {
    render(<CompareCheckbox {...defaultProps} isSelected={true} />);

    expect(screen.getByText('Dodano do porównania')).toBeInTheDocument();
    expect(screen.queryByText('Dodaj do porównania')).not.toBeInTheDocument();
  });

  test('checkbox is checked when isSelected is true', () => {
    render(<CompareCheckbox {...defaultProps} isSelected={true} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('checkbox is unchecked when isSelected is false', () => {
    render(<CompareCheckbox {...defaultProps} isSelected={false} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  test('checkbox is not disabled when isDisabled is false', () => {
    render(<CompareCheckbox {...defaultProps} isDisabled={false} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeDisabled();
  });

  test('checkbox is disabled when isDisabled is true and not selected', () => {
    render(<CompareCheckbox {...defaultProps} isDisabled={true} isSelected={false} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  test('checkbox is not disabled when isDisabled is true but selected', () => {
    render(<CompareCheckbox {...defaultProps} isDisabled={true} isSelected={true} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeDisabled();
  });

  test('calls onToggle with correct parameters when checked', async () => {
    const user = userEvent.setup();
    render(<CompareCheckbox {...defaultProps} isSelected={false} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('offer-123', true);
  });

  test('calls onToggle with correct parameters when unchecked', async () => {
    const user = userEvent.setup();
    render(<CompareCheckbox {...defaultProps} isSelected={true} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith('offer-123', false);
  });

  test('calls onToggle when label is clicked', async () => {
    const user = userEvent.setup();
    render(<CompareCheckbox {...defaultProps} />);

    const label = screen.getByText('Dodaj do porównania');
    await user.click(label);

    expect(mockOnToggle).toHaveBeenCalledWith('offer-123', true);
  });

  test('does not call onToggle when disabled checkbox is clicked', async () => {
    const user = userEvent.setup();
    render(<CompareCheckbox {...defaultProps} isDisabled={true} isSelected={false} />);

    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  test('stops propagation on container click', () => {
    const mockParentClick = vi.fn();
    const { container } = render(
      <div onClick={mockParentClick}>
        <CompareCheckbox {...defaultProps} />
      </div>
    );

    const compareCheckbox = container.querySelector('.compare-checkbox')!;
    fireEvent.click(compareCheckbox);

    expect(mockParentClick).not.toHaveBeenCalled();
  });

  test('renders with correct CSS class', () => {
    const { container } = render(<CompareCheckbox {...defaultProps} />);

    const compareCheckbox = container.querySelector('.compare-checkbox');
    expect(compareCheckbox).toBeInTheDocument();
  });

  test('handles different offer IDs correctly', () => {
    render(<CompareCheckbox {...defaultProps} offerId="different-offer-456" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'compare-different-offer-456');
  });

  test('maintains accessibility relationship between label and checkbox', () => {
    render(<CompareCheckbox {...defaultProps} offerId="test-offer" />);

    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Dodaj do porównania');

    expect(checkbox).toHaveAttribute('id', 'compare-test-offer');
    expect(label).toHaveAttribute('for', 'compare-test-offer');
  });

  test('works correctly with keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<CompareCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();

    await user.keyboard(' ');

    expect(mockOnToggle).toHaveBeenCalledWith('offer-123', true);
  });

  test('does not respond to keyboard when disabled', async () => {
    const user = userEvent.setup();
    render(<CompareCheckbox {...defaultProps} isDisabled={true} isSelected={false} />);

    const checkbox = screen.getByRole('checkbox');
    checkbox.focus();

    await user.keyboard(' ');

    expect(mockOnToggle).not.toHaveBeenCalled();
  });

  test('handles edge case with empty offerId', () => {
    render(<CompareCheckbox {...defaultProps} offerId="" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'compare-');
  });

  test('handles special characters in offerId', () => {
    render(<CompareCheckbox {...defaultProps} offerId="offer-123@#$%^" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('id', 'compare-offer-123@#$%^');
  });

  test('maintains state consistency across re-renders', () => {
    const { rerender } = render(<CompareCheckbox {...defaultProps} isSelected={false} />);

    expect(screen.getByText('Dodaj do porównania')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();

    rerender(<CompareCheckbox {...defaultProps} isSelected={true} />);

    expect(screen.getByText('Dodano do porównania')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  test('correctly handles disabled state transitions', () => {
    const { rerender } = render(
      <CompareCheckbox {...defaultProps} isDisabled={false} isSelected={false} />
    );

    expect(screen.getByRole('checkbox')).not.toBeDisabled();

    rerender(<CompareCheckbox {...defaultProps} isDisabled={true} isSelected={false} />);
    expect(screen.getByRole('checkbox')).toBeDisabled();

    rerender(<CompareCheckbox {...defaultProps} isDisabled={true} isSelected={true} />);
    expect(screen.getByRole('checkbox')).not.toBeDisabled();
  });

  test('passes through all checkbox functionality', async () => {
    const user = userEvent.setup();
    render(<CompareCheckbox {...defaultProps} />);

    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).toHaveProperty('type', 'checkbox');
    expect(checkbox).toHaveProperty('checked', false);

    await user.click(checkbox);
    expect(mockOnToggle).toHaveBeenCalledWith('offer-123', true);
  });

  test('prevents event bubbling on both click and change', () => {
    const mockContainerClick = vi.fn();
    const mockDocumentClick = vi.fn();

    document.addEventListener('click', mockDocumentClick);

    const { container } = render(
      <div onClick={mockContainerClick}>
        <CompareCheckbox {...defaultProps} />
      </div>
    );

    const compareDiv = container.querySelector('.compare-checkbox')!;
    const checkbox = screen.getByRole('checkbox');

    fireEvent.click(compareDiv);
    fireEvent.change(checkbox, { target: { checked: true } });

    expect(mockContainerClick).not.toHaveBeenCalled();
    expect(mockDocumentClick).not.toHaveBeenCalled();

    document.removeEventListener('click', mockDocumentClick);
  });
});
