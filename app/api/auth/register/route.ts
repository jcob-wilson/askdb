import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json()
        if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

        const client = await clientPromise
        const db = client.db()
        const users = db.collection('users')
        const existing = await users.findOne({ email: email.toLowerCase() })
        if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 400 })

        const passwordHash = await bcrypt.hash(password, 12)
        await users.insertOne({
            email: email.toLowerCase(),
            name,
            passwordHash,
            role: 'free',
            createdAt: new Date(),
            passwordSet: true,
            provider: 'credentials'
        })

        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
    }
}


