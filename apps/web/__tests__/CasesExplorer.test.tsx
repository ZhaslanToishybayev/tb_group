import { render, screen } from '@testing-library/react';
import { describe, it, vi } from 'vitest';
import { expect } from '@testing-library/jest-dom';
import CasesExplorer from '@/components/cases/CasesExplorer';
import { getCases } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  getCases: vi.fn(() => Promise.resolve({
    items: [],
    nextCursor: null,
  })),
}));

describe('CasesExplorer', () => {
  it('renders without crashing', () => {
    render(<CasesExplorer />);
    expect(screen.getByText('Cases')).toBeInTheDocument();
  });
});
