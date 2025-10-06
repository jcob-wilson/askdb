import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if ((session as any).user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const limit = Number(new URL(req.url).searchParams.get('limit') || '50')
    const client = await clientPromise
    const db = client.db()
    const items = await db.collection('users').find({}).project({ passwordHash: 0 }).sort({ createdAt: -1 }).limit(Math.min(limit, 200)).toArray()
    return NextResponse.json({ items })
}


