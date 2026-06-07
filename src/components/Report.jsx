'use client'

function Badge({ value }) {
  if (!value) return null
  const lower = value.toLowerCase()
  const cls = lower === 'high' ? 'badge-high' : lower === 'medium' ? 'badge-medium' : lower === 'low' ? 'badge-low' : ''
  return <span className={`badge ${cls}`}>{value}</span>
}

function Field({ label, children }) {
  return (
    <div className="report-field">
      <span className="metadata-label">{label}</span>
      {children}
    </div>
  )
}

function List({ items }) {
  if (!items?.length) return <p style={{ color: 'var(--text-muted)' }}>None recorded.</p>
  return <ul style={{ paddingLeft: 20 }}>{items.map((item, i) => <li key={i}>{item}</li>)}</ul>
}

export default function Report({ session }) {
  const { validatedProblemStatement, rootCauseAnalysis, researchDecision, researchSynthesis, strategicAnalysis, recommendation } = session

  const hasResearch = researchDecision?.researchRequired !== false && researchSynthesis

  async function handleDownloadPDF() {
    const html2pdf = (await import('html2pdf.js')).default
    const element = document.getElementById('report-content')
    html2pdf().set({
      margin: 12,
      filename: 'gatekeeper-report.pdf',
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }).from(element).save()
  }

  return (
    <div className="container-wide" style={{ paddingTop: 40 }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1>Gatekeeper Report</h1>
        <button className="btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
      </div>

      <div id="report-content">

        {/* 1. Executive Summary */}
        <div className="report-section">
          <h2>1. Executive Summary</h2>
          {recommendation && (
            <>
              <Field label="Recommended Path">
                <p style={{ fontWeight: 600, marginTop: 4 }}>{recommendation.recommendedPath?.primaryApproach}</p>
                {recommendation.recommendedPath?.supportingApproaches?.length > 0 && (
                  <p className="metadata-label" style={{ marginTop: 4 }}>
                    Supporting: {recommendation.recommendedPath.supportingApproaches.join(', ')}
                  </p>
                )}
              </Field>
              <Field label="Recommendation Rationale">
                <p style={{ marginTop: 4 }}>{recommendation.rationale}</p>
              </Field>
              <Field label="Confidence">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <Badge value={recommendation.confidence?.rating} />
                  <span>{recommendation.confidence?.rationale}</span>
                </div>
              </Field>
              <Field label="Recommended Next Step">
                <p style={{ marginTop: 4 }}>{recommendation.nextStep}</p>
              </Field>
            </>
          )}
        </div>

        <hr className="section-divider" />

        {/* 2. Problem Definition */}
        <div className="report-section">
          <h2>2. Problem Definition</h2>
          <Field label="Validated Problem Statement">
            <p style={{ marginTop: 4 }}>{validatedProblemStatement}</p>
          </Field>
          {strategicAnalysis?.problemSignificance && (
            <Field label="Problem Significance">
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                <Badge value={strategicAnalysis.problemSignificance.rating} />
                <span>{strategicAnalysis.problemSignificance.rationale}</span>
              </div>
            </Field>
          )}
        </div>

        <hr className="section-divider" />

        {/* 3. Root Cause Analysis */}
        <div className="report-section">
          <h2>3. Root Cause Analysis</h2>
          {rootCauseAnalysis && (
            <>
              <Field label="Primary Root Cause">
                <h3 style={{ marginTop: 4 }}>{rootCauseAnalysis.primaryRootCause?.category}</h3>
                <p>{rootCauseAnalysis.primaryRootCause?.rationale}</p>
              </Field>
              {rootCauseAnalysis.contributingFactors?.length > 0 && (
                <Field label="Contributing Factors">
                  {rootCauseAnalysis.contributingFactors.map((f, i) => (
                    <div key={i} style={{ marginTop: 8 }}>
                      <strong>{f.category}</strong>
                      <p>{f.rationale}</p>
                    </div>
                  ))}
                </Field>
              )}
              <Field label="Confidence">
                <Badge value={rootCauseAnalysis.confidence} />
              </Field>
              <Field label="Evidence">
                <List items={rootCauseAnalysis.evidence} />
              </Field>
              <Field label="Assumptions">
                <List items={rootCauseAnalysis.assumptions} />
              </Field>
            </>
          )}
        </div>

        <hr className="section-divider" />

        {/* 4. Research Findings — hidden if no research */}
        {hasResearch && (
          <>
            <div className="report-section">
              <h2>4. Research Findings</h2>
              <Field label="Market Maturity">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <Badge value={researchSynthesis.marketMaturity?.rating} />
                  <span>{researchSynthesis.marketMaturity?.rationale}</span>
                </div>
              </Field>
              <Field label="Vendor Landscape">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <Badge value={researchSynthesis.vendorLandscape?.rating} />
                  <span>{researchSynthesis.vendorLandscape?.rationale}</span>
                </div>
              </Field>
              <Field label="AI Market Signals">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <Badge value={researchSynthesis.aiMarketSignals?.rating} />
                  <span>{researchSynthesis.aiMarketSignals?.rationale}</span>
                </div>
              </Field>
              <Field label="Key Research Findings">
                <List items={researchSynthesis.keyResearchFindings} />
              </Field>
              <Field label="Common Failure Patterns">
                <List items={researchSynthesis.failurePatternSummary} />
              </Field>
            </div>
            <hr className="section-divider" />
          </>
        )}

        {/* 5. Strategic Analysis */}
        <div className="report-section">
          <h2>{hasResearch ? '5' : '4'}. Strategic Analysis</h2>
          {strategicAnalysis && (
            <>
              {strategicAnalysis.solutionLandscape?.alternativesEvaluated?.length > 0 && (
                <Field label="Alternatives Evaluated">
                  {strategicAnalysis.solutionLandscape.alternativesEvaluated.map((alt, i) => (
                    <div key={i} style={{ marginTop: 12, paddingLeft: 12, borderLeft: '3px solid var(--structure-bg)' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                        <strong>{alt.approach}</strong>
                        <Badge value={alt.fit} />
                      </div>
                      <p style={{ marginBottom: 4 }}>{alt.rationale}</p>
                      {alt.keyTradeoffs?.length > 0 && (
                        <p className="metadata-label">Tradeoffs: {alt.keyTradeoffs.join(' · ')}</p>
                      )}
                    </div>
                  ))}
                </Field>
              )}
              {strategicAnalysis.solutionLandscape?.alternativesNotEvaluated?.length > 0 && (
                <Field label="Alternatives Not Evaluated">
                  {strategicAnalysis.solutionLandscape.alternativesNotEvaluated.map((alt, i) => (
                    <div key={i} style={{ marginTop: 4 }}>
                      <strong>{alt.approach}</strong>: <span>{alt.reason}</span>
                    </div>
                  ))}
                </Field>
              )}
              <Field label="Build vs Buy">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <Badge value={strategicAnalysis.buildVsBuy?.recommendedApproach} />
                  <span>{strategicAnalysis.buildVsBuy?.rationale}</span>
                </div>
              </Field>
              <Field label="Economic Considerations">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
                  {[
                    ['Implementation Cost', strategicAnalysis.economicConsiderations?.implementationCost],
                    ['Operational Cost', strategicAnalysis.economicConsiderations?.operationalCost],
                    ['Time to Value', strategicAnalysis.economicConsiderations?.timeToValue],
                    ['Opportunity Cost', strategicAnalysis.economicConsiderations?.opportunityCost],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <span className="metadata-label">{lbl}</span>
                      <div><Badge value={val} /></div>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 8 }}>{strategicAnalysis.economicConsiderations?.rationale}</p>
              </Field>
              <Field label="Human Impact">
                <p><strong>Capability enhancement:</strong> {strategicAnalysis.humanImpact?.capabilityEnhancement}</p>
                <p style={{ marginTop: 4 }}><strong>Capability risk:</strong> {strategicAnalysis.humanImpact?.capabilityRisk}</p>
                <p style={{ marginTop: 4 }}><strong>Judgment requirements:</strong> {strategicAnalysis.humanImpact?.humanJudgmentRequirements}</p>
                <p style={{ marginTop: 4 }}><strong>Knowledge retention:</strong> {strategicAnalysis.humanImpact?.knowledgeRetentionConsiderations}</p>
              </Field>
              <Field label="AI Assessment">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <Badge value={strategicAnalysis.aiAssessment?.rating} />
                  <span>{strategicAnalysis.aiAssessment?.rationale}</span>
                </div>
              </Field>
              <Field label="Strategic Insights">
                <List items={strategicAnalysis.strategicInsights} />
              </Field>
            </>
          )}
        </div>

        <hr className="section-divider" />

        {/* 6. Recommendation */}
        <div className="report-section">
          <h2>{hasResearch ? '6' : '5'}. Recommendation</h2>
          {recommendation && (
            <>
              <Field label="Recommended Path">
                <p style={{ fontWeight: 600, marginTop: 4 }}>{recommendation.recommendedPath?.primaryApproach}</p>
                {recommendation.recommendedPath?.supportingApproaches?.length > 0 && (
                  <p className="metadata-label">Supporting: {recommendation.recommendedPath.supportingApproaches.join(', ')}</p>
                )}
              </Field>
              <Field label="Root Cause Alignment">
                <p style={{ marginTop: 4 }}>{recommendation.rootCauseAlignment}</p>
              </Field>
              {recommendation.alternativesNotSelected?.length > 0 && (
                <Field label="Alternatives Not Selected">
                  {recommendation.alternativesNotSelected.map((alt, i) => (
                    <div key={i} style={{ marginTop: 4 }}>
                      <strong>{alt.approach}</strong>: <span>{alt.reasonNotSelected}</span>
                    </div>
                  ))}
                </Field>
              )}
              <Field label="Risks">
                <List items={recommendation.risks} />
              </Field>
              <Field label="Confidence">
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <Badge value={recommendation.confidence?.rating} />
                  <span>{recommendation.confidence?.rationale}</span>
                </div>
              </Field>
              <Field label="Next Step">
                <p style={{ marginTop: 4, fontWeight: 500 }}>{recommendation.nextStep}</p>
              </Field>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
