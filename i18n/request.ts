import { getUserLocale } from '@/lib/locale';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // const locale = 'en';
  const locale = await getUserLocale();
  return {
    locale,
    messages: (
      await (locale === 'en'
        ? // When using Turbopack, this will enable HMR for `en`
          import('@/messages/en.json')
        : import(`@/messages/${locale}.json`))
    ).default
  };
});
