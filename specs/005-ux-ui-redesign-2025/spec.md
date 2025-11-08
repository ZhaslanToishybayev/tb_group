# UX/UI Redesign 2025 - TB Group Corporate Website

## 📋 Общая информация

- **Проект**: TB Group Corporate Website Redesign
- **Версия**: v2.0.0
- **Дата**: 02.11.2025
- **Статус**: Новая спецификация (обновленная)
- **Базируется на**: Spec 004-website-design-improvements

## 🎯 Цели и видение

Трансформировать TB Group корпоративный веб-сайт из стандартного бизнес-сайта в визуально потрясающий, высокоинтерактивный опыт, используя современные тренды дизайна 2025 года.

**Ключевые метрики успеха:**
- Увеличение вовлеченности пользователей на **+40%**
- Рост конверсии на **+25%**
- Время загрузки **<2 секунды**
- Lighthouse Performance Score **>95**
- WCAG 2.1 AA соответствие

## 🔍 Анализ текущего состояния

### ✅ Сильные стороны:
- Next.js 14 + TypeScript архитектура
- Темная тема (slate-950)
- Framer Motion анимации
- Адаптивный дизайн
- Docker контейнеризация

### ❌ Проблемные области:
- Статичные, неинтерактивные компоненты
- Ограниченная визуальная иерархия
- Отсутствие микро-взаимодействий
- Устаревшая типографика
- Слабая видимость CTA
- Отсутствие иконографии
- Нет particle эффектов или 3D элементов

## 🎨 Дизайн-система 2025

### Цветовая палитра

#### Основные цвета:
```css
--color-primary-blue: #3b82f6 → #2563eb (градиент)
--color-secondary-purple: #8b5cf6
--color-accent-cyan: #00f5ff
--color-accent-magenta: #ff00ff
--color-accent-lime: #ccff00
```

#### Нейтральные:
```css
--color-slate-900: #0f172a
--color-slate-950: #020617
--color-text-primary: #ffffff
--color-text-secondary: #94a3b8
```

#### Семантические:
```css
--color-success: #10b981
--color-warning: #f59e0b
--color-error: #ef4444
```

### Типографика

#### Шрифты:
- **Primary**: Inter (weights: 400, 500, 600, 700, 800)
- **Monospace**: JetBrains Mono (для кода/данных)

#### Шкала размеров:
```css
--text-xs: 12px
--text-sm: 14px
--text-base: 16px
--text-lg: 18px
--text-xl: 24px
--text-2xl: 32px
--text-3xl: 48px
--text-4xl: 64px
```

### Пространственная система

```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-6: 24px
--space-8: 32px
--space-12: 48px
--space-16: 64px
--space-24: 96px
```

### Анимации

#### Временные рамки:
- **Микро**: 200ms
- **Стандарт**: 300ms
- **Страница**: 600ms

#### Easing:
```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

#### Варианты анимаций:
- `fadeIn`, `fadeOut`
- `slideUp`, `slideDown`, `slideLeft`, `slideRight`
- `scale`, `scaleUp`, `scaleDown`
- `rotate`, `rotateY`, `rotateX`
- `stagger` (для списков)

## 🏗️ Архитектура компонентов

### 1. Design System Foundation

#### Tailwind Config Extensions:
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: { /* расширенная палитра */ },
        neon: {
          cyan: '#00f5ff',
          magenta: '#ff00ff',
          lime: '#ccff00'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite'
      }
    }
  }
}
```

#### Animation Variants:
```typescript
// variants.ts
export const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

#### Design Utilities:
```css
/* Glassmorphism */
.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Neumorphism */
.neu {
  background: #1e293b;
  box-shadow:
    20px 20px 60px #0f172a,
    -20px -20px 60px #2e3a4f;
}

