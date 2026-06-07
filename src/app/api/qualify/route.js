import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { userSubmission, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const qualification = readPrompt('qualification.txt')
    const userMessage = `${qualification}\n\nUSER SUBMISSION\n${userSubmission}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
