import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { signAdminToken, setAdminCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }

  const emailMatch = email.toLowerCase() === adminEmail?.toLowerCase()
  const passwordMatch = adminPassword ? password === adminPassword : false

  if (!emailMatch || !passwordMatch) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = signAdminToken()
  const response = NextResponse.json({ success: true })
  setAdminCookie(response, token)
  return response
}
