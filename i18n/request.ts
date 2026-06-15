import { getUserLocale } from '@/lib/locale';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  // const locale = 'en';
  const locale = await getUserLocale();

  let messages;
  if (locale === 'en') {
    messages = (await import('@/messages/en.json')).default;
  } else if (locale === 'mn') {
    messages = (await import('@/messages/mn.json')).default;
  } else {
    messages = (await import(`@/messages/${locale}.json`)).default;
  }

  return {
    locale,
    messages,
  };
});
