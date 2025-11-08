import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText('Enter your name')).toBeInTheDocument();
  });

  it('renders with custom value', () => {
    render(<Input value="Test value" onChange={() => {}} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Test value');
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards additional props', () => {
    render(
      <Input 
        data-testid="custom-input"
        id="custom-id"
        name="custom-name"
      />
    );
    
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('id', 'custom-id');
    expect(input).toHaveAttribute('name', 'custom-name');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('renders with custom className', () => {
    render(<Input className="custom-input-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input-class');
  });

  it('renders with different types', () => {
    const { rerender } = render(<Input type="password" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'password');

    rerender(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');
  });
});
