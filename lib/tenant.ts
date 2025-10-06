import { NextRequest } from 'next/server'

export function getTenantIdFromRequest(req: NextRequest): string {
    const host = req.headers.get('host') || ''
    const custom = req.headers.get('x-tenant-id') || ''
    if (custom) return custom
    const parts = host.split('.')
    if (parts.length > 2) return parts[0]
    return 'default'
}


