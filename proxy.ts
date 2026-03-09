import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = [
    '/',
    '/login',
    '/signup',
];

const publicApiRoutes = [
    '/api/login',
    '/api/signup',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const isPublicRoute = publicRoutes.some(route => pathname === route);
    const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute || isPublicApiRoute) {
        return NextResponse.next();
    }

    const authToken = request.cookies.get('authToken')?.value;

    if (!authToken) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder files
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
