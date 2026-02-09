import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import {
    hashPassword,
    generateToken,
    isValidEmail,
    isValidPassword,
} from '@/app/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password, name, role, organizationId } = body;

        // Validate required fields
        if (!email || !password || !name || !role || !organizationId) {
            return NextResponse.json(
                {
                    error: 'Missing required fields',
                    details: {
                        email: !email ? 'Email is required' : undefined,
                        password: !password ? 'Password is required' : undefined,
                        name: !name ? 'Name is required' : undefined,
                        role: !role ? 'Role is required' : undefined,
                        organizationId: !organizationId
                            ? 'Organization ID is required'
                            : undefined,
                    },
                },
                { status: 400 }
            );
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            );
        }

        // Validate password strength
        if (!isValidPassword(password)) {
            return NextResponse.json(
                {
                    error: 'Password does not meet requirements',
                    details:
                        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number',
                },
                { status: 400 }
            );
        }

        // Validate role
        const validRoles = ['ADMIN', 'MANAGER', 'STYLIST', 'RECEPTIONIST', 'CUSTOMER'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                {
                    error: 'Invalid role',
                    details: `Role must be one of: ${validRoles.join(', ')}`,
                },
                { status: 400 }
            );
        }

        // Check if organization exists
        const organization = await prisma.organization.findUnique({
            where: { id: organizationId },
        });

        if (!organization) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Email already registered' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role,
                organizationId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                organizationId: true,
                isActive: true,
                createdAt: true,
            },
        });

        // Generate JWT token
        const token = await generateToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            orgId: user.organizationId,
        });

        return NextResponse.json(
            {
                user,
                token,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Sign up error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
