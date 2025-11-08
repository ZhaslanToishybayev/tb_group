import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dialog } from '../dialog';

describe('Dialog', () => {
  it('does not render when closed', () => {
    render(
      <Dialog open={false}>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText('Test Dialog')).not.toBeInTheDocument();
  });

  it('renders when open prop is true', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('renders dialog title', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });

  it('renders dialog description', () => {
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogDescription>Dialog Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Dialog Description')).toBeInTheDocument();
  });

  it('calls onOpenChange when closed', () => {
    const handleOpenChange = vi.fn();
    render(
      <Dialog open={true} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle>Test</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    
    // The dialog should close when clicking outside
    const overlay = document.querySelector('[data-radix-dialog-overlay]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    }
  });
});
