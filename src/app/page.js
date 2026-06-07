'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  getSession, setSession, clearSession, initialSession,
  getApiKey,
} from '@/lib/session'
import {
  demoQualification, demoDiscoveryFlow, demoProblemBrief,
  demoRootCauseAnalysis, demoResearchDecision, demoExternalResearch,
  demoResearchSynthesis, demoStrategicAnalysis, demoRecommendation,
} from '@/lib/demo-data'
import SetupWizard from '@/components/SetupWizard'
import WelcomeScreen from '@/components/WelcomeScreen'
import Qualification from '@/components/steps/Qualification'
import Discovery from '@/components/steps/Discovery'
import ProblemBrief from '@/components/steps/ProblemBrief'
import AutoProcessing from '@/components/steps/AutoProcessing'
import Report from '@/components/Report'
import Settings from '@/components/Settings'
import ErrorDisplay from '@/components/ErrorDisplay'
import DemoBanner from '@/components/DemoBanner'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function Home() {
  const [session, setSessionState] = useState(null)
  const [showSetupWizard, setShowSetupWizard] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingLabel, setLoadingLabel] = useState('calculating')
  const [error, setError] = useState(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [qualifyMsg, setQualifyMsg] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const apiKey = getApiKey()
    const saved = getSession()
    if (!apiKey) {
      setShowSetupWizard(true)
    } else if (saved && saved.currentStep > 0) {
      setSessionState(saved)
    } else {
      setSessionState({ ...initialSession })
    }
    setInitialized(true)
  }, [])

  function save(updates) {
    const next = { ...session, ...updates }
    setSession(next)
    setSessionState(next)
    return next
  }

  function handleStartOver() {
    clearSession()
    setSessionState({ ...initialSession })
    setError(null)
    setIsDemoMode(false)
    setQualifyMsg('')
    setCurrentQuestion('')
  }

  function handleEditPrevious() {
    const prev = Math.max(0, (session?.currentStep ?? 1) - 1)
    const updated = { ...session, currentStep: prev }
    setSession(updated)
    setSessionState(updated)
    setError(null)
  }

  function handleRetry() {
    setError(null)
  }

  async function apiCall(endpoint, body) {
    const apiKey = getApiKey()
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, apiKey }),
    })
    const data = await res.json()
    if (data.error) throw Object.assign(new Error(data.error), { type: data.error })
    return data
  }

  async function handleDemo() {
    setIsDemoMode(true)
    setLoading(true)
    setLoadingLabel('calculating')
    await delay(600)
    const s = {
      ...initialSession,
      currentStep: 2,
      originalProblem: 'We receive product data from dozens of suppliers and spend significant time normalizing it before it can be imported into our platform.',
      questionCount: 0,
    }
    setSession(s)
    setSessionState(s)
    const firstQ = demoDiscoveryFlow[0].message
    setCurrentQuestion(firstQ)
    setLoading(false)
  }

  async function handleWelcomeSubmit(problem, resume = false) {
    if (resume) return

    const s0 = save({ ...initialSession, originalProblem: problem })
    setLoading(true)
    setLoadingLabel('calculating')

    try {
      const result = isDemoMode
        ? demoQualification
        : await apiCall('/api/qualify', { userSubmission: problem })

      if (result.status === 'accept') {
        const s1 = { ...s0, currentStep: 2, questionCount: 0 }
        setSession(s1)
        setSessionState(s1)
        await runDiscovery(s1)
      } else {
        setQualifyMsg(result.message)
        save({ ...s0, currentStep: 1 })
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      setError(err.type || 'API_ERROR')
    }
  }

  async function handleRevise(revisedProblem) {
    const s0 = { ...session, originalProblem: revisedProblem }
    setSession(s0)
    setSessionState(s0)
    setLoading(true)
    setLoadingLabel('calculating')
    try {
      const result = isDemoMode
        ? demoQualification
        : await apiCall('/api/qualify', { userSubmission: revisedProblem })

      if (result.status === 'accept') {
        const s1 = { ...s0, currentStep: 2, questionCount: 0 }
        setSession(s1)
        setSessionState(s1)
        await runDiscovery(s1)
      } else {
        setQualifyMsg(result.message)
        save({ ...s0, currentStep: 1 })
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      setError(err.type || 'API_ERROR')
    }
  }

  async function runDiscovery(s) {
    setLoading(true)
    setLoadingLabel('calculating')
    try {
      const idx = Math.min(s.questionCount ?? 0, demoDiscoveryFlow.length - 1)
      const result = isDemoMode
        ? demoDiscoveryFlow[idx]
        : await apiCall('/api/discover', {
            originalProblem: s.originalProblem,
            questionCount: s.questionCount,
            discoveryHistory: s.discoveryHistory,
          })

      if (result.status === 'brief_ready') {
        const s2 = { ...s, currentStep: 3, problemBrief: result.problemBrief }
        setSession(s2)
        setSessionState(s2)
        await runProblemBrief(s2)
      } else {
        setCurrentQuestion(result.message)
        const s2 = { ...s, currentStep: 2 }
        setSession(s2)
        setSessionState(s2)
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      setError(err.type || 'API_ERROR')
    }
  }

  async function handleDiscoveryAnswer(question, answer) {
    const history = [...(session.discoveryHistory || []), { question, answer }]
    const count = (session.questionCount || 0) + 1
    const s = { ...session, discoveryHistory: history, questionCount: count }
    setSession(s)
    setSessionState(s)
    await runDiscovery(s)
  }

  async function runProblemBrief(s) {
    setLoading(true)
    setLoadingLabel('calculating')
    try {
      const result = isDemoMode
        ? demoProblemBrief
        : await apiCall('/api/problem-brief', { problemBrief: s.problemBrief })
      const s2 = { ...s, currentStep: 4, validatedProblemStatement: result.problemStatement }
      setSession(s2)
      setSessionState(s2)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err.type || 'API_ERROR')
    }
  }

  function handleBriefApproved(text) {
    const s = { ...session, validatedProblemStatement: text, currentStep: 5 }
    setSession(s)
    setSessionState(s)
  }

  const runRootCause = useCallback(async () => {
    try {
      const result = isDemoMode
        ? demoRootCauseAnalysis
        : await apiCall('/api/root-cause', {
            validatedProblemStatement: session.validatedProblemStatement,
            problemBrief: session.problemBrief,
          })
      const s = { ...session, rootCauseAnalysis: result, currentStep: 6 }
      setSession(s)
      setSessionState(s)
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  const runResearchDecision = useCallback(async () => {
    try {
      const result = isDemoMode
        ? demoResearchDecision
        : await apiCall('/api/research-decision', {
            validatedProblemStatement: session.validatedProblemStatement,
            problemBrief: session.problemBrief,
            rootCauseAnalysis: session.rootCauseAnalysis,
          })
      const nextStep = result.researchRequired ? 7 : 9
      const s = { ...session, researchDecision: result, currentStep: nextStep }
      setSession(s)
      setSessionState(s)
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  const runExternalResearch = useCallback(async () => {
    try {
      const result = isDemoMode
        ? demoExternalResearch
        : await apiCall('/api/external-research', {
            validatedProblemStatement: session.validatedProblemStatement,
            problemBrief: session.problemBrief,
            rootCauseAnalysis: session.rootCauseAnalysis,
            researchDecision: session.researchDecision,
          })
      const s = { ...session, externalResearch: result, currentStep: 8 }
      setSession(s)
      setSessionState(s)
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  const runResearchSynthesis = useCallback(async () => {
    try {
      const result = isDemoMode
        ? demoResearchSynthesis
        : await apiCall('/api/research-synthesis', {
            validatedProblemStatement: session.validatedProblemStatement,
            problemBrief: session.problemBrief,
            rootCauseAnalysis: session.rootCauseAnalysis,
            externalResearch: session.externalResearch,
          })
      const s = { ...session, researchSynthesis: result, currentStep: 9 }
      setSession(s)
      setSessionState(s)
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  const runStrategicAnalysis = useCallback(async () => {
    try {
      const result = isDemoMode
        ? demoStrategicAnalysis
        : await apiCall('/api/strategic-analysis', {
            validatedProblemStatement: session.validatedProblemStatement,
            problemBrief: session.problemBrief,
            rootCauseAnalysis: session.rootCauseAnalysis,
            researchSynthesis: session.researchSynthesis,
          })
      const s = { ...session, strategicAnalysis: result, currentStep: 10 }
      setSession(s)
      setSessionState(s)
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  const runRecommendation = useCallback(async () => {
    try {
      const result = isDemoMode
        ? demoRecommendation
        : await apiCall('/api/recommendation', {
            validatedProblemStatement: session.validatedProblemStatement,
            problemBrief: session.problemBrief,
            rootCauseAnalysis: session.rootCauseAnalysis,
            researchSynthesis: session.researchSynthesis,
            strategicAnalysis: session.strategicAnalysis,
          })
      const s = { ...session, recommendation: result, currentStep: 11 }
      setSession(s)
      setSessionState(s)
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  if (!initialized) return null

  if (showSetupWizard) {
    return (
      <SetupWizard onComplete={() => {
        setShowSetupWizard(false)
        setSessionState({ ...initialSession })
      }} />
    )
  }

  if (!session) return null

  const step = session.currentStep

  return (
    <div className="app-shell">
      {isDemoMode && <DemoBanner />}

      <div className="top-bar no-print">
        <button className="btn-ghost" onClick={() => setShowSettings(true)}>Settings</button>
      </div>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}

      {error && (
        <div className="container">
          <ErrorDisplay
            errorType={error}
            onRetry={handleRetry}
            onEditPrevious={handleEditPrevious}
            onStartOver={handleStartOver}
          />
        </div>
      )}

      {!error && (
        <>
          {step === 0 && (
            <WelcomeScreen
              onSubmit={handleWelcomeSubmit}
              onDemo={handleDemo}
              existingSession={null}
            />
          )}

          {step === 1 && (
            <Qualification
              message={qualifyMsg}
              originalProblem={session.originalProblem}
              onRevise={handleRevise}
            />
          )}

          {step === 2 && !loading && (
            <Discovery
              currentQuestion={currentQuestion}
              questionCount={session.questionCount}
              onAnswer={handleDiscoveryAnswer}
            />
          )}

          {loading && step <= 3 && step >= 2 && (
            <div className="container"><LoadingSpinner label={loadingLabel} /></div>
          )}

          {step === 4 && !loading && (
            <ProblemBrief
              problemStatement={session.validatedProblemStatement}
              onApprove={handleBriefApproved}
            />
          )}

          {step === 5 && (
            <AutoProcessing label="calculating" onMount={runRootCause} />
          )}

          {step === 6 && (
            <AutoProcessing label="reticulating splines" onMount={runResearchDecision} />
          )}

          {step === 7 && (
            <AutoProcessing label="calculating" onMount={runExternalResearch} />
          )}

          {step === 8 && (
            <AutoProcessing label="calculating" onMount={runResearchSynthesis} />
          )}

          {step === 9 && (
            <AutoProcessing label="calculating" onMount={runStrategicAnalysis} />
          )}

          {step === 10 && (
            <AutoProcessing label="calculating" onMount={runRecommendation} />
          )}

          {step === 11 && <Report session={session} />}
        </>
      )}
    </div>
  )
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
