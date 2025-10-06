import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { token, password } = await req.json()
        if (!token || !password) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

        const client = await clientPromise
        const db = client.db()
        const users = db.collection('users')
        const user = await users.findOne({ resetToken: token, resetTokenExpiresAt: { $gt: new Date() } })
        if (!user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })

        const passwordHash = await bcrypt.hash(password, 12)
        await users.updateOne(
            { _id: user._id },
            { $set: { passwordHash, passwordSet: true }, $unset: { resetToken: "", resetTokenExpiresAt: "" } }
        )

        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
    }
}


