import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from '../textarea';

describe('Textarea', () => {
  it('renders textarea element', () => {
    render(<Textarea />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Textarea placeholder="Enter your message" />);
    expect(screen.getByPlaceholderText('Enter your message')).toBeInTheDocument();
  });

  it('renders with custom value', () => {
    render(<Textarea value="Test value" onChange={() => {}} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Test value');
  });

  it('handles onChange event', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'new value' } });
    
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('forwards additional props', () => {
    render(
      <Textarea 
        data-testid="custom-textarea"
        id="custom-id"
        name="custom-name"
        rows={5}
      />
    );
    
    const textarea = screen.getByTestId('custom-textarea');
    expect(textarea).toHaveAttribute('id', 'custom-id');
    expect(textarea).toHaveAttribute('name', 'custom-name');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('renders with custom className', () => {
    render(<Textarea className="custom-textarea-class" />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveClass('custom-textarea-class');
  });
});
