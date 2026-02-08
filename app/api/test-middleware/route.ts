import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
    const headersList = await headers();
    const orgId = headersList.get('x-org-id');
    const role = headersList.get('x-role');

    return NextResponse.json({ orgId, role });
}
