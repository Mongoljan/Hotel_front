export type Locale = (typeof locales)[number];

export const locales = ['en', 'mn'] as const;
export const defaultLocale: Locale = 'mn';
