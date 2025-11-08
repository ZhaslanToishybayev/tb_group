import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders badge element', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    render(<Badge>Badge</Badge>);
    const badge = screen.getByText('Badge');
    expect(badge).toHaveClass('bg-primary');
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="secondary">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('bg-secondary');

    rerender(<Badge variant="destructive">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('bg-destructive');

    rerender(<Badge variant="outline">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('border');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('text-xs');

    rerender(<Badge size="default">Badge</Badge>);
    expect(screen.getByText('Badge')).toHaveClass('text-sm');
  });

  it('forwards additional props', () => {
    render(
      <Badge data-testid="custom-badge">
        Badge
      </Badge>
    );
    expect(screen.getByTestId('custom-badge')).toBeInTheDocument();
  });
});
