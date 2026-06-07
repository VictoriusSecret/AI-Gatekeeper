# AI Gatekeeper — Technical Specification

Read this file in full before beginning any work on this project.

\---

## What This Application Is

AI Gatekeeper is a decision-support application that helps organizations evaluate business problems and determine the most sensible path forward, whether that path involves AI or not.

The application begins with a business problem rather than a proposed solution. Through a conversational discovery process, AI Gatekeeper identifies likely root causes, evaluates potential solution approaches, conducts research, and recommends a single primary course of action.

AI Gatekeeper is not intended to replace formal business case development, architectural review, procurement processes, or project planning. It is intended to provide practical, evidence-based recommendations that help organizations make more informed investment decisions.

\---

## Tech Stack and Constraints

* **Framework:** Next.js (local web app)
* **Session state:** Local-only, persisted in browser `localStorage`
* **AI API:** OpenAI API
* **Model:** `gpt-4o-mini` — use this model for every OpenAI API call
* **API key storage:** `.env.local` — the app reads the key from this file; a settings UI also allows the user to configure it (see Settings UI below)

**Prompt files:** Prompt files (gatekeeper-principles.txt, qualification.txt, etc.) are stored locally in the /prompts directory and read by the app at runtime using fs.readFileSync in server-side API routes. They are never exposed to the client.

## Design Tokens and Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700\\\&family=Inter:wght@400;500\\\&display=swap');

:root {
  --canvas-bg: #ffffff;
  --enterprise-dark: #151515;
  --startup-spark: #8b5cf6;
  --structure-bg: #f1f5f9;
  --text-muted: #64748b;
}

h1, h2, h3, .app-title {
  font-family: 'Space Grotesk', sans-serif;
  color: var(--enterprise-dark);
  font-weight: 700;
  letter-spacing: -0.03em;
}

body, p, ul, .chat-message, .report-data {
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
}

.metadata-label {
  font-family: 'Inter', sans-serif;
  color: var(--text-muted);
  font-size: 0.875rem;
}
```

\---

## OpenAI API Call Construction

Every call to the OpenAI API follows this structure:

```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI\\\_API\\\_KEY}`
  },
  body: JSON.stringify({
    model: 'gpt-4o-mini',
    messages: \\\[
      {
        role: 'system',
        content: '<contents of gatekeeper-principles.txt>'
      },
      {
        role: 'user',
        content: '<contents of phase-specific prompt file> + <structured data inputs for this phase>'
      }
    ]
  })
});
```

* `gatekeeper-principles.txt` is always sent as the `system` message.
* The phase-specific prompt file and all structured data inputs for that phase are combined and sent as the `user` message.
* All responses are expected to be valid JSON. Parse the response and handle errors as described in the Error Handling section below.
* After every completed step, store the result to `localStorage` before proceeding.

\---

## localStorage State Schema

All session state is stored in a single `localStorage` key: `gatekeeper\\\_session`.

The value is a JSON object with the following shape:

```json
{
  "currentStep": 0,
  "originalProblem": "",
  "discoveryHistory": \\\[],
  "questionCount": 0,
  "problemBrief": null,
  "validatedProblemStatement": "",
  "rootCauseAnalysis": null,
  "researchDecision": null,
  "externalResearch": null,
  "researchSynthesis": null,
  "strategicAnalysis": null,
  "recommendation": null
}
```

* `discoveryHistory` is an array of `{ question: string, answer: string }` objects, one per exchange.
* All other fields are null until populated by their respective phase.
* State is written after every successfully completed step so that a failure only affects the current call, not prior progress.
* On page load, check `localStorage` for an existing session. If one exists and `currentStep > 0`, offer the user the option to resume or start over.

\---

## Error Handling

Do not discard progress on error. Store the last successful state before every API call.

### General API error

Display:

> Something went wrong while contacting OpenAI. Your progress has been saved. Please try again.

Buttons: **Retry** | **Edit previous input** | **Start over**

### Timeout

Display:

> This request took too long. Your progress has been saved. You can retry or revise your input.

Buttons: **Retry** | **Edit previous input** | **Start over**

### Invalid or unparseable JSON response

Display:

> Gatekeeper received an unexpected response. Please retry.

Button: **Retry**

### Start Over behavior

Clears `gatekeeper\\\_session` from `localStorage` and returns the user to Step 0 (the welcome screen).

\---

## Settings UI

The app includes a settings area where the user can enter and save their OpenAI API key. The key is saved to `localStorage` under a separate key (`gatekeeper\\\_api\\\_key`) and used in place of the `.env.local` value if present. Include fields for:

* API key input (masked)
* Save button
* A note explaining that the key is stored locally in the browser only

\---

## Demo Mode

