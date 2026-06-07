const MESSAGES = {
  TIMEOUT: 'This request took too long. Your progress has been saved. You can retry or revise your input.',
  INVALID_JSON: 'Gatekeeper received an unexpected response. Please retry.',
  API_ERROR: 'Something went wrong while contacting OpenAI. Your progress has been saved. Please try again.',
  NO_API_KEY: 'No API key is configured. Please add your OpenAI API key in Settings.',
  DEFAULT: 'Something went wrong while contacting OpenAI. Your progress has been saved. Please try again.',
}

export default function ErrorDisplay({ errorType, onRetry, onEditPrevious, onStartOver }) {
  const message = MESSAGES[errorType] || MESSAGES.DEFAULT
  const showEdit = errorType !== 'INVALID_JSON' && errorType !== 'NO_API_KEY'
  const showRetry = errorType !== 'NO_API_KEY'

  return (
    <div className="error-box">
      <p>{message}</p>
      <div className="button-row">
        {showRetry && (
          <button className="btn-primary" onClick={onRetry}>Retry</button>
        )}
        {showEdit && onEditPrevious && (
          <button className="btn-secondary" onClick={onEditPrevious}>Edit previous input</button>
        )}
        <button className="btn-secondary" onClick={onStartOver}>Start over</button>
      </div>
    </div>
  )
}
