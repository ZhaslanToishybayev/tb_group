import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from '../card';

describe('Card', () => {
  it('renders card container', () => {
    render(
      <Card>
        <div>Card content</div>
      </Card>
    );
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders with padding by default', () => {
    render(
      <Card>
        <div>Content</div>
      </Card>
    );
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('p-6');
  });

  it('renders without padding when noPadding prop is true', () => {
    render(
      <Card noPadding>
        <div>Content</div>
      </Card>
    );
    const card = screen.getByText('Content').parentElement;
    expect(card).not.toHaveClass('p-6');
  });

  it('renders with custom className', () => {
    render(
      <Card className="custom-card-class">
        <div>Content</div>
      </Card>
    );
    const card = screen.getByText('Content').parentElement;
    expect(card).toHaveClass('custom-card-class');
  });

  it('forwards additional props', () => {
    render(
      <Card data-testid="custom-card">
        <div>Content</div>
      </Card>
    );
    expect(screen.getByTestId('custom-card')).toBeInTheDocument();
  });
});
