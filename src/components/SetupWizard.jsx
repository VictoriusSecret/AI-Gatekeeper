'use client'
import { useState } from 'react'
import { setApiKey } from '@/lib/session'

export default function SetupWizard({ onComplete }) {
  const [apiKey, setKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function handleSave() {
    const trimmed = apiKey.trim()
    if (!trimmed.startsWith('sk-')) {
      setError('API keys typically start with "sk-". Please check your key.')
      return
    }
    setApiKey(trimmed)
    setSaved(true)
    setError('')
  }

  return (
    <div className="container" style={{ paddingTop: 80 }}>
      <h1 style={{ marginBottom: 24 }}>Welcome to AI Gatekeeper</h1>
      <p style={{ marginBottom: 32, color: 'var(--text-muted)' }}>
        AI Gatekeeper helps organizations evaluate business problems and determine the most sensible path forward — whether that path involves AI or not. It begins with your problem, not a proposed solution, and works through a structured discovery and analysis process to produce a practical, evidence-based recommendation.
      </p>

      {!saved ? (
        <div className="card">
          <h2 style={{ marginBottom: 16, fontSize: '1.2rem' }}>Set up your OpenAI API key</h2>
          <p style={{ marginBottom: 20 }}>
            AI Gatekeeper uses the OpenAI API to conduct its analysis. You will need an API key from OpenAI.{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--startup-spark)' }}>
              Get a key here
            </a>
            .
          </p>
          <div style={{ marginBottom: 16 }}>
            <label className="metadata-label" style={{ display: 'block', marginBottom: 6 }}>OpenAI API Key</label>
            <input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={e => { setKey(e.target.value); setError('') }}
            />
          </div>
          {error && <p style={{ color: '#dc2626', marginBottom: 12, fontSize: '0.875rem' }}>{error}</p>}
          <p className="metadata-label" style={{ marginBottom: 16 }}>Your key is stored locally in this browser only and is never sent to any server other than OpenAI.</p>
          <button className="btn-primary" onClick={handleSave} disabled={!apiKey.trim()}>
            Save and continue
          </button>
        </div>
      ) : (
        <div className="card">
          <p style={{ marginBottom: 20 }}>Your API key has been saved. You are ready to begin.</p>
          <button className="btn-primary" onClick={onComplete}>Get started</button>
        </div>
      )}
    </div>
  )
}