The app includes a demo mode that allows it to be explored without a real OpenAI API key. Demo mode:

* Is triggered by a "Try Demo" button or link on the welcome screen
* Uses mock responses for each phase that simulate a realistic but fictional business problem (e.g. the supplier data normalization example from the welcome screen)
* Proceeds through the full workflow using these mock responses, skipping actual OpenAI calls
* Is clearly labeled in the UI so the user knows they are viewing demo content

Provide complete mock response objects for each phase as part of the demo implementation. The mock scenario should be consistent end-to-end (the same fictional problem flowing through all phases).

\---

## Setup Wizard

On first launch (no `gatekeeper\\\_session` and no `gatekeeper\\\_api\\\_key` in `localStorage`), display a brief setup wizard before showing the welcome screen. The wizard should:

1. Explain what AI Gatekeeper does (one short paragraph)
2. Ask the user to enter their OpenAI API key
3. Provide a link to where they can obtain a key (https://platform.openai.com/api-keys)
4. Confirm the key has been saved before proceeding to the welcome screen

The setup wizard should not appear on subsequent visits if a key is already stored.

\---

## PDF Export

The "Download PDF" button at the top of the report screen generates and downloads a PDF of the report content. Implementation guidance:

* Use a print-CSS approach or a library such as `jsPDF` or `html2pdf.js`
* The PDF should reflect the content and structure displayed in the UI (H2 section headings, H3 subheadings, all data fields)
* The PDF filename should be `gatekeeper-report.pdf`
* Page breaks should occur between major report sections where possible

\---

## Workflow Steps

The following table defines every step in the application workflow. Steps are executed in sequence. The branching exceptions are noted in the App Action column.

|Step|Description|Prompt File|Input to OpenAI|Expected Output (JSON Schema)|App Action|UI / Loading Label|
|-|-|-|-|-|-|-|
|0|Fresh Session|none|none|none|Start empty session state. Show welcome screen.|**Welcome screen layout (top to bottom):** `h1`: Welcome to AI Gatekeeper. Intro paragraphs: "AI Gatekeeper is a decision-support application that helps organizations evaluate business problems and determine the most sensible path forward, whether that path involves AI or not. The application begins with a business problem rather than a proposed solution. Through a conversational discovery process, AI Gatekeeper identifies likely root causes, evaluates potential solution approaches, conducts research, and recommends a single primary course of action. AI Gatekeeper is not intended to replace formal business case development, architectural review, procurement processes, or project planning. It is intended to provide practical, evidence-based recommendations that help organizations make more informed investment decisions." `h2`: What problem are you trying to solve today? Text input box. "Here are some examples:" followed by unordered list: "Our support team manually reviews and categorizes approximately 5,000 tickets per month before assigning them to specialists." / "We receive product data from dozens of suppliers and spend significant time normalizing it before it can be imported into our platform." / "Our employees struggle to locate company policies and frequently ask HR questions that are already documented." / "Managers spend significant time writing performance reviews and often feel unsure about what feedback to provide." / "A multi-step approval process causes delays and confusion between departments."|
|1|Problem Qualification|`qualification.txt`|`\\\[gatekeeper-principles.txt]` `\\\[qualification.txt]` `USER SUBMISSION {{USER\\\_SUBMISSION}}`|`{ "status": "accept \| clarify \| expand", "message": "string", "nextStep": "discovery \| revise" }`|If `status = accept`: store the problem statement and proceed to Step 2. If `status = clarify` or `expand`: display the message and show a text input box for the user to revise their submission.|If accept: display "calculating" with spinner. If clarify or expand: display the message text and a text input box with a Submit button.|
|2|Discovery Interview Loop|`discovery.txt`|`\\\[gatekeeper-principles.txt]` `\\\[discovery.txt]` `ORIGINAL PROBLEM STATEMENT {{ORIGINAL\\\_PROBLEM}}` `QUESTION COUNT {{QUESTION\\\_COUNT}}` `CONVERSATION HISTORY {{DISCOVERY\\\_HISTORY}}`|If question needed: `{ "status": "question", "message": "string", "problemBrief": null }` — If discovery complete: `{ "status": "brief\\\_ready", "problemBrief": { "problem": "", "businessImpact": "", "currentState": "", "desiredOutcome": "", "scale": "", "constraints": \\\[], "stakeholders": \\\[], "priorAttempts": \\\[], "successMeasurement": "", "knownUnknowns": \\\[], "keyAssumptions": \\\[] } }`|Display one question at a time. Store each answer. Increment question count. Re-send full conversation history with each call. Continue loop until `status = brief\\\_ready` or question count reaches 12. When complete, store `problemBrief` and proceed to Step 3.|Show one question and one text input box at a time. After user submits an answer, show "calculating" with spinner while fetching the next question. When `brief\\\_ready` is received, show "calculating" with spinner while proceeding to Step 3. Max 12 questions.|
|3|Problem Brief Generation|`problem.txt`|`\\\[gatekeeper-principles.txt]` `\\\[problem.txt]` `PROBLEM BRIEF {{PROBLEM\\\_BRIEF}}`|`{ "problemStatement": "string" }`|Display the generated problem statement in an editable text area for user review. Proceed to Step 4.|Display "calculating" with spinner during API call. Then display editable text area with the returned problem statement.|
|4|User Validates Brief|none|none|none|Display the problem statement in an editable text area. User may accept as-is or edit. On submit: if edited, update the `problemBrief` object to reflect the edits. Store the final text as `validatedProblemStatement`. No OpenAI call required. Proceed to Step 5.|Display editable text area with Submit button. No spinner — this is a user action step only.|
|5|Root Cause Analysis|`root-cause.txt`|`\\\[gatekeeper-principles.txt]` `\\\[root-cause.txt]` `VALIDATED PROBLEM STATEMENT {{VALIDATED\\\_PROBLEM\\\_STATEMENT}}` `PROBLEM BRIEF {{PROBLEM\\\_BRIEF}}`|`{ "primaryRootCause": { "category": "", "rationale": "" }, "contributingFactors": \\\[ { "category": "", "rationale": "" } ], "alternativeCategoriesConsidered": \\\[ { "category": "", "reasonRejected": "" } ], "confidence": "", "evidence": \\\[], "assumptions": \\\[] }`|Store `rootCauseAnalysis` object. Proceed to Step 6.|Display "calculating" with spinner.|
|6|Research Decision|`research-decision.txt`|`\\\[gatekeeper-principles.txt]` `\\\[research-decision.txt]` `VALIDATED PROBLEM STATEMENT {{VALIDATED\\\_PROBLEM\\\_STATEMENT}}` `PROBLEM BRIEF {{PROBLEM\\\_BRIEF}}` `ROOT CAUSE ANALYSIS {{ROOT\\\_CAUSE\\\_ANALYSIS}}`|`{ "researchRequired": true \| false, "rationale": "", "researchObjectives": \\\[], "priorityAreas": \\\[] }`|Store `researchDecision` object. If `researchRequired = true`: proceed to Step 7. If `researchRequired = false`: skip Steps 7 and 8 and proceed directly to Step 9.|Display "reticulating splines" with spinner.|
|7|External Research|`external-research.txt`|`\\\[gatekeeper-principles.txt]` `\\\[external-research.txt]` `VALIDATED PROBLEM STATEMENT {{VALIDATED\\\_PROBLEM\\\_STATEMENT}}` `PROBLEM BRIEF {{PROBLEM\\\_BRIEF}}` `ROOT CAUSE ANALYSIS {{ROOT\\\_CAUSE\\\_ANALYSIS}}` `RESEARCH DECISION {{RESEARCH\\\_DECISION}}`|`{ "solutionPatterns": \\\[], "marketMaturityEvidence": \\\[], "vendors": \\\[ { "name": "", "relevance": "", "marketPosition": "", "relativeCost": "", "costConsiderations": \\\[], "strengths": \\\[], "limitations": \\\[] } ], "failurePatterns": \\\[], "noActionEvidence": \\\[], "aiRelevanceSignals": \\\[], "researchSources": \\\[] }`|Store `externalResearch` object. Proceed to Step 8.|Display "calculating" with spinner.|
|8|Research Synthesis|`research-synthesis.txt`|`\\\[gatekeeper-principles.txt]` `\\\[research-synthesis.txt]` `VALIDATED PROBLEM STATEMENT {{VALIDATED\\\_PROBLEM\\\_STATEMENT}}` `PROBLEM BRIEF {{PROBLEM\\\_BRIEF}}` `ROOT CAUSE ANALYSIS {{ROOT\\\_CAUSE\\\_ANALYSIS}}` `EXTERNAL RESEARCH RESULTS {{EXTERNAL\\\_RESEARCH\\\_RESULTS}}`|`{ "marketMaturity": { "rating": "", "rationale": "" }, "vendorLandscape": { "rating": "", "rationale": "" }, "solutionPatterns": { "mostCommon": \\\[], "secondary": \\\[] }, "failurePatternSummary": \\\[], "aiMarketSignals": { "rating": "", "rationale": "" }, "keyResearchFindings": \\\[], "researchConfidence": { "rating": "", "rationale": "" }, "assumptions": \\\[] }`|Store `researchSynthesis` object. Proceed to Step 9.|Display "calculating" with spinner.|
|9|Strategic Analysis|`strategic-analysis.txt`|`\\\[gatekeeper-principles.txt]` `\\\[strategic-analysis.txt]` `VALIDATED PROBLEM STATEMENT {{VALIDATED\\\_PROBLEM\\\_STATEMENT}}` `PROBLEM BRIEF {{PROBLEM\\\_BRIEF}}` `ROOT CAUSE ANALYSIS {{ROOT\\\_CAUSE\\\_ANALYSIS}}` `RESEARCH SYNTHESIS {{RESEARCH\\\_SYNTHESIS}}`|`{ "problemSignificance": { "rating": "", "rationale": "" }, "solutionLandscape": { "alternativesEvaluated": \\\[ { "approach": "", "fit": "", "rationale": "", "keyTradeoffs": \\\[] } ], "alternativesNotEvaluated": \\\[ { "approach": "", "reason": "" } ] }, "buildVsBuy": { "recommendedApproach": "", "rationale": "" }, "economicConsiderations": { "implementationCost": "", "operationalCost": "", "timeToValue": "", "opportunityCost": "", "rationale": "" }, "humanImpact": { "capabilityEnhancement": "", "capabilityRisk": "", "humanJudgmentRequirements": "", "knowledgeRetentionConsiderations": "" }, "aiAssessment": { "rating": "", "rationale": "" }, "strategicInsights": \\\[], "assumptions": \\\[] }`|Store `strategicAnalysis` object. Proceed to Step 10.|Display "calculating" with spinner.|
|10|Recommendation Generation|`recommendation-generation.txt`|`\\\[gatekeeper-principles.txt]` `\\\[recommendation-generation.txt]` `VALIDATED PROBLEM STATEMENT {{VALIDATED\\\_PROBLEM\\\_STATEMENT}}` `PROBLEM BRIEF {{PROBLEM\\\_BRIEF}}` `ROOT CAUSE ANALYSIS {{ROOT\\\_CAUSE\\\_ANALYSIS}}` `RESEARCH SYNTHESIS {{RESEARCH\\\_SYNTHESIS}}` `STRATEGIC ANALYSIS {{STRATEGIC\\\_ANALYSIS}}`|`{ "recommendedPath": { "primaryApproach": "", "supportingApproaches": \\\[] }, "rootCauseAlignment": "", "rationale": "", "alternativesNotSelected": \\\[ { "approach": "", "reasonNotSelected": "" } ], "risks": \\\[], "confidence": { "rating": "", "rationale": "" }, "nextStep": "" }`|Store `recommendation` object. Proceed to Step 11.|Display "calculating" with spinner.|
|11|Report Assembly|n/a|n/a|n/a|Assemble report from all stored analysis artifacts. Render all report sections in the UI.|Each report section heading is an `H2` tag. Subheadings are `H3` tags. A "Download PDF" button appears at the top of the screen. See Report Structure section below.|
|12|Export|n/a|n/a|n/a|Generate and download a PDF of the report content.|Clicking "Download PDF" initiates PDF generation and download. Filename: `gatekeeper-report.pdf`.|

\---

## Report Structure

The report is assembled entirely from stored artifacts — no additional OpenAI calls are made. Each section is an `H2`. Subheadings within sections are `H3`.

The "Download PDF" button appears at the top of the report screen.

### 1\. Executive Summary

Generated from the `recommendation` object.

* Recommended Path
* Recommendation Rationale
* Confidence
* Next Step

### 2\. Problem Definition

* Validated Problem Statement
* Problem Significance (from `strategicAnalysis.problemSignificance`)

### 3\. Root Cause Analysis

* Primary Root Cause
* Contributing Factors
* Confidence
* Evidence
* Assumptions

### 4\. Research Findings

* Market Maturity
* Vendor Landscape
* AI Market Signals
* Key Research Findings
* Common Failure Patterns

**Hide this section entirely if `researchDecision.researchRequired = false`.**

### 5\. Strategic Analysis

* Alternatives Evaluated
* Alternatives Not Evaluated
* Build vs Buy
* Economic Considerations
* Human Impact
* AI Assessment
* Strategic Insights

### 6\. Recommendation

* Recommended Path
* Root Cause Alignment
* Alternatives Not Selected
* Risks
* Confidence
* Next Step

\---

## Additional Deliverables

Include the following alongside the application:

* **README.md** — setup instructions, how to add the API key, how to run the app locally, and a brief description of what the app does
* **Architecture diagram** — a simple diagram showing the app's phases and data flow
* **Product rationale document** — a short document explaining the design philosophy behind AI Gatekeeper (why it starts with a problem, why it is not an AI advocate, etc.) — draw from the content of `gatekeeper-principles.txt` for this

