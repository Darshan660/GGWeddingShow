import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  const { guestId } = await params

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      event: {
        include: {
          questions: {
            orderBy: { order: 'asc' },
            select: {
              id: true,
              text: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              order: true,
            },
          },
        },
      },
    },
  })

  if (!guest) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }

  if (guest.submitted) {
    return NextResponse.json({ error: 'Already submitted' }, { status: 409 })
  }

  return NextResponse.json({
    eventName: guest.event.name,
    questions: guest.event.questions,
  })
}
