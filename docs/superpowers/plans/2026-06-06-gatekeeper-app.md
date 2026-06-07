# AI Gatekeeper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the AI Gatekeeper Next.js application as specified in SPEC.md — a multi-step decision-support tool that evaluates business problems via OpenAI and generates structured recommendations.

**Architecture:** Single Next.js App Router application. All OpenAI calls run server-side in API routes that read prompt files from `/prompts`. Client holds session state in `localStorage` under `gatekeeper_session`. Main page.js is the step orchestrator; each step is a separate component.

**Tech Stack:** Next.js 14 (App Router), JavaScript, OpenAI API (gpt-4o-mini), html2pdf.js for PDF export, Google Fonts (Space Grotesk + Inter)

---

## File Map

| File | Responsibility |
|------|---------------|
| `src/app/page.js` | Step orchestrator — holds session state, renders active step component |
| `src/app/layout.js` | Root layout with Google Fonts |
| `src/app/globals.css` | Design tokens, global typography, shared classes |
| `src/app/api/qualify/route.js` | Qualification API route |
| `src/app/api/discover/route.js` | Discovery interview API route |
| `src/app/api/problem-brief/route.js` | Problem brief generation API route |
| `src/app/api/root-cause/route.js` | Root cause analysis API route |
| `src/app/api/research-decision/route.js` | Research decision API route |
| `src/app/api/external-research/route.js` | External research API route |
| `src/app/api/research-synthesis/route.js` | Research synthesis API route |
| `src/app/api/strategic-analysis/route.js` | Strategic analysis API route |
| `src/app/api/recommendation/route.js` | Recommendation generation API route |
| `src/lib/session.js` | localStorage read/write helpers + initial state |
| `src/lib/demo-data.js` | Complete mock responses for demo mode |
| `src/components/SetupWizard.jsx` | First-launch API key wizard |
| `src/components/WelcomeScreen.jsx` | Step 0 — problem input + demo button |
| `src/components/Settings.jsx` | API key settings panel |
| `src/components/ErrorDisplay.jsx` | Error state with Retry/Edit/Start Over buttons |
| `src/components/LoadingSpinner.jsx` | Spinner with label |
| `src/components/DemoBanner.jsx` | Demo mode indicator banner |
| `src/components/steps/Qualification.jsx` | Step 1 — qualification result + revise flow |
| `src/components/steps/Discovery.jsx` | Step 2 — conversational Q&A loop |
| `src/components/steps/ProblemBrief.jsx` | Steps 3–4 — display + editable brief |
| `src/components/steps/AutoProcessing.jsx` | Steps 5–10 — spinner + auto-advance |
| `src/components/Report.jsx` | Step 11 — full report assembly + PDF button |
| `prompts/` | All 10 prompt files (already exist — do not modify) |
| `README.md` | Setup instructions |
| `docs/architecture.md` | Architecture diagram |
| `docs/product-rationale.md` | Design philosophy document |

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json` (via create-next-app)
- Create: `.env.local`
- Create: `src/app/layout.js` (replace generated)
- Create: `src/app/globals.css` (replace generated)

- [ ] **Step 1: Initialize Next.js in the project directory**

```powershell
cd "C:\Users\itsdo\Code-Projects\Gatekeeper"
npx create-next-app@latest . --js --app --no-tailwind --src-dir --import-alias "@/*" --yes
```

Expected: Project scaffolded with `src/app/`, `public/`, `package.json`.

- [ ] **Step 2: Install html2pdf.js**

```powershell
npm install html2pdf.js
```

- [ ] **Step 3: Create .env.local**

```
OPENAI_API_KEY=your-key-here
```

Save to `.env.local` in the project root. (This file is already gitignored by Next.js.)

- [ ] **Step 4: Initialize git**

```powershell
git init
git add .
git commit -m "feat: initialize Next.js project"
```

---

### Task 2: Global CSS and Layout

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.js`

- [ ] **Step 1: Replace globals.css**

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --canvas-bg: #ffffff;
  --enterprise-dark: #151515;
  --startup-spark: #8b5cf6;
  --structure-bg: #f1f5f9;
  --text-muted: #64748b;
}

html, body { background: var(--canvas-bg); }

h1, h2, h3, .app-title {
  font-family: 'Space Grotesk', sans-serif;
  color: var(--enterprise-dark);
  font-weight: 700;
  letter-spacing: -0.03em;
}

body, p, ul, li, .chat-message, .report-data {
  font-family: 'Inter', sans-serif;
  color: var(--enterprise-dark);
  font-weight: 400;
  line-height: 1.6;
}

