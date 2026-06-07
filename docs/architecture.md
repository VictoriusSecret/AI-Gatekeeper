# AI Gatekeeper — Architecture

## Overview

AI Gatekeeper is a Next.js application (App Router) that runs locally. All AI processing happens via server-side API routes — the client never calls OpenAI directly and never reads prompt files.

## Phase and Data Flow

```
Browser (localStorage: gatekeeper_session)
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│  Next.js Client (src/app/page.js — step orchestrator)        │
│                                                              │
│  Step 0:  WelcomeScreen          (user inputs problem)       │
│  Step 1:  Qualification          ──► POST /api/qualify       │
│  Step 2:  Discovery loop         ──► POST /api/discover      │
│  Step 3:  (spinner)              ──► POST /api/problem-brief │
│  Step 4:  ProblemBrief           (user edits + approves)     │
│  Step 5:  (spinner)              ──► POST /api/root-cause    │
│  Step 6:  (spinner)              ──► POST /api/research-decision
│           └─ researchRequired=true  → Step 7                 │
│           └─ researchRequired=false → Step 9 (skip 7–8)      │
│  Step 7:  (spinner)              ──► POST /api/external-research
│  Step 8:  (spinner)              ──► POST /api/research-synthesis
│  Step 9:  (spinner)              ──► POST /api/strategic-analysis
│  Step 10: (spinner)              ──► POST /api/recommendation│
│  Step 11: Report                 (assembled from session)    │
│  Step 12: PDF Export             (triggered by button)       │
└──────────────────────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────────────┐
│  Next.js API Routes (server-side)                            │
│                                                              │
│  Each route:                                                 │
│    1. Reads gatekeeper-principles.txt  → system message      │
│    2. Reads phase-specific prompt file → user message prefix │
│    3. Appends structured input data    → user message        │
│    4. Calls OpenAI (gpt-4o-mini)                             │
│    5. Parses and validates JSON response                     │
│    6. Returns structured result to client                    │
└──────────────────────────────────────────────────────────────┘
        │
        ▼
  OpenAI API (gpt-4o-mini, 60-second timeout)
```

## Key design decisions

### Server-side prompt isolation
Prompt files are read using `fs.readFileSync` in server-side API routes. They are never bundled into the client or exposed via any client-accessible endpoint.

### Session persistence
All state is stored in a single `localStorage` key (`gatekeeper_session`). State is written after every successful step so that a failure affects only the current API call, not prior progress. On page load, an existing session is detected and the user is offered the option to resume or start over.

### Research decision branching
Step 6 (Research Decision) returns `researchRequired: true | false`. When `false`, Steps 7 and 8 are skipped entirely and execution jumps to Step 9. The report omits the Research Findings section when research was not conducted.

### API key handling
The OpenAI API key can be provided via `.env.local` (server-side environment variable) or via the Settings UI (stored in `localStorage` under `gatekeeper_api_key`). When the client key is present, it is passed in the API route request body and takes priority. Since this is a local application, this is acceptable.

### Demo mode
Demo mode uses a complete set of pre-authored mock responses for a fictional supplier data normalization scenario. All API calls are bypassed. Demo content is clearly labeled in the UI.

## File structure

```
src/
  app/
    page.js              — step orchestrator
    layout.js            — root layout
    globals.css          — design tokens + global styles
    api/
      qualify/           — Step 1 API route
      discover/          — Step 2 API route
      problem-brief/     — Step 3 API route
      root-cause/        — Step 5 API route
      research-decision/ — Step 6 API route
      external-research/ — Step 7 API route
      research-synthesis/— Step 8 API route
      strategic-analysis/— Step 9 API route
      recommendation/    — Step 10 API route
  lib/
    session.js           — localStorage helpers
    openai.js            — shared OpenAI caller
    demo-data.js         — mock responses for demo mode
  components/
    SetupWizard.jsx      — first-launch wizard
    WelcomeScreen.jsx    — Step 0
    Settings.jsx         — API key settings panel
    Report.jsx           — Step 11 report
    ErrorDisplay.jsx     — error state UI
    LoadingSpinner.jsx   — spinner with label
    DemoBanner.jsx       — demo mode indicator
    steps/
      Qualification.jsx  — Step 1 (clarify/expand)
      Discovery.jsx      — Step 2 Q&A
      ProblemBrief.jsx   — Step 4 review/edit
      AutoProcessing.jsx — Steps 5–10 spinner
prompts/
  gatekeeper-principles.txt  — system prompt (all calls)
  qualification.txt           — Step 1
  discovery.txt               — Step 2
  problem.txt                 — Step 3
  root-cause.txt              — Step 5
  research-decision.txt       — Step 6
  external-research.txt       — Step 7
  research-synthesis.txt      — Step 8
  strategic-analysis.txt      — Step 9
  recommendation-generation.txt — Step 10
```
