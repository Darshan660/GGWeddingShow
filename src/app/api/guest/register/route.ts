import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guestRegistrationSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = guestRegistrationSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { firstName, lastName, roomNumber, phoneNumber, eventId } = parsed.data

  const event = await prisma.event.findUnique({ where: { id: eventId } })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const guest = await prisma.guest.create({
    data: {
      firstName,
      lastName,
      roomNumber,
      phoneNumber: phoneNumber?.trim() || null,
      eventId,
    },
  })

  return NextResponse.json({ guestId: guest.id }, { status: 201 })
}