.btn-primary {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  background-color: var(--startup-spark);
  color: #ffffff;
  border-radius: 6px;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-primary:hover { background-color: #7c3aed; }
.btn-primary:disabled { background-color: #c4b5fd; cursor: not-allowed; }

.btn-secondary {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  background-color: transparent;
  color: var(--enterprise-dark);
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-secondary:hover { background-color: var(--structure-bg); }

.btn-ghost {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  background: none;
  border: none;
  color: var(--startup-spark);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 4px 8px;
  text-decoration: underline;
}

.metadata-label {
  font-family: 'Inter', sans-serif;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.app-shell {
  min-height: 100vh;
  background: var(--canvas-bg);
}

.container {
  max-width: 720px;
  margin: 0 auto;
  padding: 40px 24px;
}

.container-wide {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 24px;
}

textarea {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--enterprise-dark);
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 12px;
  width: 100%;
  resize: vertical;
}

textarea:focus {
  outline: 2px solid var(--startup-spark);
  outline-offset: 0;
}

input[type="text"], input[type="password"] {
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 10px 12px;
  width: 100%;
}

input:focus {
  outline: 2px solid var(--startup-spark);
  outline-offset: 0;
}

.card {
  background: var(--structure-bg);
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 16px;
}

.section-divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 32px 0;
}

.spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  gap: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #e2e8f0;
  border-top-color: var(--startup-spark);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.demo-banner {
  background: #fef3c7;
  border-bottom: 2px solid #f59e0b;
  padding: 8px 24px;
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 500;
  color: #92400e;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  padding: 12px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 20px 24px;
  margin-bottom: 24px;
}

.error-box p {
  color: #991b1b;
  margin-bottom: 16px;
}

.button-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Report styles */
.report-section { margin-bottom: 48px; }
.report-section h2 { font-size: 1.5rem; margin-bottom: 24px; border-bottom: 2px solid var(--startup-spark); padding-bottom: 8px; }
.report-section h3 { font-size: 1.1rem; margin-bottom: 8px; margin-top: 20px; }
.report-field { margin-bottom: 16px; }
.report-field .metadata-label { display: block; margin-bottom: 4px; }
.report-field p { line-height: 1.7; }
.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--structure-bg);
  color: var(--enterprise-dark);
}
.badge-high { background: #dcfce7; color: #166534; }
.badge-medium { background: #fef9c3; color: #854d0e; }
.badge-low { background: #fee2e2; color: #991b1b; }

@media print {
  .no-print { display: none !important; }
  .report-section { page-break-inside: avoid; }
  .report-section h2 { page-break-after: avoid; }
}
```

- [ ] **Step 2: Replace layout.js**

```js
// src/app/layout.js
import './globals.css'

export const metadata = {
  title: 'AI Gatekeeper',
  description: 'Decision-support for business problem evaluation',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-shell">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: Verify**

```powershell
npm run dev
```

Open http://localhost:3000 — should show the default Next.js page without errors.

- [ ] **Step 4: Commit**

```powershell
git add src/app/globals.css src/app/layout.js
git commit -m "feat: add design tokens and root layout"
```

---

### Task 3: Session Management Library

**Files:**
- Create: `src/lib/session.js`

- [ ] **Step 1: Create src/lib/session.js**

```js
// src/lib/session.js
const SESSION_KEY = 'gatekeeper_session'
const API_KEY_KEY = 'gatekeeper_api_key'

export const initialSession = {
  currentStep: 0,
  originalProblem: '',
  discoveryHistory: [],
  questionCount: 0,
  problemBrief: null,
  validatedProblemStatement: '',
  rootCauseAnalysis: null,
  researchDecision: null,
  externalResearch: null,
  researchSynthesis: null,
  strategicAnalysis: null,
  recommendation: null,
}

export function getSession() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(session) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
}

export function getApiKey() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(API_KEY_KEY) || null
}

export function setApiKey(key) {
  if (typeof window === 'undefined') return
  localStorage.setItem(API_KEY_KEY, key)
}

export function clearApiKey() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(API_KEY_KEY)
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/lib/session.js
git commit -m "feat: add session management library"
```

---

### Task 4: API Routes

**Files:**
- Create: `src/app/api/qualify/route.js`
- Create: `src/app/api/discover/route.js`
- Create: `src/app/api/problem-brief/route.js`
- Create: `src/app/api/root-cause/route.js`
- Create: `src/app/api/research-decision/route.js`
- Create: `src/app/api/external-research/route.js`
- Create: `src/app/api/research-synthesis/route.js`
- Create: `src/app/api/strategic-analysis/route.js`
- Create: `src/app/api/recommendation/route.js`
- Create: `src/lib/openai.js` (shared API caller)

All routes follow the same pattern: read prompt files server-side, call OpenAI, return parsed JSON. A shared helper handles the fetch + JSON parsing.

- [ ] **Step 1: Create shared OpenAI helper**

```js
// src/lib/openai.js
import fs from 'fs'
import path from 'path'

export function readPrompt(filename) {
  return fs.readFileSync(path.join(process.cwd(), 'prompts', filename), 'utf-8')
}

export async function callOpenAI(systemContent, userContent, apiKey) {
  const key = apiKey || process.env.OPENAI_API_KEY
  if (!key) throw new Error('NO_API_KEY')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60000)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user', content: userContent },
        ],
      }),
      signal: controller.signal,
    })
    clearTimeout(timeout)

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err?.error?.message || `OpenAI error ${response.status}`)
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content
    if (!raw) throw new Error('EMPTY_RESPONSE')

    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    return JSON.parse(cleaned)
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') throw new Error('TIMEOUT')
    throw err
  }
}
```

- [ ] **Step 2: Create qualify route**

```js
// src/app/api/qualify/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { userSubmission, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const qualification = readPrompt('qualification.txt')
    const userMessage = `${qualification}\n\nUSER SUBMISSION\n${userSubmission}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 3: Create discover route**

```js
// src/app/api/discover/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { originalProblem, questionCount, discoveryHistory, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const discovery = readPrompt('discovery.txt')
    const historyText = discoveryHistory
      .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
      .join('\n\n')
    const userMessage = `${discovery}\n\nORIGINAL PROBLEM STATEMENT\n${originalProblem}\n\nQUESTION COUNT\n${questionCount}\n\nCONVERSATION HISTORY\n${historyText || '(none yet)'}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 4: Create problem-brief route**

```js
// src/app/api/problem-brief/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { problemBrief, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const problem = readPrompt('problem.txt')
    const userMessage = `${problem}\n\nPROBLEM BRIEF\n${JSON.stringify(problemBrief, null, 2)}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 5: Create root-cause route**

```js
// src/app/api/root-cause/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { validatedProblemStatement, problemBrief, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const rootCause = readPrompt('root-cause.txt')
    const userMessage = `${rootCause}\n\nVALIDATED PROBLEM STATEMENT\n${validatedProblemStatement}\n\nPROBLEM BRIEF\n${JSON.stringify(problemBrief, null, 2)}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 6: Create research-decision route**

```js
// src/app/api/research-decision/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { validatedProblemStatement, problemBrief, rootCauseAnalysis, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const researchDecision = readPrompt('research-decision.txt')
    const userMessage = `${researchDecision}\n\nVALIDATED PROBLEM STATEMENT\n${validatedProblemStatement}\n\nPROBLEM BRIEF\n${JSON.stringify(problemBrief, null, 2)}\n\nROOT CAUSE ANALYSIS\n${JSON.stringify(rootCauseAnalysis, null, 2)}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 7: Create external-research route**

```js
// src/app/api/external-research/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { validatedProblemStatement, problemBrief, rootCauseAnalysis, researchDecision, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const externalResearch = readPrompt('external-research.txt')
    const userMessage = `${externalResearch}\n\nVALIDATED PROBLEM STATEMENT\n${validatedProblemStatement}\n\nPROBLEM BRIEF\n${JSON.stringify(problemBrief, null, 2)}\n\nROOT CAUSE ANALYSIS\n${JSON.stringify(rootCauseAnalysis, null, 2)}\n\nRESEARCH DECISION\n${JSON.stringify(researchDecision, null, 2)}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 8: Create research-synthesis route**

```js
// src/app/api/research-synthesis/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { validatedProblemStatement, problemBrief, rootCauseAnalysis, externalResearch, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const researchSynthesis = readPrompt('research-synthesis.txt')
    const userMessage = `${researchSynthesis}\n\nVALIDATED PROBLEM STATEMENT\n${validatedProblemStatement}\n\nPROBLEM BRIEF\n${JSON.stringify(problemBrief, null, 2)}\n\nROOT CAUSE ANALYSIS\n${JSON.stringify(rootCauseAnalysis, null, 2)}\n\nEXTERNAL RESEARCH RESULTS\n${JSON.stringify(externalResearch, null, 2)}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 9: Create strategic-analysis route**

```js
// src/app/api/strategic-analysis/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { validatedProblemStatement, problemBrief, rootCauseAnalysis, researchSynthesis, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const strategicAnalysis = readPrompt('strategic-analysis.txt')
    const userMessage = `${strategicAnalysis}\n\nVALIDATED PROBLEM STATEMENT\n${validatedProblemStatement}\n\nPROBLEM BRIEF\n${JSON.stringify(problemBrief, null, 2)}\n\nROOT CAUSE ANALYSIS\n${JSON.stringify(rootCauseAnalysis, null, 2)}\n\nRESEARCH SYNTHESIS\n${JSON.stringify(researchSynthesis, null, 2)}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 10: Create recommendation route**

```js
// src/app/api/recommendation/route.js
import { NextResponse } from 'next/server'
import { readPrompt, callOpenAI } from '@/lib/openai'

export async function POST(request) {
  try {
    const { validatedProblemStatement, problemBrief, rootCauseAnalysis, researchSynthesis, strategicAnalysis, apiKey } = await request.json()
    const principles = readPrompt('gatekeeper-principles.txt')
    const recommendation = readPrompt('recommendation-generation.txt')
    const userMessage = `${recommendation}\n\nVALIDATED PROBLEM STATEMENT\n${validatedProblemStatement}\n\nPROBLEM BRIEF\n${JSON.stringify(problemBrief, null, 2)}\n\nROOT CAUSE ANALYSIS\n${JSON.stringify(rootCauseAnalysis, null, 2)}\n\nRESEARCH SYNTHESIS\n${JSON.stringify(researchSynthesis, null, 2)}\n\nSTRATEGIC ANALYSIS\n${JSON.stringify(strategicAnalysis, null, 2)}`
    const result = await callOpenAI(principles, userMessage, apiKey)
    return NextResponse.json(result)
  } catch (err) {
    if (err.message === 'TIMEOUT') return NextResponse.json({ error: 'TIMEOUT' }, { status: 408 })
    if (err.message === 'NO_API_KEY') return NextResponse.json({ error: 'NO_API_KEY' }, { status: 401 })
    if (err instanceof SyntaxError) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 422 })
    return NextResponse.json({ error: 'API_ERROR', message: err.message }, { status: 500 })
  }
}
```

- [ ] **Step 11: Commit**

```powershell
git add src/app/api src/lib/openai.js
git commit -m "feat: add OpenAI API routes and shared helper"
```

---

### Task 5: Demo Mode Data

**Files:**
- Create: `src/lib/demo-data.js`

- [ ] **Step 1: Create demo-data.js**

Demo scenario: RetailCo (fictional mid-size retailer) normalizing product data from 50+ suppliers. This scenario flows consistently through all phases.

```js
// src/lib/demo-data.js

export const demoQualification = {
  status: 'accept',
  message: 'Your problem statement describes a clear operational challenge. Let\'s explore it in more detail.',
  nextStep: 'discovery',
}

// discoveryFlow[i] is the response after the user answers question i-1 (or the first question for i=0)
export const demoDiscoveryFlow = [
  {
    status: 'question',
    message: 'How many suppliers currently send you product data, and roughly how many product updates does your team process each month?',
    problemBrief: null,
  },
  {
    status: 'question',
    message: 'What formats do your suppliers use to send product data — for example, Excel files, CSVs, proprietary exports, or something else?',
    problemBrief: null,
  },
  {
    status: 'question',
    message: 'What does the normalization process look like today — is it entirely manual, partially automated, or a mix?',
    problemBrief: null,
  },
  {
    status: 'question',
    message: 'How long does it typically take from receiving a supplier\'s data to having the products available on your platform?',
    problemBrief: null,
  },
  {
    status: 'brief_ready',
    problemBrief: {
      problem: 'The organization receives product catalog data from more than 50 suppliers in inconsistent formats and must manually normalize it before it can be imported into the platform.',
      businessImpact: 'New products take 3–5 business days to list after supplier data is received. Normalization errors cause downstream issues in inventory and pricing. Approximately 300 hours per month are spent on the process.',
      currentState: 'A small operations team uses spreadsheet templates, manual copy-paste, and some custom scripts to normalize supplier feeds. Coverage is partial and the process is not well-documented.',
      desiredOutcome: 'Reduce normalization time and errors significantly to enable faster time-to-market for new products.',
      scale: '50+ active suppliers, approximately 10,000 product updates per month',
      constraints: ['Limited engineering resources', 'Must integrate with existing ERP and e-commerce platform'],
      stakeholders: ['Operations team', 'Merchandising', 'IT/Engineering'],
      priorAttempts: ['Custom scripts for some suppliers — partial coverage only'],
      successMeasurement: 'At least 50% reduction in normalization time and a meaningful reduction in import errors',
      knownUnknowns: ['Exact cost of current normalization process', 'Supplier willingness to adopt standard data formats'],
      keyAssumptions: ['The problem is primarily a data and tooling challenge, not a supplier relationship issue'],
    },
  },
]

export const demoProblemBrief = {
  problemStatement:
    'The organization currently receives product catalog data from more than 50 suppliers in a variety of inconsistent formats, including Excel spreadsheets, CSV files, and proprietary data exports. Before this data can be imported into the internal platform, a small operations team must manually normalize it — aligning field names, units, product categories, and attribute structures to internal requirements. This process requires an estimated 300 hours of labor per month and introduces an average delay of three to five business days before new products can be listed for sale. Normalization errors create downstream problems in inventory management and product pricing. The organization seeks a solution that reduces normalization time and error rates and enables faster product availability, without requiring significant changes from suppliers or replacement of existing core systems.',
}

export const demoRootCauseAnalysis = {
  primaryRootCause: {
    category: 'DATA_GAP',
    rationale:
      'The core driver is that supplier product data arrives in inconsistent, non-standardized formats with no common schema. This forces labor-intensive manual remediation before the data can be used and is the primary cause of delay and error.',
  },
  contributingFactors: [
    {
      category: 'TOOLING_GAP',
      rationale:
        'The current tooling — spreadsheet templates and ad hoc scripts — provides only partial automation coverage and has not scaled to match supplier volume or data variability.',
    },
  ],
  alternativeCategoriesConsidered: [
    {
      category: 'PROCESS_GAP',
      reasonRejected:
        'While the process has grown informally, the primary constraint is inconsistent input data, not workflow design. Better process documentation would help marginally but would not address the root cause.',
    },
  ],
  confidence: 'HIGH',
  evidence: [
    'Suppliers provide data in multiple incompatible formats (Excel, CSV, proprietary exports)',
    'Current normalization relies primarily on manual effort with partial scripting coverage',
    'Downstream inventory and pricing errors suggest data quality issues at the normalization step',
  ],
  assumptions: [
    'Suppliers are unlikely to standardize their export formats without significant incentive or tooling support',
  ],
}

export const demoResearchDecision = {
  researchRequired: true,
  rationale:
    'This problem type has an established commercial solution market (Product Information Management and data integration tools). Research is likely to surface relevant vendors, solution patterns, and failure patterns that will materially improve the strategic analysis and recommendation.',
  researchObjectives: [
    'Identify common solution patterns for multi-supplier data normalization',
    'Assess commercial market maturity for PIM and data transformation tools',
    'Identify up to three relevant vendors',
    'Understand common failure patterns in similar initiatives',
  ],
  priorityAreas: ['Commercial software landscape', 'AI-enabled data transformation capabilities', 'Build vs buy considerations'],
}

export const demoExternalResearch = {
  solutionPatterns: [
    'Commercial Product Information Management (PIM) software with supplier onboarding modules',
    'ETL / data integration platforms with configurable transformation rules',
    'AI-enabled data mapping and transformation tools',
    'Supplier portal solutions that enforce standard formats at source',
    'Custom data pipeline development',
  ],
  marketMaturityEvidence: [
    'The PIM market is well-established with multiple enterprise and mid-market vendors',
    'Gartner and Forrester maintain active coverage of the PIM/MDM space',
    'Products like Akeneo, Salsify, and Syndigo have been commercially available for 10+ years',
    'Mid-market SaaS PIM options have expanded in recent years',
    'AI-assisted attribute mapping is increasingly included in newer PIM product releases',
  ],
  vendors: [
    {
      name: 'Akeneo',
      relevance: 'Open-source and SaaS PIM platform with supplier onboarding and data normalization capabilities, widely used in retail and e-commerce.',
      marketPosition: 'Established mid-market to enterprise PIM leader',
      relativeCost: 'Medium',
      costConsiderations: ['SaaS subscription fees', 'Implementation and configuration services', 'Potential SI partner costs', 'Staff training'],
      strengths: ['Strong supplier portal capabilities', 'Active open-source community', 'Broad e-commerce platform integrations'],
      limitations: ['Mid-market tier may require significant configuration effort', 'Full feature set may exceed requirements for smaller teams'],
    },
    {
      name: 'Salsify',
      relevance: 'Product Experience Management platform with strong retail and supplier network features focused on omnichannel product content.',
      marketPosition: 'Enterprise-focused SaaS provider',
      relativeCost: 'High',
      costConsiderations: ['Premium SaaS pricing', 'Per-user or per-product licensing', 'Professional services for implementation', 'Ongoing support contracts'],
      strengths: ['Strong supplier network and onboarding tools', 'Retail-specific feature depth', 'Good API ecosystem'],
      limitations: ['Higher cost may be prohibitive for mid-market organizations', 'Broader feature set may exceed requirements'],
    },
    {
      name: 'Syndigo',
      relevance: 'Content Experience Hub designed for product content distribution and supplier data exchange, with strong normalization features.',
      marketPosition: 'Established enterprise vendor',
      relativeCost: 'High',
      costConsiderations: ['Enterprise pricing', 'Implementation and configuration services', 'Content processing fees'],
      strengths: ['Purpose-built for multi-supplier data exchange', 'Strong data normalization and validation features'],
      limitations: ['Enterprise pricing may not fit smaller organizations', 'Implementation complexity can be high'],
    },
  ],
  failurePatterns: [
    'Underestimating supplier data variability — real-world data often contains more inconsistency than initially mapped',
    'Insufficient supplier onboarding planning — suppliers may resist new formats or require extensive support',
    'Over-scoping the initial implementation — attempting to onboard all suppliers simultaneously rather than in phases',
    'Insufficient change management — operations teams need process training alongside new tooling',
    'Underestimating ongoing maintenance — supplier data formats evolve over time',
  ],
  noActionEvidence: [
    'Organizations with fewer than 20 suppliers sometimes manage indefinitely with spreadsheet tooling',
    'ROI on PIM investment typically requires sufficient supplier and product volume',
    'Some organizations accept normalization cost as a cost of doing business when product turnover is low',
  ],
  aiRelevanceSignals: [
    'Several PIM vendors include AI-assisted attribute mapping and schema matching features',
    'Standalone AI-powered data transformation tools exist (e.g., Flatfile)',
    'AI in this context focuses primarily on pattern matching and field mapping, not generative content',
    'AI adoption in PIM is increasing but is not yet the market standard',
  ],
  researchSources: [
    'Gartner Market Guide for Product Information Management',
    'Forrester Wave: PIM Solutions',
    'Akeneo, Salsify, and Syndigo product documentation and case studies',
    'Industry practitioner commentary',
  ],
}

export const demoResearchSynthesis = {
  marketMaturity: {
    rating: 'MATURE',
    rationale:
      'The PIM and data integration market is well-established with multiple enterprise and mid-market vendors. Solutions have been commercially available for over a decade and analyst firms maintain active coverage.',
  },
  vendorLandscape: {
    rating: 'STRONG_VENDOR_LANDSCAPE',
    rationale:
      'Multiple relevant vendors were identified across enterprise and mid-market segments. The market is competitive with differentiated offerings across price points and capability levels.',
  },
  solutionPatterns: {
    mostCommon: ['Commercial PIM software with supplier onboarding modules', 'ETL / data integration platforms with transformation rules'],
    secondary: ['AI-assisted data mapping tools', 'Supplier portal format enforcement', 'Custom pipeline development'],
  },
  failurePatternSummary: [
    'Underestimating supplier data variability during initial scoping',
    'Insufficient supplier onboarding and change management planning',
    'Over-scoping the initial implementation phase',
    'Ongoing maintenance burden from evolving supplier formats',
  ],
  aiMarketSignals: {
    rating: 'AI_EMERGING',
    rationale:
      'AI-assisted data mapping features are increasingly present in PIM products but are not yet the market standard. AI adoption in this space is growing but remains supplementary rather than central to most deployments.',
  },
  keyResearchFindings: [
    'The PIM market is mature with established commercial options at multiple price points',
    'Commercial software is the dominant solution pattern for organizations with 20+ suppliers',
    'AI-assisted mapping features exist but are typically embedded within commercial platforms rather than standalone products',
    'Supplier onboarding and change management are consistent implementation risk factors',
    'Phased implementation by supplier volume or complexity is commonly recommended',
  ],
  researchConfidence: {
    rating: 'MEDIUM',
    rationale:
      'Evidence is drawn from analyst research, vendor documentation, and practitioner commentary. Specific vendor pricing and implementation details were not verified against this organization\'s specific context.',
  },
  assumptions: [
    'Research reflects general market conditions and may not account for recent product changes',
    'Vendor cost characterizations are relative estimates, not specific to this organization',
  ],
}

export const demoStrategicAnalysis = {
  problemSignificance: {
    rating: 'HIGH',
    rationale:
      '300 hours of monthly labor, 3–5 day listing delays, and downstream inventory and pricing errors represent significant operational cost and business risk. At 50+ suppliers and ~10,000 monthly updates, the problem is likely to worsen without intervention.',
  },
  solutionLandscape: {
    alternativesEvaluated: [
      {
        approach: 'NO_ACTION',
        fit: 'NOT_RECOMMENDED',
        rationale: 'Current costs are substantial and the problem will compound as supplier volume grows. No action is not defensible at this scale.',
        keyTradeoffs: ['Avoids investment risk', 'Problem likely worsens over time', 'Ongoing labor and error costs continue to accumulate'],
      },
      {
        approach: 'PROCESS_IMPROVEMENT',
        fit: 'LOW',
        rationale: 'Process improvements could reduce some inefficiency but cannot address fundamental data format variability. Better documentation and workflow management would help marginally as a complement, not a solution.',
        keyTradeoffs: ['Low cost and low risk', 'Limited impact on core problem', 'Valuable as a complement to technology investment'],
      },
      {
        approach: 'COMMERCIAL_SOFTWARE',
        fit: 'HIGH',
        rationale: 'PIM solutions are specifically designed for this problem. The mature vendor landscape offers multiple options appropriate for this scale. Commercial software directly addresses the DATA_GAP root cause by providing a standardized destination schema and supplier onboarding tools.',
        keyTradeoffs: ['Significant upfront investment', 'Implementation complexity', 'Ongoing subscription cost', 'Directly addresses root cause', 'Reduces long-term operational burden'],
      },
      {
        approach: 'AI_ENABLED_COMMERCIAL_SOFTWARE',
        fit: 'MEDIUM',
        rationale: 'AI-assisted data mapping features could reduce configuration time during implementation. However, AI capabilities in this space are supplementary features within commercial platforms, not standalone solutions. The benefit is incremental rather than transformative.',
        keyTradeoffs: ['Potential reduction in initial mapping effort', 'AI feature quality varies across vendors', 'May increase product cost', 'Still requires full commercial platform investment'],
      },
      {
        approach: 'TRADITIONAL_AUTOMATION',
        fit: 'MEDIUM',
        rationale: 'ETL pipelines and custom transformation scripts could handle known supplier formats. This has been partially attempted and shows limitations in handling variability and scaling to new suppliers. It is viable but not sustainable at this scale with limited engineering resources.',
        keyTradeoffs: ['Lower direct cost than commercial PIM', 'Requires ongoing engineering maintenance', 'Does not solve supplier onboarding scalably', 'Prior attempts demonstrate limited coverage'],
      },
      {
        approach: 'CUSTOM_SOFTWARE',
        fit: 'LOW',
        rationale: 'Custom development would replicate functionality available in mature commercial products without the benefit of vendor maintenance or community support. Not advisable given limited engineering resources.',
        keyTradeoffs: ['Full implementation control', 'High development and maintenance cost', 'Inappropriate given engineering resource constraints', 'Reinvents established functionality'],
      },
    ],
    alternativesNotEvaluated: [
      {
        approach: 'TRAINING_AND_DOCUMENTATION',
        reason: 'The problem is not caused by a knowledge gap. Training would not address data format variability.',
      },
      {
        approach: 'CUSTOM_AI_SOFTWARE',
        reason: 'Custom AI development is disproportionate to the problem. Commercial options exist and engineering resources are limited.',
      },
    ],
  },
  buildVsBuy: {
    recommendedApproach: 'BUY',
    rationale:
      'The PIM market is mature with established vendors. Building a comparable system would require significant engineering investment and ongoing maintenance, replicating functionality already available commercially. Limited engineering resources reinforce the buy recommendation.',
  },
  economicConsiderations: {
    implementationCost: 'HIGH',
    operationalCost: 'MEDIUM',
    timeToValue: 'MEDIUM',
    opportunityCost: 'HIGH',
    rationale:
      'PIM implementation requires meaningful upfront investment in licensing, configuration, and supplier onboarding. Ongoing SaaS subscription costs are significant but should be weighed against approximately 300 hours of monthly labor. Time-to-value is typically 3–6 months for phased implementations. The opportunity cost of delay is high given the ongoing labor and error burden.',
  },
  humanImpact: {
    capabilityEnhancement:
      'Implementation would free the operations team from repetitive data normalization tasks, enabling focus on higher-value supplier relationship and data quality governance work.',
    capabilityRisk: 'Low risk. The team retains oversight and exception handling responsibilities. The solution augments rather than replaces human work.',
    humanJudgmentRequirements:
      'Human judgment remains necessary for exception handling, new supplier onboarding decisions, and data quality governance. These contributions should be preserved and supported.',
    knowledgeRetentionConsiderations:
      'Institutional knowledge of supplier data quirks and business rules should be documented during implementation to ensure it is captured in PIM configuration rather than remaining tacit.',
  },
  aiAssessment: {
    rating: 'AI_LIMITED_VALUE',
    rationale:
      'AI adds incremental value in this context — primarily through assisted field mapping during implementation. The core problem is data format variability, not intelligent interpretation. Standard PIM capabilities are sufficient to address the root cause. AI-enabled options may be worth evaluating if offered at no additional cost premium.',
  },
  strategicInsights: [
    'Commercial PIM software directly addresses the DATA_GAP root cause by providing a consistent destination schema and supplier onboarding tooling.',
    'Prior custom scripting attempts validate that automation is feasible but also demonstrate the scalability limitations of custom approaches at this supplier volume.',
    'Phased implementation — starting with the highest-volume or most problematic suppliers — is likely to produce faster ROI and reduce implementation risk.',
    'Change management and supplier onboarding planning will be critical success factors.',
    'Process improvement should accompany technology implementation to codify business rules and data quality standards.',
  ],
  assumptions: [
    'Current labor estimate of 300 hours/month is provided by the organization and has not been independently verified',
    'Engineering resource constraints may affect implementation timeline',
    'Supplier cooperation with onboarding process is assumed to be achievable with appropriate planning',
  ],
}

export const demoRecommendation = {
  recommendedPath: {
    primaryApproach: 'COMMERCIAL_SOFTWARE',
    supportingApproaches: ['PROCESS_IMPROVEMENT'],
  },
  rootCauseAlignment:
    'The identified root cause is a DATA_GAP — supplier data arrives in inconsistent, non-standardized formats that require costly manual remediation. Commercial PIM software addresses this directly by providing a standardized destination schema, supplier onboarding tools, and automated transformation capabilities. Process improvement supports this by formalizing the data governance and business rules the system will enforce.',
  rationale:
    'The evidence strongly supports a commercial PIM solution. The market is mature, multiple relevant vendors exist, and this problem type is precisely what PIM software is designed to address. The scale of the problem — 300 hours per month, 50+ suppliers, approximately 10,000 monthly product updates — justifies the investment. Prior custom scripting efforts confirm that automation is effective in this context but that a scalable platform is required. AI-enabled features may accelerate initial field mapping but are not the primary driver of value.',
  alternativesNotSelected: [
    {
      approach: 'TRADITIONAL_AUTOMATION',
      reasonNotSelected:
        'Prior custom scripting has demonstrated limited coverage and scalability. Engineering resources are constrained, and this approach does not provide a sustainable path to onboarding new suppliers efficiently.',
    },
    {
      approach: 'AI_ENABLED_COMMERCIAL_SOFTWARE',
      reasonNotSelected:
        'AI-assisted mapping features provide incremental value but are not required to address the core problem. Standard PIM capabilities are sufficient. If an evaluated vendor includes AI features at no additional cost premium, they may be worth utilizing.',
    },
  ],
  risks: [
    'Implementation complexity and timeline: PIM implementations typically require 3–6 months. Underestimating this delays ROI.',
    'Supplier onboarding resistance: Some suppliers may resist new submission formats, slowing full coverage.',
    'Change management: The operations team will need to adapt their workflow; insufficient training may limit adoption.',
    'Data complexity underestimation: Supplier data often contains more variability than initially mapped, increasing configuration effort.',
    'Ongoing maintenance: Supplier formats evolve over time, requiring continued platform maintenance.',
  ],
  confidence: {
    rating: 'HIGH',
    rationale:
      'The root cause is clear, the market is mature, and commercial PIM software directly addresses the identified problem. The scale and cost of the current process justifies investment. Remaining uncertainty relates to specific vendor selection and implementation complexity, not the direction of the recommendation.',
  },
  nextStep:
    'Conduct a structured evaluation of three to four PIM vendors — including Akeneo, Salsify, and at least one mid-market alternative — using requirements derived from a documented analysis of current normalization workflows and supplier data.',
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/lib/demo-data.js
git commit -m "feat: add demo mode mock data for supplier normalization scenario"
```

---

### Task 6: Shared UI Components

**Files:**
- Create: `src/components/LoadingSpinner.jsx`
- Create: `src/components/ErrorDisplay.jsx`
- Create: `src/components/DemoBanner.jsx`

- [ ] **Step 1: Create LoadingSpinner.jsx**

```jsx
// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ label = 'calculating' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
      <span className="metadata-label">{label}…</span>
    </div>
  )
}
```

- [ ] **Step 2: Create ErrorDisplay.jsx**

```jsx
// src/components/ErrorDisplay.jsx
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
```

- [ ] **Step 3: Create DemoBanner.jsx**

```jsx
// src/components/DemoBanner.jsx
export default function DemoBanner() {
  return (
    <div className="demo-banner">
      Demo Mode — you are viewing simulated responses, not real AI output
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```powershell
git add src/components/
git commit -m "feat: add shared UI components (spinner, error, demo banner)"
```

---

### Task 7: Setup Wizard

**Files:**
- Create: `src/components/SetupWizard.jsx`

- [ ] **Step 1: Create SetupWizard.jsx**

```jsx
// src/components/SetupWizard.jsx
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
          <p style={{ marginBottom: 20 }}>Your API key has been saved. You're ready to begin.</p>
          <button className="btn-primary" onClick={onComplete}>Get started</button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/SetupWizard.jsx
git commit -m "feat: add setup wizard for first-launch API key configuration"
```

---

### Task 8: Welcome Screen

**Files:**
- Create: `src/components/WelcomeScreen.jsx`

- [ ] **Step 1: Create WelcomeScreen.jsx**

```jsx
// src/components/WelcomeScreen.jsx
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
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/WelcomeScreen.jsx
git commit -m "feat: add welcome screen with problem input and demo button"
```

---

### Task 9: Step Components

**Files:**
- Create: `src/components/steps/Qualification.jsx`
- Create: `src/components/steps/Discovery.jsx`
- Create: `src/components/steps/ProblemBrief.jsx`
- Create: `src/components/steps/AutoProcessing.jsx`

- [ ] **Step 1: Create Qualification.jsx (Step 1)**

This component is shown when qualification returns `clarify` or `expand` — it displays the message and a text area for the user to revise.

```jsx
// src/components/steps/Qualification.jsx
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
```

- [ ] **Step 2: Create Discovery.jsx (Step 2)**

Discovery holds its own state — the current question and the answer being typed. The parent passes the full session and the callback for when a brief is ready.

```jsx
// src/components/steps/Discovery.jsx
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
```

- [ ] **Step 3: Create ProblemBrief.jsx (Steps 3–4)**

Step 3 is auto (spinner shown by parent). Step 4 is this component — display + edit the generated problem statement.

```jsx
// src/components/steps/ProblemBrief.jsx
'use client'
import { useState } from 'react'

export default function ProblemBrief({ problemStatement, onApprove }) {
  const [text, setText] = useState(problemStatement)

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <p className="metadata-label" style={{ marginBottom: 8 }}>Step 3 of 4</p>
      <h2 style={{ marginBottom: 8 }}>Review your problem statement</h2>
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
```

- [ ] **Step 4: Create AutoProcessing.jsx (Steps 5–10)**

This component renders a spinner and fires the provided `onMount` callback immediately on mount. The parent handles the actual API call.

```jsx
// src/components/steps/AutoProcessing.jsx
'use client'
import { useEffect, useRef } from 'react'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function AutoProcessing({ label, onMount }) {
  const called = useRef(false)
  useEffect(() => {
    if (!called.current) {
      called.current = true
      onMount()
    }
  }, [onMount])

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <LoadingSpinner label={label} />
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```powershell
git add src/components/steps/
git commit -m "feat: add step components for qualification, discovery, brief, and auto-processing"
```

---

### Task 10: Settings Component

**Files:**
- Create: `src/components/Settings.jsx`

- [ ] **Step 1: Create Settings.jsx**

```jsx
// src/components/Settings.jsx
'use client'
import { useState, useEffect } from 'react'
import { getApiKey, setApiKey, clearApiKey } from '@/lib/session'

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
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/Settings.jsx
git commit -m "feat: add settings panel for API key management"
```

---

### Task 11: Report Component

**Files:**
- Create: `src/components/Report.jsx`

- [ ] **Step 1: Create Report.jsx**

The report assembles all stored artifacts into the structured 6-section layout. PDF export is triggered via html2pdf.js loaded dynamically.

```jsx
// src/components/Report.jsx
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

        {/* Section 1: Executive Summary */}
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

        {/* Section 2: Problem Definition */}
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

        {/* Section 3: Root Cause Analysis */}
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

        {/* Section 4: Research Findings — hidden if no research */}
        {researchDecision?.researchRequired !== false && researchSynthesis && (
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

        {/* Section 5: Strategic Analysis */}
        <div className="report-section">
          <h2>{researchDecision?.researchRequired !== false ? '5' : '4'}. Strategic Analysis</h2>
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
                  ].map(([label, val]) => (
                    <div key={label}>
                      <span className="metadata-label">{label}</span>
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

        {/* Section 6: Recommendation */}
        <div className="report-section">
          <h2>{researchDecision?.researchRequired !== false ? '6' : '5'}. Recommendation</h2>
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
```

- [ ] **Step 2: Commit**

```powershell
git add src/components/Report.jsx
git commit -m "feat: add report component with all 6 sections and PDF export"
```

---

### Task 12: Main Page Orchestrator

**Files:**
- Modify: `src/app/page.js`

This is the core of the application. It manages session state and renders the appropriate component for each step.

- [ ] **Step 1: Write page.js**

```jsx
// src/app/page.js
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

// Steps:
// 0  = welcome
// 1  = qualification (clarify/expand shown — accept goes to 2)
// 2  = discovery Q&A
// 3  = problem brief generation (auto)
// 4  = user validates brief
// 5  = root cause (auto)
// 6  = research decision (auto)
// 7  = external research (auto, conditional)
// 8  = research synthesis (auto, conditional)
// 9  = strategic analysis (auto)
// 10 = recommendation (auto)
// 11 = report

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

  // ── API call helpers ──────────────────────────────────────────

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

  // ── Demo mode ────────────────────────────────────────────────

  async function handleDemo() {
    setIsDemoMode(true)
    setLoading(true)
    setLoadingLabel('calculating')
    await delay(800)

    const s1 = save({
      currentStep: 2,
      originalProblem: 'We receive product data from dozens of suppliers and spend significant time normalizing it before it can be imported into our platform.',
    })

    // Prime first discovery question
    const firstQ = demoDiscoveryFlow[0].message
    setCurrentQuestion(firstQ)
    save({ ...s1, currentStep: 2, questionCount: 1 })
    setLoading(false)
  }

  // ── Step 0 → 1: Problem Qualification ────────────────────────

  async function handleWelcomeSubmit(problem, resume = false) {
    if (resume) {
      return // session already loaded — just re-render
    }

    save({ originalProblem: problem })
    setLoading(true)
    setLoadingLabel('calculating')

    try {
      const result = isDemoMode
        ? demoQualification
        : await apiCall('/api/qualify', { userSubmission: problem })

      if (result.status === 'accept') {
        const s = save({ currentStep: 2 })
        // Immediately kick off first discovery question
        await runDiscovery(s)
      } else {
        setQualifyMsg(result.message)
        save({ currentStep: 1 })
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      setError(err.type || 'API_ERROR')
    }
  }

  // ── Step 1 → 2: Qualification revision ───────────────────────

  async function handleRevise(revisedProblem) {
    save({ originalProblem: revisedProblem })
    setLoading(true)
    setLoadingLabel('calculating')
    try {
      const result = isDemoMode
        ? demoQualification
        : await apiCall('/api/qualify', { userSubmission: revisedProblem })

      if (result.status === 'accept') {
        const s = save({ currentStep: 2, originalProblem: revisedProblem })
        await runDiscovery(s)
      } else {
        setQualifyMsg(result.message)
        save({ currentStep: 1, originalProblem: revisedProblem })
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
      setError(err.type || 'API_ERROR')
    }
  }

  // ── Step 2: Discovery ─────────────────────────────────────────

  async function runDiscovery(s) {
    setLoading(true)
    setLoadingLabel('calculating')
    try {
      const result = isDemoMode
        ? demoDiscoveryFlow[s.questionCount ?? 0]
        : await apiCall('/api/discover', {
            originalProblem: s.originalProblem,
            questionCount: s.questionCount,
            discoveryHistory: s.discoveryHistory,
          })

      if (result.status === 'brief_ready') {
        const next = save({
          ...s,
          currentStep: 3,
          problemBrief: result.problemBrief,
        })
        await runProblemBrief(next)
      } else {
        setCurrentQuestion(result.message)
        save({ ...s, currentStep: 2 })
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
    const s = save({ discoveryHistory: history, questionCount: count })
    await runDiscovery(s)
  }

  // ── Step 3: Problem Brief Generation ─────────────────────────

  async function runProblemBrief(s) {
    setLoading(true)
    setLoadingLabel('calculating')
    try {
      const result = isDemoMode
        ? demoProblemBrief
        : await apiCall('/api/problem-brief', { problemBrief: s.problemBrief })
      save({ ...s, currentStep: 4, validatedProblemStatement: result.problemStatement })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      setError(err.type || 'API_ERROR')
    }
  }

  // ── Step 4: User Validates Brief ──────────────────────────────

  function handleBriefApproved(text) {
    save({ validatedProblemStatement: text, currentStep: 5 })
  }

  // ── Step 5: Root Cause Analysis ───────────────────────────────

  const runRootCause = useCallback(async () => {
    try {
      const result = isDemoMode
        ? demoRootCauseAnalysis
        : await apiCall('/api/root-cause', {
            validatedProblemStatement: session.validatedProblemStatement,
            problemBrief: session.problemBrief,
          })
      save({ rootCauseAnalysis: result, currentStep: 6 })
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  // ── Step 6: Research Decision ─────────────────────────────────

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
      save({ researchDecision: result, currentStep: nextStep })
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  // ── Step 7: External Research ─────────────────────────────────

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
      save({ externalResearch: result, currentStep: 8 })
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  // ── Step 8: Research Synthesis ────────────────────────────────

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
      save({ researchSynthesis: result, currentStep: 9 })
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  // ── Step 9: Strategic Analysis ────────────────────────────────

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
      save({ strategicAnalysis: result, currentStep: 10 })
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  // ── Step 10: Recommendation ───────────────────────────────────

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
      save({ recommendation: result, currentStep: 11 })
    } catch (err) {
      setError(err.type || 'API_ERROR')
    }
  }, [session, isDemoMode])

  // ── Render ────────────────────────────────────────────────────

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

          {(loading || (step === 3)) && step !== 4 && step < 5 && step > 2 && (
            <div className="container"><LoadingSpinner label={loadingLabel} /></div>
          )}

          {step === 4 && (
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

      {loading && step === 2 && (
        <div className="container"><LoadingSpinner label={loadingLabel} /></div>
      )}
    </div>
  )
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

- [ ] **Step 2: Run and verify full flow in demo mode**

```powershell
npm run dev
```

Open http://localhost:3000. Complete full flow:
1. Click "Try Demo"
2. Watch spinner → Discovery Q&A loads
3. Answer 4 demo questions
4. Watch problem brief appear → approve it
5. Watch spinners for steps 5–10
6. Verify report renders with all 6 sections
7. Click "Download PDF" — verify gatekeeper-report.pdf downloads

- [ ] **Step 3: Commit**

```powershell
git add src/app/page.js
git commit -m "feat: add main page orchestrator wiring all workflow steps"
```

---

### Task 13: Additional Deliverables

**Files:**
- Create: `README.md`
- Create: `docs/architecture.md`
- Create: `docs/product-rationale.md`

- [ ] **Step 1: Create README.md**

```markdown
# AI Gatekeeper

AI Gatekeeper is a decision-support application that helps organizations evaluate business problems and determine the most sensible path forward, whether that path involves AI or not.

## What it does

The application begins with a business problem rather than a proposed solution. Through a conversational discovery process, AI Gatekeeper identifies likely root causes, evaluates potential solution approaches, conducts research, and recommends a single primary course of action.

## Setup

### Prerequisites

- Node.js 18+
- An OpenAI API key (get one at https://platform.openai.com/api-keys)

### Installation

```bash
git clone <repo-url>
cd Gatekeeper
npm install
```

### API Key

**Option 1 — App settings (recommended for local use):**
Launch the app and the setup wizard will ask for your key on first launch. Your key is stored in browser `localStorage` only.

**Option 2 — Environment variable:**
Copy `.env.local.example` to `.env.local` and add your key:

```
OPENAI_API_KEY=sk-...
```

The in-app key (Option 1) takes priority if both are set.

### Running locally

```bash
npm run dev
```

Open http://localhost:3000.

## Demo mode

Click **Try Demo** on the welcome screen to walk through the full workflow using simulated responses without an API key. Demo data is based on a fictional supplier data normalization scenario.

## Notes

- All session state is stored in browser `localStorage` under `gatekeeper_session`
- The app uses `gpt-4o-mini` for all OpenAI calls
- Prompt files are in `/prompts` and are read server-side — they are never exposed to the client
- PDF export uses html2pdf.js and generates `gatekeeper-report.pdf`
```

- [ ] **Step 2: Create docs/architecture.md**

```markdown
# AI Gatekeeper — Architecture

## Phase and Data Flow

```
Browser (localStorage)
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js App (Client)                                       │
│                                                             │
│  page.js  ──  step orchestrator                             │
│     │                                                       │
│     ├── Step 0:  WelcomeScreen         (user input)         │
│     ├── Step 1:  Qualification         ──► /api/qualify     │
│     ├── Step 2:  Discovery             ──► /api/discover    │
│     ├── Step 3:  (auto spinner)        ──► /api/problem-brief│
│     ├── Step 4:  ProblemBrief          (user edit/approve)  │
│     ├── Step 5:  (auto spinner)        ──► /api/root-cause  │
│     ├── Step 6:  (auto spinner)        ──► /api/research-decision
│     ├── Step 7:  (auto spinner)        ──► /api/external-research (conditional)
│     ├── Step 8:  (auto spinner)        ──► /api/research-synthesis (conditional)
│     ├── Step 9:  (auto spinner)        ──► /api/strategic-analysis
│     ├── Step 10: (auto spinner)        ──► /api/recommendation
│     └── Step 11: Report               (assembled from localStorage)
└─────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│  Next.js API Routes (Server)                                │
│                                                             │
│  Each route:                                                │
│    1. Reads gatekeeper-principles.txt  (system prompt)      │
│    2. Reads phase-specific prompt file                      │
│    3. Appends structured input data                         │
│    4. Calls OpenAI gpt-4o-mini                              │
│    5. Parses JSON response                                  │
│    6. Returns structured result to client                   │
└─────────────────────────────────────────────────────────────┘
        │
        ▼
  OpenAI API (gpt-4o-mini)
```

## State persistence

All session state is stored in a single `localStorage` key: `gatekeeper_session`. State is written after every successful step. On page load, a saved session is detected and the user is offered the option to resume.

## Branching

Step 6 (Research Decision) returns `researchRequired: true | false`. If `false`, Steps 7 and 8 are skipped and the workflow jumps directly to Step 9. The report hides Section 4 (Research Findings) when research was not performed.

## Security

- Prompt files are read server-side using `fs.readFileSync` and are never sent to the client.
- The OpenAI API key from `localStorage` is passed to API routes in the request body. Since this is a local application, this is acceptable.
- No data is stored server-side or transmitted to any service other than OpenAI.
```

- [ ] **Step 3: Create docs/product-rationale.md**

```markdown
# AI Gatekeeper — Product Rationale

## Why it starts with the problem

Most AI evaluation tools begin with a proposed solution — "Should we build a chatbot?" or "Can we automate this with AI?" — and work backward to justify it.

AI Gatekeeper begins with the business problem and works forward. This matters because the most costly decisions in technology investment are not the ones where the wrong technology was chosen — they are the ones where the right technology was applied to the wrong problem, or where a simpler approach would have produced equal or better results at lower cost and risk.

By anchoring the process to the problem, AI Gatekeeper creates the conditions for honest evaluation. The question is not "Can AI solve this?" — it is "What is most likely to solve this, and is the investment justified?"

## Why it is not an AI advocate

AI Gatekeeper's design reflects a specific principle: AI is a tool, not a goal.

The presence of AI does not improve a solution. The absence of AI does not weaken one. There are many business problems for which AI adds genuine value. There are many others for which it introduces complexity, cost, governance burden, and operational risk without a commensurate benefit.

The most common failure mode in AI investment is not choosing the wrong model or the wrong vendor. It is allowing enthusiasm for the technology to outrun the evidence for its fit. A recommendation tool that begins with the assumption that AI is the answer is not a decision-support tool — it is a justification engine.

AI Gatekeeper is built to be genuinely impartial. A recommendation of "no action," "process improvement," or "commercial software without AI" is as valid an output as a recommendation of AI-enabled tooling. The goal is the right recommendation, not the most technically interesting one.

## Why it values human capability

AI Gatekeeper's evaluation framework treats human capability as organizationally valuable — not as a cost to be eliminated.

This reflects a practical observation: organizations that replace meaningful human judgment with automated systems often discover, in retrospect, that they have also removed institutional knowledge, oversight capability, and adaptive capacity. The short-term efficiency gain can carry long-term organizational cost that is difficult to measure until it is needed.

The framework distinguishes between repetitive, low-value effort — which automation generally reduces well — and meaningful human contribution, which should be preserved and supported. This distinction shapes how human impact is assessed in the strategic analysis phase and how recommendations are framed.

Unless an organization explicitly states that workforce reduction is an objective, AI Gatekeeper frames solution benefits in terms of capacity, effectiveness, and quality improvement rather than headcount reduction.

## Why it generates a single recommendation

AI Gatekeeper produces one primary recommendation.

The temptation in decision-support tools is to present a range of options with balanced pros and cons and leave the final call to the reader. This is comfortable for the tool but unhelpful for the organization. When all options are presented as equally valid, the decision-maker has not been helped — they have been handed the same problem with better-organized uncertainty.

The purpose of the analysis process is to reduce uncertainty and identify the path most strongly supported by the available evidence. A recommendation that cannot commit to a primary path has not completed its job.

This does not mean the recommendation is definitive. AI Gatekeeper explicitly states confidence levels, identifies risks, and acknowledges assumptions. The human decision-maker remains responsible for the final decision. But the tool's role is to recommend — not to hedge.

## Why it is evidence-based

Every phase of AI Gatekeeper's workflow is designed to generate evidence before drawing conclusions.

Discovery gathers information about the problem before any analysis begins. Root cause analysis identifies underlying drivers before solutions are considered. External research collects evidence about the solution landscape before strategic options are evaluated. Strategic analysis assesses alternatives before a recommendation is generated.

This sequencing is deliberate. It is easy to identify a technology and then selectively gather evidence to support it. It is harder — and more useful — to gather evidence first and let the evidence lead to the technology.

The prompts that guide each phase explicitly prohibit forward-skipping: the discovery prompt does not recommend solutions; the research prompt does not perform strategic analysis; the strategic analysis prompt does not select a recommendation. Each phase does its specific job and passes structured outputs forward. This structure makes the reasoning traceable and the recommendation defensible.
```

- [ ] **Step 4: Commit**

```powershell
git add README.md docs/
git commit -m "docs: add README, architecture diagram, and product rationale"
```

---

## Self-Review

### Spec Coverage Check

| Spec requirement | Covered by |
|---|---|
| Next.js local web app | Task 1 |
| LocalStorage session state | Task 3 |
| OpenAI gpt-4o-mini API calls | Task 4 (openai.js) |
| API key in .env.local + settings UI | Tasks 1, 10 |
| Prompt files read server-side | Task 4 (readPrompt in each route) |
| All 12 workflow steps | Task 12 (page.js) |
| Step 0 welcome screen with examples | Task 8 |
| Step 1 qualification (accept/clarify/expand) | Tasks 4, 9, 12 |
| Step 2 discovery loop max 12 questions | Task 12 (runDiscovery) |
| Step 3 problem brief generation | Tasks 4, 12 |
| Step 4 user edits brief | Task 9 (ProblemBrief.jsx) |
| Steps 5–10 auto-processing spinners | Tasks 9, 12 |
| Step 6 research decision branching | Task 12 (runResearchDecision, nextStep = 7 or 9) |
| Step 11 report with 6 sections | Task 11 (Report.jsx) |
| Report hides Research section if no research | Task 11 (conditional render) |
| Step 12 PDF download | Task 11 (handleDownloadPDF in Report.jsx) |
| PDF filename gatekeeper-report.pdf | Task 11 |
| Error handling (API, timeout, JSON) | Tasks 4 (route.js), 6 (ErrorDisplay) |
| Error buttons: Retry / Edit previous / Start over | Task 6 (ErrorDisplay) |
| Start Over clears session | Task 12 (handleStartOver) |
| Save state before each API call | Task 12 (save() called before each apiCall) |
| Resume on page load | Task 12 (useEffect, existingSession) |
| Settings UI with masked key input | Task 10 (Settings.jsx) |
| Key stored in gatekeeper_api_key | Task 3 (session.js) |
| Demo mode with mock responses | Tasks 5, 12 |
| Demo clearly labeled | Task 6 (DemoBanner) |
| Demo uses supplier scenario | Task 5 (demo-data.js) |
| Setup wizard on first launch | Task 7 (SetupWizard.jsx) |
| Setup wizard not shown if key exists | Task 12 (useEffect check) |
| Design tokens (Space Grotesk, Inter, colors) | Task 2 |
| README | Task 13 |
| Architecture diagram | Task 13 |
| Product rationale doc | Task 13 |

### Placeholder Scan
No TBDs, TODOs, or placeholder patterns found in this plan.

### Type Consistency
- `session.currentStep` — used consistently as numeric 0–11 throughout page.js and session.js
- `save()` — always returns updated session object; auto-steps use the returned value where needed
- `demoDiscoveryFlow[i]` — indexed by `session.questionCount` which starts at 0 and increments before each fetch

One issue found and fixed: in `runDiscovery`, the demo index should be `s.questionCount - 1` after increment, or tracked separately. The demo flow has 5 entries (indices 0–4), and questionCount starts at 0 before the first call. Fix in page.js: use `demoDiscoveryFlow[Math.min(s.questionCount, demoDiscoveryFlow.length - 1)]`.

Update Task 12 Step 1, in the `runDiscovery` function, change:
```js
const result = isDemoMode
  ? demoDiscoveryFlow[s.questionCount ?? 0]
```
to:
```js
const result = isDemoMode
  ? demoDiscoveryFlow[Math.min(s.questionCount ?? 0, demoDiscoveryFlow.length - 1)]
```

---

**Plan complete and saved to `docs/superpowers/plans/2026-06-06-gatekeeper-app.md`.**

**Two execution options:**

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
