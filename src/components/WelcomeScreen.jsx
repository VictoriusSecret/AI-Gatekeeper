'use client'
import { useState } from 'react'

export default function WelcomeScreen({ onSubmit, onDemo, existingSession }) {
  const [problem, setProblem] = useState('')
  const [showResume, setShowResume] = useState(!!existingSession)

  if (showResume) {
    return (
      <div className="container" style={{ paddingTop: 60 }}>
        <h1 style={{ marginBottom: 16 }}>Welcome back</h1>
        <p style={{ marginBottom: 32 }}>You have a previous session in progress. Would you like to resume where you left off?</p>
        <div className="button-row">
          <button className="btn-primary" onClick={() => onSubmit(null, true)}>Resume previous session</button>
          <button className="btn-secondary" onClick={() => setShowResume(false)}>Start over</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <h1 style={{ marginBottom: 16 }}>Welcome to AI Gatekeeper</h1>
      <p style={{ marginBottom: 12 }}>
        AI Gatekeeper is a decision-support application that helps organizations evaluate business problems and determine the most sensible path forward, whether that path involves AI or not.
      </p>
      <p style={{ marginBottom: 12 }}>
        The application begins with a business problem rather than a proposed solution. Through a conversational discovery process, AI Gatekeeper identifies likely root causes, evaluates potential solution approaches, conducts research, and recommends a single primary course of action.
      </p>
      <p style={{ marginBottom: 40 }}>
        AI Gatekeeper is not intended to replace formal business case development, architectural review, procurement processes, or project planning. It is intended to provide practical, evidence-based recommendations that help organizations make more informed investment decisions.
      </p>

      <h2 style={{ marginBottom: 16 }}>What problem are you trying to solve today?</h2>
      <textarea
        rows={5}
        value={problem}
        onChange={e => setProblem(e.target.value)}
        placeholder="Describe your business problem…"
        style={{ marginBottom: 16 }}
      />
      <div className="button-row" style={{ marginBottom: 32 }}>
        <button className="btn-primary" onClick={() => onSubmit(problem)} disabled={!problem.trim()}>
          Get started
        </button>
        <button className="btn-ghost" onClick={onDemo}>Try Demo</button>
      </div>

      <p className="metadata-label" style={{ marginBottom: 8 }}>Here are some examples:</p>
      <ul style={{ paddingLeft: 20, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 2 }}>
        <li>Our support team manually reviews and categorizes approximately 5,000 tickets per month before assigning them to specialists.</li>
        <li>We receive product data from dozens of suppliers and spend significant time normalizing it before it can be imported into our platform.</li>
        <li>Our employees struggle to locate company policies and frequently ask HR questions that are already documented.</li>
        <li>Managers spend significant time writing performance reviews and often feel unsure about what feedback to provide.</li>
        <li>A multi-step approval process causes delays and confusion between departments.</li>
      </ul>
    </div>
  )
}
