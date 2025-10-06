import clientPromise from '@/lib/mongodb'

export interface RateLimitOptions {
    windowSeconds: number
    max: number
}

export async function rateLimit(key: string, options: RateLimitOptions) {
    const client = await clientPromise
    const db = client.db()
    const coll = db.collection('rate_limits')
    const now = Date.now()
    const windowMs = options.windowSeconds * 1000
    const windowStart = now - windowMs

    await coll.createIndex({ key: 1, ts: 1 })

    // Clean old entries (best-effort)
    await coll.deleteMany({ key, ts: { $lt: windowStart } })

    const count = await coll.countDocuments({ key, ts: { $gte: windowStart } })
    if (count >= options.max) {
        return { allowed: false, remaining: 0 }
    }

    await coll.insertOne({ key, ts: now })
    return { allowed: true, remaining: Math.max(0, options.max - count - 1) }
}


