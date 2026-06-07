# AI Gatekeeper

AI Gatekeeper is a decision-support application that helps organizations evaluate business problems and determine the most sensible path forward, whether that path involves AI or not.

## What it does

The application begins with a business problem rather than a proposed solution. Through a conversational discovery process, AI Gatekeeper identifies likely root causes, evaluates potential solution approaches, conducts research, and recommends a single primary course of action.

It is not intended to replace formal business case development, architectural review, procurement processes, or project planning. It is intended to provide practical, evidence-based recommendations that help organizations make more informed investment decisions.

## Setup

### Prerequisites

- Node.js 18+
- An OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

```bash
git clone <repo-url>
cd Gatekeeper
npm install
```

### Adding your API key

**Option 1 — App settings (recommended):**
Launch the app. On first launch, a setup wizard will ask for your OpenAI API key. The key is stored in your browser's localStorage only — it is never sent anywhere except directly to the OpenAI API.

**Option 2 — Environment variable:**
Create a `.env.local` file in the project root:
```
OPENAI_API_KEY=sk-...
```
The in-app key (Option 1) takes priority over the environment variable if both are present.

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo mode

Click **Try Demo** on the welcome screen to walk through the full workflow using simulated responses — no API key required. The demo uses a fictional supplier data normalization scenario and shows the complete 12-step process.

## How it works

| Step | What happens |
|------|-------------|
| 0 | Welcome screen — you describe your business problem |
| 1 | Qualification — Gatekeeper checks the problem is suitable for analysis |
| 2 | Discovery — a short conversational interview (max 12 questions) |
| 3 | Problem brief generated from the discovery conversation |
| 4 | You review and edit the problem statement before analysis begins |
| 5 | Root cause analysis |
| 6 | Research decision — determines whether external research is needed |
| 7–8 | External research and synthesis (if needed) |
| 9 | Strategic analysis of solution alternatives |
| 10 | Recommendation generation |
| 11 | Full report with PDF export |

## How this was built
This app was vibecoded — meaning the implementation was built with AI assistance. However, the core logic of the application lives in the prompt files in /prompts, and those were researched, designed, and written by me. The prompts define how the app thinks, what questions it asks, how it evaluates problems, and how it generates recommendations. If you're curious about AI-assisted product development, this project is a practical example of separating "what the AI does" from "how a human directs it."

## Notes

- Session state is stored in `localStorage` under `gatekeeper_session`
- The app uses `gpt-4o-mini` for all OpenAI calls
- Prompt files in `/prompts` are read server-side only — they are never exposed to the client
- PDF export uses html2pdf.js and downloads as `gatekeeper-report.pdf`
- Starting over clears the session and returns to the welcome screen
