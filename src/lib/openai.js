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
