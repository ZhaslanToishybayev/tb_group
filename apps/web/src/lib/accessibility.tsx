// Accessibility utilities for WCAG 2.1 AA compliance

/**
 * Focus management utilities
 */
export const focusManager = {
  // Get focusable elements within a container
  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(container.querySelectorAll<HTMLElement>(focusableSelectors));
  },

  // Trap focus within a container (for modals)
  trapFocus(container: HTMLElement) {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },

  // Set focus to element
  setFocus(element: HTMLElement | string) {
    const target = typeof element === 'string' ? document.querySelector<HTMLElement>(element) : element;
    target?.focus();
  },
};

/**
 * ARIA utilities
 */
export const aria = {
  // Announce message to screen readers
  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  // Manage expanded state
  setExpanded(element: HTMLElement, isExpanded: boolean) {
    element.setAttribute('aria-expanded', isExpanded.toString());
  },

  // Manage selected state
  setSelected(element: HTMLElement, isSelected: boolean) {
    element.setAttribute('aria-selected', isSelected.toString());
  },

  // Set pressed state for toggle buttons
  setPressed(element: HTMLElement, isPressed: boolean) {
    element.setAttribute('aria-pressed', isPressed.toString());
  },
};

/**
 * Keyboard navigation utilities
 */
export const keyboardNav = {
  // Handle arrow key navigation in lists/menus
  handleArrowKeys(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    orientation: 'horizontal' | 'vertical' = 'vertical'
  ) {
    const { key } = event;

    if (key !== 'ArrowUp' && key !== 'ArrowDown' && key !== 'ArrowLeft' && key !== 'ArrowRight') {
      return currentIndex;
    }

    event.preventDefault();

    if (orientation === 'vertical' && (key === 'ArrowUp' || key === 'ArrowDown')) {
      if (key === 'ArrowUp') {
        return currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      } else {
        return currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      }
    } else if (orientation === 'horizontal' && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      if (key === 'ArrowLeft') {
        return currentIndex > 0 ? currentIndex - 1 : items.length - 1;
      } else {
        return currentIndex < items.length - 1 ? currentIndex + 1 : 0;
      }
    }

    return currentIndex;
  },

  // Handle Enter and Space key activation
  handleActivation(event: KeyboardEvent, callback: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  },
};

/**
 * Color contrast utilities
 */
export const colorContrast = {
  // Calculate relative luminance
  getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  // Calculate contrast ratio between two colors
  getContrastRatio(hex1: string, hex2: string): number {
    const rgb1 = this.hexToRgb(hex1);
    const rgb2 = this.hexToRgb(hex2);

    if (!rgb1 || !rgb2) return 0;

    const lum1 = this.getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.getLuminance(rgb2.r, rgb2.g, rgb2.b);

    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);

    return (brightest + 0.05) / (darkest + 0.05);
  },

  // Convert hex to RGB
  hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  },

  // Check if contrast ratio meets WCAG AA standard
  meetsWCAGAA(contrastRatio: number, isLargeText: boolean = false): boolean {
    return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
  },

  // Check if contrast ratio meets WCAG AAA standard
  meetsWCAGAAA(contrastRatio: number, isLargeText: boolean = false): boolean {
    return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
  },
};

/**
 * Skip link component
 */
export const SkipLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
  >
    {children}
  </a>
);

/**
 * Screen reader only text
 */
export const ScreenReaderOnly = ({ children }: { children: React.ReactNode }) => (
  <span className="sr-only">{children}</span>
);
