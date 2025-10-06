import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { getTenantIdFromRequest } from '@/lib/tenant'
import clientPromise from '@/lib/mongodb'

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const limit = Number(new URL(req.url).searchParams.get('limit') || '50')
    const tenantId = getTenantIdFromRequest(req)

    const client = await clientPromise
    const db = client.db()
    const cursor = db.collection('user_queries')
        .find({ userEmail: session.user.email.toLowerCase(), tenantId })
        .sort({ timestamp: -1 })
        .limit(Math.min(limit, 200))
    const items = await cursor.toArray()
    return NextResponse.json({ items })
}


