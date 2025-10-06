import nodemailer from 'nodemailer'

export async function getTransport() {
    if (!process.env.SMTP_HOST) throw new Error('SMTP not configured')
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
}

export async function sendMail(to: string, subject: string, html: string, text?: string) {
    const transporter = await getTransport()
    await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html, text })
}

export const templates = {
    usageAlert: (email: string, used: number, limit: number) => ({
        subject: 'Usage Alert',
        html: `<p>Hi ${email},</p><p>You have used ${used}/${limit} queries today.</p>`,
        text: `You have used ${used}/${limit} queries today.`,
    }),
    subscriptionActive: (email: string, provider: string) => ({
        subject: 'Subscription Activated',
        html: `<p>Your subscription is active via ${provider}.</p>`,
        text: `Subscription active via ${provider}.`,
    }),
    subscriptionCanceled: (email: string, provider: string) => ({
        subject: 'Subscription Canceled',
        html: `<p>Your subscription via ${provider} was canceled.</p>`,
        text: `Subscription canceled via ${provider}.`,
    }),
}


