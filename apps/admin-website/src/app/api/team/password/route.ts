import { NextRequest } from 'next/server'
import { changeOwnPassword, teamResponse } from '@/features/team/server'

export const POST = (request: NextRequest) => teamResponse(() => changeOwnPassword(request))