/* Gradients */
.gradient-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.gradient-neon {
  background: linear-gradient(135deg, #00f5ff 0%, #ff00ff 50%, #ccff00 100%);
}
```

### 2. Core UI Components

#### Button Variants:
- `primary` - основная кнопка с градиентом
- `secondary` - вторичная контурная
- `ghost` - прозрачная с hover эффектом
- `neon` - неоновая с glow эффектом
- `gradient` - полноцветный градиент
- `icon-only` - только иконка

#### Card Components:
```typescript
// AnimatedCard.tsx
interface AnimatedCardProps {
  hoverEffect: 'lift' | 'glow' | 'tilt' | 'rotate';
  children: React.ReactNode;
}

export const AnimatedCard: FC<AnimatedCardProps> = ({ hoverEffect }) => {
  return (
    <motion.div
      className="card"
      whileHover={{
        scale: hoverEffect === 'lift' ? 1.05 : 1,
        rotateY: hoverEffect === 'rotate' ? 5 : 0,
        boxShadow: hoverEffect === 'glow' ? '0 0 30px rgba(59, 130, 246, 0.5)' : 'none'
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
};
```

#### Interactive Input:
```typescript
// FloatingLabelInput.tsx
export const FloatingLabelInput: FC = () => {
  return (
    <div className="relative">
      <input
        type="text"
        className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20
                   transition-all duration-300 peer"
      />
      <label className="absolute left-4 top-3 text-slate-400 transition-all duration-300
                       peer-placeholder-shown:top-3 peer-placeholder-shown:text-base
                       peer-focus:-top-2 peer-focus:text-sm peer-focus:text-blue-400
                       peer-focus:bg-slate-900 peer-focus:px-2">
        Email Address
      </label>
    </div>
  );
};
```

### 3. Layout Components

#### Sticky Navigation:
```typescript
// StickyNav.tsx
export const StickyNav: FC = () => {
  return (
    <motion.nav
      className="fixed top-0 w-full z-50 glass-dark"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="container mx-auto px-4">
        {/* Logo with animation */}
        <LogoAnimated />

        {/* Navigation links with active indicator */}
        <NavLinks />

        {/* Mobile menu */}
        <MobileMenu />
      </div>
    </motion.nav>
  );
};
```

#### Smooth Scroll Integration:
```typescript
// useSmoothScroll.ts
import Lenis from '@studio-freight/lenis'

export const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
  }, [])
}
```

### 4. Homepage Sections

#### Hero Section:
```typescript
// HeroSection.tsx
export const HeroSection: FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Floating 3D Elements */}
      <FloatingElements />

      {/* Typewriter Title */}
      <TypewriterTitle text="Облачные решения для ускорения бизнеса" />

      {/* Animated Metrics */}
      <MetricsCounters
        items={[
          { value: 120, label: 'Запущенных проектов', suffix: '+' },
          { value: 30, label: 'Экспертов в команде' },
          { value: 98, label: 'Удовлетворённость', suffix: '%' }
        ]}
      />

      {/* Interactive CTA Buttons */}
      <CTACollection
        primary={{ text: 'Получить аудит', href: '/contact', style: 'neon' }}
        secondary={{ text: 'Узнать кейсы', href: '/cases', style: 'outline' }}
      />
    </section>
  );
};
```

#### Interactive Services:
```typescript
// ServicesSection.tsx
export const ServicesSection: FC = () => {
  return (
    <section className="section bg-gradient-to-b from-slate-900 to-slate-950">
      <SectionHeading title="Наши услуги" subtitle="..." />

      {/* Filter System */}
      <ServiceFilter />

      {/* Service Cards with 3D Hover */}
      <ServicesGrid>
        {services.map((service) => (
          <ServiceCard3D
            key={service.id}
            service={service}
            tiltEffect={true}
            glowOnHover={true}
          />
        ))}
      </ServicesGrid>
    </section>
  );
};
```

#### Case Studies:
```typescript
// CaseStudiesSection.tsx
export const CaseStudiesSection: FC = () => {
  return (
    <section className="section bg-slate-950">
      <CaseStudyShowcase>
        {cases.map((caseStudy) => (
          <CaseCardInteractive
            key={caseStudy.id}
            caseStudy={caseStudy}
            flipAnimation={true}
            beforeAfterSlider={true}
            techStackBadges={true}
            resultsMetrics={true}
          />
        ))}
      </CaseStudyShowcase>
    </section>
  );
};
```

#### Testimonials:
```typescript
// TestimonialsSection.tsx
export const TestimonialsSection: FC = () => {
  return (
    <section className="section bg-gradient-to-b from-slate-950 to-slate-900">
      {/* 3D Carousel */}
      <TestimonialCarousel3D
        autoPlay={true}
        pauseOnHover={true}
        rotationEffect={true}
      />

      {/* Video Testimonials */}
      <VideoTestimonialsPlayer />

      {/* Customer Logo Marquee */}
      <LogoMarquee logos={customerLogos} speed="slow" />
    </section>
  );
};
```

### 5. Advanced Features

#### Scroll Animations:
```typescript
// ScrollAnimations.tsx
export const ScrollAnimations: FC = () => {
  return (
    <ScrollReveal
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      threshold={0.1}
      rootMargin="-50px"
    >
      <Content />
    </ScrollReveal>
  );
};

