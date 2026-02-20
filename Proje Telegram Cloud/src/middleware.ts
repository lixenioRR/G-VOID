import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware: just pass all requests through.
// next-intl locale resolution is handled inside layout.tsx via Accept-Language header.
export function middleware(request: NextRequest) {
    return NextResponse.next();
}

export const config = {
    // Only run middleware on actual pages (not static files or API routes)
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|json|txt|xml|woff|woff2|ttf|otf|css|js)$).*)',
    ],
};
