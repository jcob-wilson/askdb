import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()
        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

        const client = await clientPromise
        const db = client.db()
        const users = db.collection('users')
        const user = await users.findOne({ email: email.toLowerCase() })

        if (user) {
            const token = crypto.randomBytes(32).toString('hex')
            const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour
            await users.updateOne({ _id: user._id }, { $set: { resetToken: token, resetTokenExpiresAt: expires } })

            const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'
            const resetUrl = `${baseUrl.replace(/\/$/, '')}/reset?token=${token}`

            if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_FROM) {
                const transporter = nodemailer.createTransport({
                    host: process.env.SMTP_HOST,
                    port: Number(process.env.SMTP_PORT || 587),
                    secure: false,
                    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                })
                await transporter.sendMail({
                    from: process.env.SMTP_FROM,
                    to: email,
                    subject: 'Reset your password',
                    text: `Reset your password: ${resetUrl}`,
                    html: `<p>Click to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
                })
            }
        }

        return NextResponse.json({ ok: true })
    } catch (e) {
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
}


