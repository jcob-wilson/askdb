import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import clientPromise from '@/lib/mongodb'

export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((session as any).user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const client = await clientPromise
    const db = client.db()
    const users = await db.collection('users').countDocuments({})
    const subscribers = await db.collection('users').countDocuments({ role: 'subscriber' })
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const queries24h = await db.collection('user_queries').countDocuments({ timestamp: { $gte: since } })
    return NextResponse.json({ users, subscribers, queries24h })
}