// Parallax Effect
export const ParallaxSection: FC = () => {
  return (
    <div className="relative overflow-hidden">
      <motion.div
        style={{ y: useTransform(scrollY, [0, 1000], [0, -300]) }}
        className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-purple-500/20"
      />
    </div>
  );
};
```

#### Micro-interactions:
```css
/* Button Hover States */
.btn-hover-effect {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn-hover-effect::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.btn-hover-effect:hover::before {
  left: 100%;
}

/* Link Animations */
.link-underline {
  position: relative;
}

.link-underline::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background: linear-gradient(90deg, #00f5ff, #ff00ff);
  transition: width 0.3s ease;
}

.link-underline:hover::after {
  width: 100%;
}

/* Image Hover Effects */
.image-zoom-overlay {
  position: relative;
  overflow: hidden;
}

.image-zoom-overlay img {
  transition: transform 0.5s ease;
}

.image-zoom-overlay:hover img {
  transform: scale(1.1);
}

.image-zoom-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.8), rgba(139, 92, 246, 0.8));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-zoom-overlay:hover::after {
  opacity: 1;
}
```

#### Page Transitions:
```typescript
// PageTransitions.tsx
export const PageTransition: FC = () => {
  const variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={router.route}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="page-transition-container"
      />
    </AnimatePresence>
  );
};
```

### 6. Mobile Optimization

#### Touch Interactions:
```typescript
// TouchGestures.tsx
export const SwipeableCard: FC = () => {
  return (
    <div
      className="touch-pan-y"
      style={{
        touchAction: 'pan-y'
      }}
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        whileDrag={{ scale: 1.05 }}
      >
        <Card content />
      </motion.div>
    </div>
  );
};

