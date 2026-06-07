import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { validatedProblemStatement, problemBrief, rootCauseAnalysis, researchSynthesis, strategicAnalysis, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const recommendation = readPrompt('recommendation-generation.txt')
    const userMessage = `${recommendation}\n\nVALIDATED PROBLEM STATEMENT\n${validatedProblemStatement}\n\nPROBLEM BRIEF\n${JSON.stringify(problemBrief, null, 2)}\n\nROOT CAUSE ANALYSIS\n${JSON.stringify(rootCauseAnalysis, null, 2)}\n\nRESEARCH SYNTHESIS\n${JSON.stringify(researchSynthesis, null, 2)}\n\nSTRATEGIC ANALYSIS\n${JSON.stringify(strategicAnalysis, null, 2)}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
