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
    include: { answers: { select: { isCorrect: true } } },
    orderBy: { createdAt: 'asc' },
  })

  const eligible = guests
    .map((g) => ({
      firstName: g.firstName,
      lastName: g.lastName,
      roomNumber: g.roomNumber,
      phoneNumber: g.phoneNumber ?? '',
      correctAnswers: g.answers.filter((a) => a.isCorrect).length,
      totalQuestions: g.answers.length,
    }))
    .filter((g) => g.correctAnswers >= minCorrect)

  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`

  const headers = ['First Name', 'Last Name', 'Room Number', 'Phone Number', 'Correct Answers', 'Total Questions', 'Score %']
  const rows = eligible.map((g) => [
    escape(g.firstName),
    escape(g.lastName),
    escape(g.roomNumber),
    escape(g.phoneNumber),
    g.correctAnswers.toString(),
    g.totalQuestions.toString(),
    g.totalQuestions > 0
      ? `${Math.round((g.correctAnswers / g.totalQuestions) * 100)}%`
      : '0%',
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const filename = `${event.name.replace(/[^a-z0-9]/gi, '_')}_eligible_guests_min${minCorrect}.csv`

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
