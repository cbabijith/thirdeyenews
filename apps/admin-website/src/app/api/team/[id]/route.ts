import { NextRequest } from 'next/server'
import { mutateMember, teamResponse } from '@/features/team/server'

type Context = { params: Promise<{ id: string }> }
export async function PATCH(request: NextRequest, context: Context) {
  return teamResponse(async () => mutateMember(request, (await context.params).id))
}
export const DELETE = PATCH
