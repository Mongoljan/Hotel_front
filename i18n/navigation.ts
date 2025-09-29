import {createNavigation} from 'next-intl/navigation';

import {defaultLocale, locales} from './config';

export const routing = {
  locales,
  defaultLocale,
  localePrefix: 'never' as const,
};

export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
