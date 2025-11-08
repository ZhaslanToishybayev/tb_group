import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../switch';

describe('Switch', () => {
  it('renders switch element', () => {
    render(<Switch />);
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders as checked when checked prop is true', () => {
    render(<Switch checked={true} onCheckedChange={() => {}} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('renders as unchecked when checked prop is false', () => {
    render(<Switch checked={false} onCheckedChange={() => {}} />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('toggles when clicked', () => {
    const handleCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={handleCheckedChange} />);
    
    fireEvent.click(screen.getByRole('switch'));
    expect(handleCheckedChange).toHaveBeenCalledWith(true);
  });

  it('forwards additional props', () => {
    render(
      <Switch 
        data-testid="custom-switch"
        id="switch-id"
      />
    );
    const switchElement = screen.getByTestId('custom-switch');
    expect(switchElement).toHaveAttribute('id', 'switch-id');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Switch disabled />);
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });
});
