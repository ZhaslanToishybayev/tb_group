import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// Import components
import { Button } from '../button';
import { Input } from '../input';
import { Label } from '../label';
import { Card } from '../card';
import { Badge } from '../badge';

// Generic component tests
describe('UI Components', () => {
  describe('Button', () => {
    it('should render button element', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should render with variant classes', () => {
      render(<Button variant="secondary">Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-secondary');
    });

    it('should render with size classes', () => {
      render(<Button size="sm">Button</Button>);
      const button = screen.getByRole('button');
      expect(button.className).toContain('h-9');
    });
  });

  describe('Input', () => {
    it('should render input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with placeholder', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });
  });

  describe('Label', () => {
    it('should render label element', () => {
      render(<Label>Test Label</Label>);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render with htmlFor attribute', () => {
      render(<Label htmlFor="test-input">Test Label</Label>);
      const label = screen.getByText('Test Label');
      expect(label).toHaveAttribute('for', 'test-input');
    });
  });

  describe('Card', () => {
    it('should render card container', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render with padding by default', () => {
      render(<Card>Content</Card>);
      const card = screen.getByText('Content').parentElement;
      expect(card?.className).toContain('p-6');
    });
  });

  describe('Badge', () => {
    it('should render badge element', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('should render with variant classes', () => {
      render(<Badge variant="secondary">Badge</Badge>);
      const badge = screen.getByText('Badge');
      expect(badge.className).toContain('bg-secondary');
    });
  });
});
