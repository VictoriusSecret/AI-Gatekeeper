# Gatekeeper — Six UI & Report Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix six issues covering session persistence, report formatting, a premature UI element, app footer, and PDF attribution.

**Architecture:** Four files are modified — `page.js` wires new props and adds guards, `WelcomeScreen.jsx` and `Report.jsx` accept new `onStartOver` props, `layout.js` gains a footer, and `Report.jsx` is restructured to flat bullet lists with inline badges.

**Tech Stack:** Next.js 16.2.7 (App Router), React 19, html2pdf.js 0.14, plain CSS (no test runner in project — verification is `npm run build` + manual browser check)

> ⚠️ Per AGENTS.md: Read `node_modules/next/dist/docs/` if you are unsure about any Next.js API. These changes only touch React JSX and the root layout — no Next.js-specific APIs are used beyond `export const metadata` which is unchanged.

---

## File Map

| File | Changes |
|------|---------|
| `src/components/WelcomeScreen.jsx` | Task 1 — accept `onStartOver` prop, call it from "Start over" button |
| `src/app/page.js` | Tasks 2, 4 — pass `onStartOver` props to WelcomeScreen and Report; add `!showResume` guard on steps 1–11 |
| `src/app/layout.js` | Task 3 — add `<footer>` element |
| `src/components/Report.jsx` | Tasks 4, 5 — full JSX rewrite (flat bullets, inline badges, Start Over button, PDF attribution) |

---

## Task 1: Fix "Start over" in resume dialog

**Files:**
- Modify: `src/components/WelcomeScreen.jsx`
- Modify: `src/app/page.js`

- [ ] **Step 1: Update WelcomeScreen to accept and use `onStartOver` prop**

Replace the entire file content of `src/components/WelcomeScreen.jsx`:

```jsx
'use client'
import { useState } from 'react'

export default function WelcomeScreen({ onSubmit, onDemo, onStartOver, existingSession }) {
  const [problem, setProblem] = useState('')
  const [showResume, setShowResume] = useState(!!existingSession)

  if (showResume) {
    return (
      <div className="container" style={{ paddingTop: 60 }}>
        <h1 style={{ marginBottom: 16 }}>Welcome back</h1>
        <p style={{ marginBottom: 32 }}>You have a previous session in progress. Would you like to resume where you left off?</p>
        <div className="button-row">
          <button className="btn-primary" onClick={() => onSubmit(null, true)}>Resume previous session</button>
          <button className="btn-secondary" onClick={onStartOver}>Start over</button>
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
```

- [ ] **Step 2: Build check**

```
npm run build
```

Expected: exits 0 with no errors.

- [ ] **Step 3: Commit**

```
git add src/components/WelcomeScreen.jsx
git commit -m "fix: accept onStartOver prop in WelcomeScreen resume dialog"
```

---

## Task 2: Wire props and guard step renders in page.js

**Files:**
- Modify: `src/app/page.js`

- [ ] **Step 1: Replace the `{!error && ...}` render section with guarded renders and wired props**

This single edit adds `onStartOver={handleStartOver}` to WelcomeScreen and Report, and adds `!showResume` guards to every step-conditional block so no workflow component renders while the resume dialog is visible.

In `src/app/page.js`, update every step-gated JSX block inside the `{!error && ...}` section. The full replacement for that section (lines ~383–446) is:

```jsx
{!error && (
  <>
    {(step === 0 || showResume) && (
      <WelcomeScreen
        onSubmit={handleWelcomeSubmit}
        onDemo={handleDemo}
        onStartOver={handleStartOver}
        existingSession={showResume ? session : null}
      />
    )}

    {step === 1 && !showResume && (
      <Qualification
        message={qualifyMsg}
        originalProblem={session.originalProblem}
        onRevise={handleRevise}
      />
    )}

    {step === 2 && !loading && !showResume && (
      <Discovery
        currentQuestion={currentQuestion}
        questionCount={session.questionCount}
        onAnswer={handleDiscoveryAnswer}
      />
    )}

    {loading && step <= 3 && step >= 2 && !showResume && (
      <div className="container"><LoadingSpinner label={loadingLabel} /></div>
    )}

    {step === 4 && !loading && !showResume && (
      <ProblemBrief
        problemStatement={session.validatedProblemStatement}
        onApprove={handleBriefApproved}
      />
    )}

    {step === 5 && !showResume && (
      <AutoProcessing label="calculating" onMount={runRootCause} />
    )}

    {step === 6 && !showResume && (
      <AutoProcessing label="reticulating splines" onMount={runResearchDecision} />
    )}

    {step === 7 && !showResume && (
      <AutoProcessing label="calculating" onMount={runExternalResearch} />
    )}

    {step === 8 && !showResume && (
      <AutoProcessing label="calculating" onMount={runResearchSynthesis} />
    )}

    {step === 9 && !showResume && (
      <AutoProcessing label="calculating" onMount={runStrategicAnalysis} />
    )}

    {step === 10 && !showResume && (
      <AutoProcessing label="calculating" onMount={runRecommendation} />
    )}

    {step === 11 && !showResume && <Report session={session} onStartOver={handleStartOver} />}
  </>
)}
```

