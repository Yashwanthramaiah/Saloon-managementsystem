import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);

        const requestHeaders = new Headers(request.headers);
        if (payload.orgId) {
            requestHeaders.set('x-org-id', payload.orgId as string);
        }
        if (payload.role) {
            requestHeaders.set('x-role', payload.role as string);
        }

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
}

export const config = {
    matcher: '/api/:path*',
};
