// Система отступов TB Group - кратна 4px (1rem = 16px)
export const spacing = {
  // Базовые отступы
  0: '0',
  1: '0.25rem', // 4px
  2: '0.5rem',  // 8px
  3: '0.75rem', // 12px
  4: '1rem',   // 16px
  5: '1.25rem', // 20px
  6: '1.5rem',  // 24px
  7: '1.75rem', // 28px
  8: '2rem',   // 32px
  9: '2.25rem', // 36px
  10: '2.5rem', // 40px
  11: '2.75rem', // 44px
  12: '3rem',   // 48px
  14: '3.5rem', // 56px
  16: '4rem',   // 64px
  20: '5rem',   // 80px
  24: '6rem',   // 96px
  28: '7rem',   // 112px
  32: '8rem',   // 128px
  36: '9rem',   // 144px
  40: '10rem',  // 160px
  44: '11rem',  // 176px
  48: '12rem',  // 192px
  52: '13rem',  // 208px
  56: '14rem',  // 224px
  60: '15rem',  // 240px
  64: '16rem',  // 256px
  72: '18rem',  // 288px
  80: '20rem',  // 320px
  96: '24rem',  // 384px
};

// Предопределенные отступы для типичных случаев
export const spacingPresets = {
  // Межблочные расстояния
  block: {
    small: spacing[4],  // 16px
    medium: spacing[6], // 24px
    large: spacing[8],  // 32px
    xlarge: spacing[12], // 48px
  },
  
  // Межсекционные расстояния
  section: {
    small: spacing[12], // 48px
    medium: spacing[16], // 64px
    large: spacing[20], // 80px
    xlarge: spacing[24], // 96px
  },
  
  // Контейнерные отступы
  container: {
    small: spacing[8],  // 32px
    medium: spacing[12], // 48px
    large: spacing[16], // 64px
    xlarge: spacing[20], // 80px
  },
  
  // Внутренние отступы
  padding: {
    small: spacing[2],  // 8px
    medium: spacing[4],  // 16px
    large: spacing[6],  // 24px
    xlarge: spacing[8],  // 32px
  },
  
  // Внешние отступы
  margin: {
    small: spacing[2],  // 8px
    medium: spacing[4],  // 16px
    large: spacing[6],  // 24px
    xlarge: spacing[8],  // 32px
  },
  
  // Отступы для форм
  form: {
    input: {
      padding: spacing[3], // 12px
      margin: spacing[2], // 8px
    },
    button: {
      padding: {
        x: spacing[4], // 16px
        y: spacing[2], // 8px
      },
      margin: spacing[2], // 8px
    },
    fieldset: {
      padding: spacing[4], // 16px
      margin: spacing[3], // 12px
    },
  },
  
  // Отступы для навигации
  navigation: {
    item: {
      padding: spacing[2], // 8px
      margin: spacing[1], // 4px
    },
    dropdown: {
      padding: spacing[2], // 8px
      margin: spacing[1], // 4px
    },
  },
  
  // Отступы для карточек
  card: {
    padding: spacing[4], // 16px
    margin: spacing[3], // 12px
    gap: spacing[3], // 12px
  },
  
  // Отступы для галерей
  gallery: {
    item: {
      padding: spacing[1], // 4px
      margin: spacing[1], // 4px
    },
    gap: spacing[2], // 8px
  },
};

// Типы для отступов
export type SpacingType = keyof typeof spacing;
export type SpacingPresetType = keyof typeof spacingPresets;

// Утилиты для работы с отступами
export const getSpacing = (value: SpacingType) => spacing[value];
export const getSpacingPreset = (category: keyof typeof spacingPresets, preset: string) => {
  return spacingPresets[category]?.[preset as keyof typeof spacingPresets[typeof category]];
};

// Утилиты для создания кастомных отступов
export const createSpacing = (base: number = 16) => {
  const customSpacing: Record<string, string> = {};
  
  for (let i = 0; i <= 100; i++) {
    customSpacing[i.toString()] = `${(i * base) / 16}rem`;
  }
  
  return customSpacing;
};

// Утилиты для responsive отступов
export const responsiveSpacing = (mobile: SpacingType, tablet: SpacingType, desktop: SpacingType) => {
  return {
    mobile: spacing[mobile],
    tablet: spacing[tablet],
    desktop: spacing[desktop],
  };
};