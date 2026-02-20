import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

/**
 * next-intl config WITHOUT i18n routing.
 * Locale is resolved from: 1) cookie, 2) Accept-Language header, 3) default 'en'
 */
export default getRequestConfig(async () => {
    // 1. Try cookie (set when user manually switches language in Settings)
    const cookieLocale = cookies().get('NEXT_LOCALE')?.value;

    // 2. Try Accept-Language header
    let headerLocale = 'en';
    try {
        const acceptLang = headers().get('accept-language') ?? '';
        const preferred = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase();
        if (preferred === 'tr') headerLocale = 'tr';
    } catch {
        // ignore
    }

    const locale = (cookieLocale === 'tr' || cookieLocale === 'en')
        ? cookieLocale
        : headerLocale;

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
