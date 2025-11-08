# Performance & Accessibility Guide

## 📋 Overview

This document outlines the performance optimizations and accessibility features implemented in the TB Group Base Stack to ensure a fast, inclusive, and user-friendly experience.

## 🎯 Performance Targets

### Core Web Vitals
- **Largest Contentful Paint (LCP)**: < 2.5 seconds
- **First Input Delay (FID)**: < 100 milliseconds
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Speed Index**: < 3.4 seconds
- **Time to Interactive (TTI)**: < 3.8 seconds

### Lighthouse Scores
- **Performance**: ≥ 90
- **Accessibility**: ≥ 90 (WCAG 2.1 AA)
- **Best Practices**: ≥ 90
- **SEO**: ≥ 85

## ⚡ Performance Optimizations

### 1. Code Splitting & Lazy Loading

#### Dynamic Imports
```typescript
// Load components only when needed
const ServicesSection = lazy(() => import('../components/sections/ServicesSection'));
const CaseStudiesSection = lazy(() => import('../components/sections/CaseStudiesSection'));
```

#### Route-based Splitting
- Next.js automatically splits code by pages
- Each route loads only necessary JavaScript
- Reduces initial bundle size

### 2. Image Optimization

#### Using Next.js Image Component
```typescript
import Image from 'next/image';

<Image
  src="/hero-image.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // Load critical images first
  placeholder="blur"
  blurDataURL="data:image/jpeg..."
/>
```

#### Best Practices
- Use WebP format for better compression
- Implement responsive images with `srcSet`
- Lazy load non-critical images
- Optimize images before deployment

### 3. Bundle Optimization

#### Bundle Analysis Script
```bash
# Run the performance audit
node scripts/performance-audit.js

# Analyze bundle size
npm run build
npx lighthouse http://localhost:3000 --output html
```

#### Optimization Strategies
- **Tree Shaking**: Remove unused code
- **Code Splitting**: Split code into smaller chunks
- **Dynamic Imports**: Load modules on demand
- **Dependency Optimization**: Avoid duplicate dependencies

### 4. Caching Strategies

#### HTTP Caching
```javascript
// Configure caching in next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

#### Browser Caching
```typescript
// Cache API responses
import { caching } from '../lib/performance';

const data = await caching.getCachedResponse('services');
if (!data) {
  data = await fetchServices();
  caching.cacheResponse('services', data);
}
```

### 5. Performance Monitoring

#### Web Vitals Monitoring
```typescript
import { webVitals } from '../lib/performance';

const vitals = webVitals.measureWebVitals();

vitals.LCP().then((score) => console.log('LCP:', score));
vitals.FID().then((score) => console.log('FID:', score));
vitals.CLS().then((score) => console.log('CLS:', score));
```

#### Performance Observer
```typescript
import { performanceMonitoring } from '../lib/performance';

// Observe performance metrics
const cleanup = performanceMonitoring.observeMetrics();

// Cleanup on unmount
useEffect(() => cleanup, []);
```

## ♿ Accessibility (WCAG 2.1 AA)

### 1. Keyboard Navigation

#### Focus Management
```typescript
import { focusManager } from '../lib/accessibility';

// Trap focus in modal
useEffect(() => {
  if (isOpen) {
    const cleanup = focusManager.trapFocus(modalRef.current);
    return cleanup;
  }
}, [isOpen]);
```

#### Skip Links
```typescript
import { SkipLink } from '../lib/accessibility';

export default function Layout({ children }) {
  return (
    <>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <main id="main-content">{children}</main>
    </>
  );
}
```

### 2. ARIA Attributes

#### Button with State
```typescript
<button
  aria-expanded={isExpanded}
  aria-controls="services-list"
  onClick={() => setIsExpanded(!isExpanded)}
>
  Services
</button>
<div id="services-list" aria-hidden={!isExpanded}>
  {/* Content */}
</div>
```

#### Live Regions
```typescript
import { aria } from '../lib/accessibility';

aria.announce('Service saved successfully', 'polite');
aria.announce('Error occurred', 'assertive');
```

### 3. Color Contrast

#### Checking Contrast Ratios
```typescript
import { colorContrast } from '../lib/accessibility';

const ratio = colorContrast.getContrastRatio('#ffffff', '#000000');
const meetsAA = colorContrast.meetsWCAGAA(ratio);
const meetsAAA = colorContrast.meetsWCAGAAA(ratio);