// Pull to Refresh
export const PullToRefresh: FC = () => {
  const [pullDistance, setPullDistance] = useState(0);

  return (
    <div className="relative overflow-hidden">
      <motion.div
        style={{ y: pullDistance }}
        className="refresh-indicator"
      >
        {pullDistance > 100 ? 'Release to refresh' : 'Pull to refresh'}
      </motion.div>
      <div className="content">{children}</div>
    </div>
  );
};
```

#### Mobile-specific Patterns:
```typescript
// BottomSheetModal.tsx
export const BottomSheetModal: FC = () => {
  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-50 bg-slate-900 rounded-t-3xl"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 500 }}
    >
      <div className="p-6">
        {/* Handle */}
        <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto mb-4" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};
```

## 🔧 Технические требования

### Dependencies:
```json
{
  "framer-motion": "^11.x",
  "lucide-react": "^0.x",
  "lenis": "^1.x",
  "react-intersection-observer": "^9.x",
  "@react-three/fiber": "^8.x",
  "@react-three/drei": "^9.x",
  "three": "^0.16.x",
  "lottie-react": "^2.x"
}
```

### Project Structure:
```
/apps/web/src
  /components
    /ui (Button, Card, Input, Modal, etc.)
    /layout (Header, Footer, Navigation)
    /sections (Hero, Services, Cases, etc.)
    /animations (variants.ts, hooks.ts)
  /lib
    - api.ts, utils.ts
  /styles
    - globals.css (enhanced)
```

### Performance Requirements:
- **Load Time:** <2 seconds
- **Lighthouse Performance:** >95
- **Bundle Size:** <100KB (gzipped)
- **Images:** WebP format, lazy loading
- **Code Splitting:** Route-based
- **Core Web Vitals:** All green

### Accessibility (WCAG 2.1 AA):
- **Keyboard Navigation:** All interactive elements
- **Screen Readers:** ARIA labels, roles, descriptions
- **Color Contrast:** Minimum 4.5:1
- **Focus Indicators:** Visible and clear
- **Reduced Motion:** Respect user preference

## 📊 Критерии успеха

### Количественные метрики:
- **Время загрузки:** <2 секунды ✅
- **Lighthouse Performance:** >95 ✅
- **Lighthouse Accessibility:** >90 ✅
- **Lighthouse SEO:** >90 ✅
- **User Engagement:** +40% (scroll depth, time on page)
- **Conversion Rate:** +25% (contact form submissions)
- **Bounce Rate:** -30%

### Качественные метрики:
- First impression rating: 8.5+/10
- Usability score: 90%+
- Visual appeal rating: 9/10
- Clear value proposition understanding: 85%+

## ⏱️ Timeline (7 недель)

### Неделя 1-2: Foundation
- Настройка дизайн-системы
- Библиотека базовых компонентов
- Навигация и макеты
- Hero секция

### Неделя 2-3: Homepage
- Services секция
- Case studies
- Testimonials
- About секция

### Неделя 3-4: Content Pages
- Services detail страницы
- Case study страницы
- Contact форма
- About страница

### Неделя 4-5: Interactions
- Scroll анимации
- Micro-взаимодействия
- Page transitions
- Mobile оптимизация

### Неделя 5-6: Polish
- Performance оптимизация
- Accessibility аудит
- Cross-browser тестирование
- Bug fixes

### Неделя 6-7: Launch Prep
- SEO оптимизация
- Analytics setup
- Final тестирование
- Deployment

## 🔄 Зависимости и риски

### Зависимости:
1. Backend API готовность
2. Доступность контента (изображения, копирайт)
3. Одобрение дизайна на этапах
4. Соблюдение performance budget

### Риски:
1. Производительность анимаций на слабых устройствах
2. Повышенная сложность влияет на maintainability
3. Чрезмерная анимация приводит к плохому UX
4. Временные ограничения на полировку

### Митигация:
1. Performance тестирование на различных устройствах
2. Accessibility тестирование с недели 1
3. User тестирование на 50% завершении
4. Приоритизация core features, defer nice-to-haves

## ✅ Launch Checklist

- [ ] Все страницы адаптивны и протестированы
- [ ] Performance score >95
- [ ] Accessibility score >90
- [ ] Все формы протестированы и работают
- [ ] Analytics настроен
- [ ] SEO meta tags добавлены
- [ ] Social sharing изображения созданы
- [ ] Custom 404 страница
- [ ] Loading states реализованы
- [ ] Error states спроектированы
- [ ] Cross-browser тестирование (Chrome, Firefox, Safari, Edge)
- [ ] Device тестирование (Desktop, Tablet, Mobile)
- [ ] Контент просмотрен и одобрен
- [ ] Accessibility аудит пройден
- [ ] Performance budget соблюден
- [ ] Документация обновлена

---

## 📚 Приложения

### A. Руководство по анимации
- Держите анимации под 300ms
- Используйте transforms для GPU ускорения
- Уважайте `prefers-reduced-motion`
- Обеспечьте 60fps производительность
- Тестируйте на 60Hz и 120Hz дисплеях

### B. Использование цветов
- Primary: 60% UI
- Secondary: 30% UI
- Accent: 10% UI
- Поддерживайте последовательные контрастные соотношения

### C. Типографические правила
- Максимум 8 размеров шрифтов
- Четкая иерархия (H1-H6)
- Line height: 1.5-1.75 для body
- Длина строки: 45-75 символов

### D. Система иконок
- Используйте последовательный стиль (outline vs filled)
- Размеры: 16px, 20px, 24px, 32px
- Всегда включайте aria-label
- Используйте для навигации, действий, статуса

### E. Руководство по формам
- Четкие labels
- Полезные placeholders
- Real-time валидация
- Доступные error messages
- Success confirmation

---

**Готовы трансформировать цифровое присутствие TB Group в современный, увлекательный опыт! 🚀**

*Спецификация создана: 02.11.2025*
*Ожидаемый срок реализации: 7 недель*
*Статус: Готова к выполнению*
