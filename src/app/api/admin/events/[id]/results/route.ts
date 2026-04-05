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
  const { searchParams } = new URL(request.url)
  const minCorrect = parseInt(searchParams.get('minCorrect') || '0', 10)

  const event = await prisma.event.findUnique({ where: { id } })
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  const guests = await prisma.guest.findMany({
    where: { eventId: id, submitted: true },
    include: {
      answers: { select: { isCorrect: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const guestsWithScores = guests.map((g) => {
    const correctCount = g.answers.filter((a) => a.isCorrect).length
    return {
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      roomNumber: g.roomNumber,
      phoneNumber: g.phoneNumber,
      correctAnswers: correctCount,
      totalQuestions: g.answers.length,
      createdAt: g.createdAt,
    }
  })

  const allGuests = guestsWithScores
  const eligibleGuests = guestsWithScores.filter((g) => g.correctAnswers >= minCorrect)

  // Score distribution: how many guests got 0, 1, 2, ... 10 correct
  const distribution: Record<number, number> = {}
  for (let i = 0; i <= 10; i++) distribution[i] = 0
  allGuests.forEach((g) => {
    distribution[g.correctAnswers] = (distribution[g.correctAnswers] || 0) + 1
  })

  const avgScore =
    allGuests.length > 0
      ? allGuests.reduce((s, g) => s + g.correctAnswers, 0) / allGuests.length
      : 0

  return NextResponse.json({
    eventName: event.name,
    totalParticipants: allGuests.length,
    avgScore: Math.round(avgScore * 10) / 10,
    distribution,
    eligibleGuests,
    allGuests,
  })
}