console.log('Contrast ratio:', ratio.toFixed(2));
console.log('Meets WCAG AA:', meetsAA);
```

#### Color Palette with Validated Contrast
```css
:root {
  /* Primary blue with 4.5:1 contrast */
  --color-primary: #3b82f6;
  --color-primary-contrast: #ffffff;

  /* Secondary with 7:1 contrast */
  --color-secondary: #1e40af;
  --color-secondary-contrast: #ffffff;

  /* Success with 4.5:1 contrast */
  --color-success: #10b981;
  --color-success-contrast: #000000;
}
```

### 4. Reduced Motion Support

#### Using useReducedMotion Hook
```typescript
import { useReducedMotion } from '../hooks/useReducedMotion';

const Component = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0.2 } : { duration: 0.6 }}
    >
      Content
    </motion.div>
  );
};
```

#### CSS Media Query
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 5. Semantic HTML

#### Proper Heading Hierarchy
```html
<main>
  <h1>Main Heading</h1>
  <section>
    <h2>Section Heading</h2>
    <h3>Subsection Heading</h3>
  </section>
</main>
```

#### Form Labels
```typescript
<label htmlFor="email">Email Address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-invalid={hasError}
  aria-describedby={hasError ? 'email-error' : undefined}
/>
{hasError && (
  <span id="email-error" role="alert">
    Please enter a valid email
  </span>
)}
```

## 🧪 Testing

### 1. Accessibility Testing

#### Automated Testing with axe
```typescript
import { render } from '@testing-library/react';
import { axe } from '@axe-core/react';

test('should not have accessibility violations', async () => {
  const { container } = render(<ServicesSection services={mockServices} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### Manual Testing Checklist
- [ ] Tab through entire page
- [ ] Use arrow keys for carousel navigation
- [ ] Test screen reader navigation
- [ ] Verify color contrast with tools (e.g., WebAIM Contrast Checker)
- [ ] Check keyboard-only navigation flow

### 2. Performance Testing

#### Lighthouse CI
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run audits
lhci autorun

# View report
open ./lighthouse-report.html
```

#### WebPageTest
- Test from multiple locations
- Analyze waterfall charts
- Check Core Web Vitals
- Review opportunities for improvement

### 3. Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS)
- Chrome Mobile (Android)

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run full performance audit
- [ ] Verify all Lighthouse scores meet thresholds
- [ ] Test accessibility with screen reader
- [ ] Check color contrast compliance
- [ ] Verify reduced motion works
- [ ] Test keyboard navigation
- [ ] Validate HTML
- [ ] Check meta tags and SEO

### Performance Budgets
- **JavaScript**: < 500KB gzipped
- **CSS**: < 100KB gzipped
- **Images**: Optimize and compress
- **Fonts**: Preload critical fonts
- **Total Bundle**: < 1MB gzipped

## 📊 Monitoring

### Performance Monitoring Tools
- **Web Vitals**: Track Core Web Vitals in production
- **Lighthouse CI**: Automate performance audits
- **Bundle Analyzer**: Identify large dependencies
- **SpeedCurve**: Monitor real-user performance

### Accessibility Monitoring
- **axe DevTools**: Browser extension for testing
- **WAVE**: Web accessibility evaluation tool
- **Color Contrast Analyzer**: Desktop app for contrast checking

## 📚 Resources

### Performance
- [Core Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/going-to-production)
- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse/overview/)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [axe Accessibility Testing](https://www.deque.com/axe/)

## 🔧 Tools

### Development
- `@lhci/cli` - Lighthouse CI
- `axe-core/react` - Accessibility testing
- `eslint-plugin-jsx-a11y` - ESLint accessibility rules
- `@next/bundle-analyzer` - Bundle size analysis

### Design
- Stark (Figma/Sketch plugin for accessibility)
- Color Oracle (Color blindness simulator)
- WebAIM Contrast Checker

## 📈 Continuous Improvement

1. **Monitor**: Track performance metrics in production
2. **Audit**: Run monthly accessibility audits
3. **Test**: Automate tests in CI/CD pipeline
4. **Update**: Keep dependencies and tools up to date
5. **Educate**: Train team on accessibility best practices

---

## 🎯 Summary

This project implements comprehensive performance and accessibility features:

✅ **Performance Optimizations**
- Code splitting and lazy loading
- Image optimization
- Bundle size analysis
- Caching strategies
- Performance monitoring

✅ **Accessibility Features**
- Keyboard navigation
- Screen reader support
- ARIA attributes
- Color contrast compliance
- Reduced motion support

✅ **Testing & Monitoring**
- Automated testing with axe
- Lighthouse CI integration
- Web Vitals monitoring
- Multi-browser testing

Following these guidelines ensures a fast, inclusive, and user-friendly experience for all users.
