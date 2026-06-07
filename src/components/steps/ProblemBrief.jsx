'use client'
import { useState } from 'react'

export default function ProblemBrief({ problemStatement, onApprove }) {
  const [text, setText] = useState(problemStatement)

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <p className="metadata-label" style={{ marginBottom: 8 }}>Review your problem statement</p>
      <h2 style={{ marginBottom: 8 }}>Does this capture your problem accurately?</h2>
      <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>
        This statement was generated from the discovery conversation. You can edit it before we proceed to analysis.
      </p>
      <textarea
        rows={8}
        value={text}
        onChange={e => setText(e.target.value)}
        style={{ marginBottom: 16 }}
      />
      <button className="btn-primary" onClick={() => onApprove(text)} disabled={!text.trim()}>
        Approve and continue
      </button>
    </div>
  )
}
