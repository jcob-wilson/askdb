export type PlanId = 'free' | 'pro' | 'enterprise'

export interface Plan {
    id: PlanId
    name: string
    monthlyPriceCents?: number
    queryLimitPerDay: number
    allowExternalConnections: boolean
}

export const PLANS: Record<PlanId, Plan> = {
    free: {
        id: 'free',
        name: 'Free',
        monthlyPriceCents: 0,
        queryLimitPerDay: 25,
        allowExternalConnections: false,
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        monthlyPriceCents: 1900,
        queryLimitPerDay: 5000,
        allowExternalConnections: true,
    },
    enterprise: {
        id: 'enterprise',
        name: 'Enterprise',
        queryLimitPerDay: 1000000,
        allowExternalConnections: true,
    },
}

export function getPlanForUser(user: any): Plan {
    const planId: PlanId = (user?.plan as PlanId) || (user?.role === 'admin' ? 'enterprise' : user?.role === 'subscriber' ? 'pro' : 'free')
    return PLANS[planId] || PLANS.free
}

export function getTodayKey(): string {
    const d = new Date()
    return `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, '0')}-${d.getUTCDate().toString().padStart(2, '0')}`
}


