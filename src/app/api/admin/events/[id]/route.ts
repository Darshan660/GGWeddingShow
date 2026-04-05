import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      _count: { select: { guests: true } },
    },
  })

  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const appUrl = process.env.APP_URL || 'http://localhost:3000'
  const qrUrl = `${appUrl}/guest/register/${event.id}`

  return NextResponse.json({ ...event, qrUrl })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  const { id } = await params

  await prisma.event.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