- [ ] **Step 2: Build check**

```
npm run build
```

Expected: exits 0 with no errors.

- [ ] **Step 3: Manual verify**

Run `npm run dev`. 

**Verify Issue 1 fix:** Complete the demo, refresh, click "Start over" in the resume dialog. Confirm: you land on the blank welcome screen and refreshing again shows the welcome screen (not the resume dialog), proving localStorage was cleared.

**Verify Issue 4 fix:** Start the demo and answer one discovery question (so step=2 is saved). Refresh. Confirm: only the resume dialog appears — no "Discovery — question 0" text box is visible below it.

- [ ] **Step 4: Commit**

```
git add src/app/page.js
git commit -m "fix: wire onStartOver props and guard step renders during resume"
```

---

## Task 3: Add app footer

**Files:**
- Modify: `src/app/layout.js`

- [ ] **Step 1: Add footer to root layout**

Replace the entire file content of `src/app/layout.js`:

```jsx
import './globals.css'

export const metadata = {
  title: 'AI Gatekeeper',
  description: 'Decision-support for business problem evaluation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-shell">
        {children}
        <footer className="no-print" style={{
          borderTop: '1px solid #e2e8f0',
          padding: '16px 24px',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: '#9ca3af',
          letterSpacing: '0.02em',
        }}>
          AI Gatekeeper &nbsp;·&nbsp; Built by Sarah Douglas &nbsp;·&nbsp;
          github.com/VictoriusSecret &nbsp;·&nbsp; linkedin.com/in/sarahbdouglas/
        </footer>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Build check**

```
npm run build
```

Expected: exits 0 with no errors.

- [ ] **Step 3: Manual verify**

Run `npm run dev`. Open http://localhost:3000. Scroll to the bottom of the welcome screen and confirm the footer text is visible. Navigate through a demo to the report and confirm the footer is still visible below the report. Trigger a print preview (`Ctrl+P`) and confirm the footer is absent from the print view.

- [ ] **Step 4: Commit**

```
git add src/app/layout.js
git commit -m "feat: add attribution footer to root layout"
```

---

## Task 4: Reformat Report — flat bullets, inline badges, Start Over button

**Files:**
- Modify: `src/components/Report.jsx`

- [ ] **Step 1: Replace Report.jsx with restructured version**

Replace the entire file content of `src/components/Report.jsx`:

```jsx
'use client'

function Badge({ value }) {
  if (!value) return null
  const lower = value.toLowerCase()
  const cls = lower === 'high' ? 'badge-high' : lower === 'medium' ? 'badge-medium' : lower === 'low' ? 'badge-low' : ''
  return <span className={`badge ${cls}`}>{value}</span>
}

function SubList({ items }) {
  if (!items?.length) return null
  return (
    <ul style={{ listStyle: 'none', paddingLeft: 20, margin: '4px 0 0' }}>
      {items.map((item, i) => <li key={i}>– {item}</li>)}
    </ul>
  )
}

const li = { marginBottom: 8, listStyle: 'none' }
const ul = { listStyle: 'none', padding: 0, margin: 0 }
const sub = { listStyle: 'none', paddingLeft: 20, margin: '4px 0 0' }

