import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import clientPromise from '@/lib/mongodb'
import { getPlanForUser, getTodayKey } from '@/lib/plans'
import { getTenantIdFromRequest } from '@/lib/tenant'

export async function GET(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // derive tenant from headers
    const req = request as any
    const tenantId = getTenantIdFromRequest(req)

    const client = await clientPromise
    const db = client.db()
    const users = db.collection('users')
    const user = await users.findOne({ email: session.user.email.toLowerCase() })
    const plan = getPlanForUser(user)

    const todayKey = getTodayKey()
    const usageDoc = await db.collection('user_usage').findOne({ _id: `${tenantId}:${session.user.email.toLowerCase()}:${todayKey}` })
    const todayCount = usageDoc?.count || 0

    const last7 = await db.collection('user_queries').aggregate([
        { $match: { userEmail: session.user.email.toLowerCase(), tenantId } },
        { $sort: { timestamp: -1 } },
        { $limit: 100 },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
    ]).toArray()

    return NextResponse.json({ plan: plan.id, limits: { perDay: plan.queryLimitPerDay }, todayCount, dailySeries: last7 })
}


