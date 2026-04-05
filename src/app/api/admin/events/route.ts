import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'
import { createEventSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  const events = await prisma.event.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { guests: true } },
      guests: {
        where: { submitted: true },
        select: {
          answers: { select: { isCorrect: true } },
        },
      },
    },
  })

  const eventsWithStats = events.map((event) => {
    const submittedGuests = event.guests
    const totalSubmitted = submittedGuests.length
    const avgScore =
      totalSubmitted > 0
        ? submittedGuests.reduce((sum, g) => {
            const correct = g.answers.filter((a) => a.isCorrect).length
            return sum + correct
          }, 0) / totalSubmitted
        : 0

    return {
      id: event.id,
      name: event.name,
      createdAt: event.createdAt,
      totalGuests: event._count.guests,
      submittedGuests: totalSubmitted,
      avgScore: Math.round(avgScore * 10) / 10,
    }
  })

  return NextResponse.json(eventsWithStats)
}

export async function POST(request: NextRequest) {
  const authError = requireAdminAuth(request)
  if (authError) return authError

  const body = await request.json()
  const parsed = createEventSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { name, questions } = parsed.data

  const event = await prisma.event.create({
    data: {
      name,
      questions: {
        create: questions.map((q, i) => ({
          text: q.text,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correctOption: q.correctOption,
          order: i + 1,
        })),
      },
    },
  })

  return NextResponse.json({ id: event.id }, { status: 201 })
}
