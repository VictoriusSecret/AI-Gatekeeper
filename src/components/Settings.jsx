'use client'
import { useState, useEffect } from 'react'
import { getApiKey, setApiKey } from '@/lib/session'

export default function Settings({ onClose }) {
  const [key, setKey] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const existing = getApiKey()
    if (existing) setKey(existing)
  }, [])

  function handleSave() {
    const trimmed = key.trim()
    if (!trimmed) {
      setError('Please enter an API key.')
      return
    }
    setApiKey(trimmed)
    setSaved(true)
    setError('')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', borderRadius: 10, padding: 32, maxWidth: 480, width: '100%', margin: '0 24px' }}>
        <h2 style={{ marginBottom: 24 }}>Settings</h2>
        <div style={{ marginBottom: 8 }}>
          <label className="metadata-label" style={{ display: 'block', marginBottom: 6 }}>OpenAI API Key</label>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setError(''); setSaved(false) }}
            placeholder="sk-..."
          />
        </div>
        {error && <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: 8 }}>{error}</p>}
        <p className="metadata-label" style={{ marginBottom: 20 }}>
          Your key is stored locally in this browser only.
        </p>
        <div className="button-row">
          <button className="btn-primary" onClick={handleSave}>
            {saved ? 'Saved!' : 'Save key'}
          </button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}
