import { z } from 'zod'

export const guestRegistrationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(30, 'First name must be 30 characters or less'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(40, 'Last name must be 40 characters or less'),
  roomNumber: z
    .string()
    .min(1, 'Room number is required')
    .regex(/^\d{1,7}$/, 'Room number must be a valid integer (max 7 digits)'),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === '') return true
      // Support Indian (+91) and international E.164 format
      return /^\+?[1-9]\d{6,14}$/.test(val.replace(/[\s\-()]/g, ''))
    }, 'Please enter a valid phone number'),
  eventId: z.string().min(1, 'Event ID is required'),
})

export const quizSubmitSchema = z.object({
  guestId: z.string().min(1),
  answers: z.array(
    z.object({
      questionId: z.string(),
      selectedOption: z.enum(['A', 'B', 'C', 'D'] as const),
    })
  ),
})

export const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  optionA: z.string().min(1, 'Option A is required'),
  optionB: z.string().min(1, 'Option B is required'),
  optionC: z.string().min(1, 'Option C is required'),
  optionD: z.string().min(1, 'Option D is required'),
  correctOption: z.enum(['A', 'B', 'C', 'D'] as const, { message: 'Select a correct option' }),
})

export const createEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(100, 'Event name too long'),
  questions: z
    .array(questionSchema)
    .length(10, 'Exactly 10 questions are required'),
})

export type GuestRegistrationInput = z.infer<typeof guestRegistrationSchema>
export type QuizSubmitInput = z.infer<typeof quizSubmitSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
