import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { quizSubmitSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = quizSubmitSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { guestId, answers } = parsed.data

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: { event: { include: { questions: true } } },
  })

  if (!guest) {
    return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  }

  if (guest.submitted) {
    return NextResponse.json({ error: 'Quiz already submitted' }, { status: 409 })
  }

  const questionMap = new Map(guest.event.questions.map((q) => [q.id, q]))

  const answerData = answers.map((a) => {
    const question = questionMap.get(a.questionId)
    const isCorrect = question ? question.correctOption === a.selectedOption : false
    return {
      guestId,
      questionId: a.questionId,
      selectedOption: a.selectedOption,
      isCorrect,
    }
  })

  await prisma.$transaction([
    prisma.answer.createMany({ data: answerData }),
    prisma.guest.update({ where: { id: guestId }, data: { submitted: true } }),
  ])

  const correctCount = answerData.filter((a) => a.isCorrect).length

  return NextResponse.json({ success: true, correctAnswers: correctCount })
}
