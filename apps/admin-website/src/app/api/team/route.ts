import { NextRequest } from 'next/server'
import { createMember, listMembers, teamResponse } from '@/features/team/server'

export const dynamic = 'force-dynamic'
export const GET = (request: NextRequest) => teamResponse(() => listMembers(request))
export const POST = (request: NextRequest) => teamResponse(() => createMember(request))
