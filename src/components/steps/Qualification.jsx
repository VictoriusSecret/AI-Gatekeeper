'use client'
import { useState } from 'react'

export default function Qualification({ message, originalProblem, onRevise }) {
  const [revised, setRevised] = useState(originalProblem || '')

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <h2 style={{ marginBottom: 16 }}>Let's refine your problem statement</h2>
      <p style={{ marginBottom: 24 }}>{message}</p>
      <textarea
        rows={6}
        value={revised}
        onChange={e => setRevised(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <button className="btn-primary" onClick={() => onRevise(revised)} disabled={!revised.trim()}>
        Submit
      </button>
    </div>
  )
}
