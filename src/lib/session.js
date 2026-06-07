// src/lib/session.js
const SESSION_KEY = 'gatekeeper_session'
const API_KEY_KEY = 'gatekeeper_api_key'

export const initialSession = {
  currentStep: 0,
  originalProblem: '',
  discoveryHistory: [],
  questionCount: 0,
  problemBrief: null,
  validatedProblemStatement: '',
  rootCauseAnalysis: null,
  researchDecision: null,
  externalResearch: null,
  researchSynthesis: null,
  strategicAnalysis: null,
  recommendation: null,
}

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(session) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function getApiKey() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(API_KEY_KEY) || null
}

export function setApiKey(key) {
  if (typeof window === 'undefined') return
  localStorage.setItem(API_KEY_KEY, key)
}

export function clearApiKey() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(API_KEY_KEY)
}
