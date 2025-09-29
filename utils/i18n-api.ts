import type { NextRequest } from 'next/server'

export type Locale = 'en' | 'mn'

const messages: Record<Locale, Record<string, string>> = {
  en: {
    'auth.required': 'Email and password are required.',
    'auth.invalid': 'Invalid email or password.',
    'error.internal': 'Internal server error.',
  },
  mn: {
    'auth.required': 'И-мэйл болон нууц үг шаардлагатай.',
    'auth.invalid': 'Нэвтрэх нэр эсвэл нууц үг буруу байна.',
    'error.internal': 'Дотоод серверийн алдаа.',
  },
}

export function getLocaleFromRequest(req: NextRequest): Locale {
  const url = new URL(req.url)
  const queryLocale = (url.searchParams.get('locale') || '').toLowerCase()
  const acceptLang = (req.headers.get('accept-language') || '').toLowerCase()
  const parsedAccept = acceptLang.split(',')[0]?.split('-')[0] || ''
  const raw = (queryLocale || parsedAccept)
  return raw === 'mn' ? 'mn' : 'en'
}

export function t(locale: Locale, code: string): string {
  return messages[locale][code] || code
}

export function buildError(locale: Locale, code: string) {
  return { code, error: t(locale, code), locale }
}