export default function Report({ session, onStartOver }) {
  const {
    validatedProblemStatement, rootCauseAnalysis, researchDecision,
    researchSynthesis, strategicAnalysis, recommendation,
  } = session

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
    }).from(element).toPdf().get('pdf').then((pdf) => {
      const total = pdf.internal.getNumberOfPages()
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      pdf.setFontSize(8)
      pdf.setTextColor(156, 163, 175)
      for (let i = 1; i <= total; i++) {
        pdf.setPage(i)
        pdf.text(
          'Generated by AI Gatekeeper · Built by Sarah Douglas · github.com/VictoriusSecret · linkedin.com/in/sarahbdouglas/',
          pageW / 2,
          pageH - 8,
          { align: 'center' }
        )
      }
    }).save()
  }

  return (
    <div className="container-wide" style={{ paddingTop: 40 }}>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1>Gatekeeper Report</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-primary" onClick={handleDownloadPDF}>Download PDF</button>
          <button className="btn-secondary" onClick={onStartOver}>Start over</button>
        </div>
      </div>

      <div id="report-content">

        {/* 1. Executive Summary */}
        <div className="report-section">
          <h2>1. Executive Summary</h2>
          {recommendation && (
            <ul style={ul}>
              <li style={li}>• <strong>Recommended Path:</strong> {recommendation.recommendedPath?.primaryApproach}
                {recommendation.recommendedPath?.supportingApproaches?.length > 0 && (
                  <ul style={sub}>
                    {recommendation.recommendedPath.supportingApproaches.map((a, i) => (
                      <li key={i}>– Supporting: {a}</li>
                    ))}
                  </ul>
                )}
              </li>
              <li style={li}>• <strong>Rationale:</strong> {recommendation.rationale}</li>
              <li style={li}>• Confidence: <Badge value={recommendation.confidence?.rating} />{recommendation.confidence?.rationale ? ` — ${recommendation.confidence.rationale}` : ''}</li>
              <li style={li}>• <strong>Next Step:</strong> {recommendation.nextStep}</li>
            </ul>
          )}
        </div>

        <hr className="section-divider" />

        {/* 2. Problem Definition */}
        <div className="report-section">
          <h2>2. Problem Definition</h2>
          <ul style={ul}>
            <li style={li}>• <strong>Validated Problem Statement:</strong> {validatedProblemStatement}</li>
            {strategicAnalysis?.problemSignificance && (
              <li style={li}>• Problem Significance: <Badge value={strategicAnalysis.problemSignificance.rating} />{strategicAnalysis.problemSignificance.rationale ? ` — ${strategicAnalysis.problemSignificance.rationale}` : ''}</li>
            )}
          </ul>
        </div>

        <hr className="section-divider" />

        {/* 3. Root Cause Analysis */}
        <div className="report-section">
          <h2>3. Root Cause Analysis</h2>
          {rootCauseAnalysis && (
            <ul style={ul}>
              <li style={li}>• <strong>Primary Root Cause:</strong> {rootCauseAnalysis.primaryRootCause?.category}
                {rootCauseAnalysis.primaryRootCause?.rationale && (
                  <ul style={sub}><li>– {rootCauseAnalysis.primaryRootCause.rationale}</li></ul>
                )}
              </li>
              {rootCauseAnalysis.contributingFactors?.length > 0 && (
                <li style={li}>• <strong>Contributing Factors:</strong>
                  <ul style={sub}>
                    {rootCauseAnalysis.contributingFactors.map((f, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>– <strong>{f.category}:</strong> {f.rationale}</li>
                    ))}
                  </ul>
                </li>
              )}
              <li style={li}>• Confidence: <Badge value={rootCauseAnalysis.confidence} /></li>
              {rootCauseAnalysis.evidence?.length > 0 && (
                <li style={li}>• <strong>Evidence:</strong>
                  <SubList items={rootCauseAnalysis.evidence} />
                </li>
              )}
              {rootCauseAnalysis.assumptions?.length > 0 && (
                <li style={li}>• <strong>Assumptions:</strong>
                  <SubList items={rootCauseAnalysis.assumptions} />
                </li>
              )}
            </ul>
          )}
        </div>

        <hr className="section-divider" />

        {/* 4. Research Findings — hidden if no research */}
        {hasResearch && (
          <>
            <div className="report-section">
              <h2>4. Research Findings</h2>
              <ul style={ul}>
                <li style={li}>• Market Maturity: <Badge value={researchSynthesis.marketMaturity?.rating} />{researchSynthesis.marketMaturity?.rationale ? ` — ${researchSynthesis.marketMaturity.rationale}` : ''}</li>
                <li style={li}>• Vendor Landscape: <Badge value={researchSynthesis.vendorLandscape?.rating} />{researchSynthesis.vendorLandscape?.rationale ? ` — ${researchSynthesis.vendorLandscape.rationale}` : ''}</li>
                <li style={li}>• AI Market Signals: <Badge value={researchSynthesis.aiMarketSignals?.rating} />{researchSynthesis.aiMarketSignals?.rationale ? ` — ${researchSynthesis.aiMarketSignals.rationale}` : ''}</li>
                {researchSynthesis.keyResearchFindings?.length > 0 && (
                  <li style={li}>• <strong>Key Research Findings:</strong>
                    <SubList items={researchSynthesis.keyResearchFindings} />
                  </li>
                )}
                {researchSynthesis.failurePatternSummary?.length > 0 && (
                  <li style={li}>• <strong>Common Failure Patterns:</strong>
                    <SubList items={researchSynthesis.failurePatternSummary} />
                  </li>
                )}
              </ul>
            </div>
            <hr className="section-divider" />
          </>
        )}

        {/* 5. Strategic Analysis */}
        <div className="report-section">
          <h2>{hasResearch ? '5' : '4'}. Strategic Analysis</h2>
          {strategicAnalysis && (
            <ul style={ul}>
              {strategicAnalysis.solutionLandscape?.alternativesEvaluated?.length > 0 && (
                <li style={li}>• <strong>Alternatives Evaluated:</strong>
                  <ul style={sub}>
                    {strategicAnalysis.solutionLandscape.alternativesEvaluated.map((alt, i) => (
                      <li key={i} style={{ marginBottom: 6 }}>
                        – <strong>{alt.approach}</strong> <Badge value={alt.fit} />
                        {(alt.rationale || alt.keyTradeoffs?.length > 0) && (
                          <ul style={{ listStyle: 'none', paddingLeft: 16, margin: '2px 0 0' }}>
                            {alt.rationale && <li>{alt.rationale}</li>}
                            {alt.keyTradeoffs?.length > 0 && <li>Tradeoffs: {alt.keyTradeoffs.join(' · ')}</li>}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              )}
              {strategicAnalysis.solutionLandscape?.alternativesNotEvaluated?.length > 0 && (
                <li style={li}>• <strong>Alternatives Not Evaluated:</strong>
                  <ul style={sub}>
                    {strategicAnalysis.solutionLandscape.alternativesNotEvaluated.map((alt, i) => (
                      <li key={i}>– <strong>{alt.approach}:</strong> {alt.reason}</li>
                    ))}
                  </ul>
                </li>
              )}
              <li style={li}>• Build vs Buy: <Badge value={strategicAnalysis.buildVsBuy?.recommendedApproach} />{strategicAnalysis.buildVsBuy?.rationale ? ` — ${strategicAnalysis.buildVsBuy.rationale}` : ''}</li>
              {strategicAnalysis.economicConsiderations && (
                <li style={li}>• <strong>Economic Considerations:</strong>
                  <ul style={sub}>
                    <li>– Implementation Cost: <Badge value={strategicAnalysis.economicConsiderations.implementationCost} /></li>
                    <li>– Operational Cost: <Badge value={strategicAnalysis.economicConsiderations.operationalCost} /></li>
                    <li>– Time to Value: <Badge value={strategicAnalysis.economicConsiderations.timeToValue} /></li>
                    <li>– Opportunity Cost: <Badge value={strategicAnalysis.economicConsiderations.opportunityCost} /></li>
                    {strategicAnalysis.economicConsiderations.rationale && (
                      <li>{strategicAnalysis.economicConsiderations.rationale}</li>
                    )}
                  </ul>
                </li>
              )}
              {strategicAnalysis.humanImpact && (
                <li style={li}>• <strong>Human Impact:</strong>
                  <ul style={sub}>
                    {strategicAnalysis.humanImpact.capabilityEnhancement && <li>– Capability enhancement: {strategicAnalysis.humanImpact.capabilityEnhancement}</li>}
                    {strategicAnalysis.humanImpact.capabilityRisk && <li>– Capability risk: {strategicAnalysis.humanImpact.capabilityRisk}</li>}
                    {strategicAnalysis.humanImpact.humanJudgmentRequirements && <li>– Judgment requirements: {strategicAnalysis.humanImpact.humanJudgmentRequirements}</li>}
                    {strategicAnalysis.humanImpact.knowledgeRetentionConsiderations && <li>– Knowledge retention: {strategicAnalysis.humanImpact.knowledgeRetentionConsiderations}</li>}
                  </ul>
                </li>
              )}
              <li style={li}>• AI Assessment: <Badge value={strategicAnalysis.aiAssessment?.rating} />{strategicAnalysis.aiAssessment?.rationale ? ` — ${strategicAnalysis.aiAssessment.rationale}` : ''}</li>
              {strategicAnalysis.strategicInsights?.length > 0 && (
                <li style={li}>• <strong>Strategic Insights:</strong>
                  <SubList items={strategicAnalysis.strategicInsights} />
                </li>
              )}
            </ul>
          )}
        </div>

        <hr className="section-divider" />

        {/* 6. Recommendation */}
        <div className="report-section">
          <h2>{hasResearch ? '6' : '5'}. Recommendation</h2>
          {recommendation && (
            <ul style={ul}>
              <li style={li}>• <strong>Recommended Path:</strong> {recommendation.recommendedPath?.primaryApproach}
                {recommendation.recommendedPath?.supportingApproaches?.length > 0 && (
                  <ul style={sub}>
                    {recommendation.recommendedPath.supportingApproaches.map((a, i) => (
                      <li key={i}>– Supporting: {a}</li>
                    ))}
                  </ul>
                )}
              </li>
              <li style={li}>• <strong>Root Cause Alignment:</strong> {recommendation.rootCauseAlignment}</li>
              {recommendation.alternativesNotSelected?.length > 0 && (
                <li style={li}>• <strong>Alternatives Not Selected:</strong>
                  <ul style={sub}>
                    {recommendation.alternativesNotSelected.map((alt, i) => (
                      <li key={i}>– <strong>{alt.approach}:</strong> {alt.reasonNotSelected}</li>
                    ))}
                  </ul>
                </li>
              )}
              {recommendation.risks?.length > 0 && (
                <li style={li}>• <strong>Risks:</strong>
                  <SubList items={recommendation.risks} />
                </li>
              )}
              <li style={li}>• Confidence: <Badge value={recommendation.confidence?.rating} />{recommendation.confidence?.rationale ? ` — ${recommendation.confidence.rationale}` : ''}</li>
              <li style={li}>• <strong>Next Step:</strong> {recommendation.nextStep}</li>
            </ul>
          )}
        </div>

      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

```
npm run build
```

Expected: exits 0 with no errors.

- [ ] **Step 3: Manual verify**

Run `npm run dev`. Run the full demo through to the report. Confirm:
- Each section shows bullet items (`•`) with bold labels inline
- Sub-items use `–` prefix
- Badges (e.g. `[high]`) appear on the same line as their label
- A "Start over" button is visible next to "Download PDF" in the top-right
- Clicking "Start over" returns to the welcome screen

- [ ] **Step 4: Commit**

```
git add src/components/Report.jsx
git commit -m "feat: reformat report to flat bullets with inline badges and add Start Over button"
```

---

## Task 5: Add PDF attribution footer

> Note: This task is already included in the `handleDownloadPDF` function written in Task 4. No additional code changes are required.

- [ ] **Step 1: Verify PDF attribution is present in Report.jsx**

Open `src/components/Report.jsx` and confirm `handleDownloadPDF` contains the `.toPdf().get('pdf').then(...)` block that iterates pages and calls `pdf.text(...)`. It was written as part of Task 4. If it is missing, add it now per the code in Task 4, Step 1.

- [ ] **Step 2: Manual verify**

Run `npm run dev`. Complete the demo to the report. Click "Download PDF". Open the downloaded `gatekeeper-report.pdf`. Confirm the attribution line appears at the bottom of each page:

```
Generated by AI Gatekeeper · Built by Sarah Douglas · github.com/VictoriusSecret · linkedin.com/in/sarahbdouglas/
```

- [ ] **Step 3: Commit (if any fix was needed in Step 1)**

Only commit if Step 1 required a code change:

```
git add src/components/Report.jsx
git commit -m "feat: add per-page attribution footer to PDF export"
```
