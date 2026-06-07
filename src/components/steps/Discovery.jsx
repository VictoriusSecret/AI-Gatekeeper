'use client'
import { useState } from 'react'

export default function Discovery({ currentQuestion, questionCount, onAnswer }) {
  const [answer, setAnswer] = useState('')

  function handleSubmit() {
    onAnswer(currentQuestion, answer)
    setAnswer('')
  }

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <p className="metadata-label" style={{ marginBottom: 8 }}>
        Discovery — question {questionCount}
      </p>
      <h2 style={{ marginBottom: 24, fontSize: '1.3rem' }}>{currentQuestion}</h2>
      <textarea
        rows={5}
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        placeholder="Your answer…"
        style={{ marginBottom: 16 }}
      />
      <button className="btn-primary" onClick={handleSubmit} disabled={!answer.trim()}>
        Continue
      </button>
    </div>
  )
}
