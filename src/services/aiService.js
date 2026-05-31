/**
 * aiService — handles streaming AI calls with checkpoint support.
 *
 * Checkpoint strategy:
 *   Large files are split into chunks of `checkpointSize` lines.
 *   Each chunk is sent with a system prompt that includes the previous
 *   translated chunk as context, preventing the model from "forgetting"
 *   what it already translated.
 */

// ── Provider endpoints ────────────────────────────────────────────────────────
const ENDPOINTS = {
  openai:     'https://api.openai.com/v1/chat/completions',
  gemini:     'https://generativelanguage.googleapis.com/v1/models/{model}:streamGenerateContent',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
}

// Default model per provider (used when model = 'auto' and no fetched list)
const DEFAULT_MODELS = {
  openai:     'gpt-4o-mini',
  gemini:     'gemini-3.5-flash',
  openrouter: 'openai/gpt-4o-mini',
}

// Gemini models to rotate through when rate-limited (newest/fastest first)
// Sources: https://ai.google.dev/gemini-api/docs/models (updated May 2026)
// Note: gemini-2.0-* are deprecated — removed from rotation
const GEMINI_ROTATION = [
  'gemini-3.5-flash',        // Stable — best overall, frontier performance
  'gemini-3.1-flash-lite',   // Stable — fast, low cost
  'gemini-2.5-flash',        // Stable — great price/performance
  'gemini-2.5-flash-lite',   // Stable — fastest in 2.5 family
  'gemini-3-flash-preview',  // Preview — frontier-class
  'gemini-2.5-pro',          // Stable — most capable (slower, use as last resort)
]

// Per-key rate-limit state: tracks which Gemini model index to use next
const geminiModelIndex = {}

/**
 * Get the next Gemini model for a key, rotating on rate-limit.
 * @param {string} keyId
 * @param {string[]} [availableModels] — fetched from API, overrides GEMINI_ROTATION
 */
function nextGeminiModel(keyId, availableModels) {
  const pool = availableModels?.length ? availableModels : GEMINI_ROTATION
  const idx = geminiModelIndex[keyId] ?? 0
  geminiModelIndex[keyId] = (idx + 1) % pool.length
  return pool[idx]
}

/**
 * Fetch available models for a provider/key.
 * Returns string[] of model IDs, or [] on error.
 */
export async function fetchModels({ provider, key }) {
  try {
    if (provider === 'gemini') {
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 8000)
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${key}&pageSize=50`,
        { signal: controller.signal }
      )
      clearTimeout(timer)
      if (!res.ok) return []
      const data = await res.json()
      return (data.models ?? [])
        .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
        .map(m => m.name.replace('models/', ''))
        .filter(m => m.startsWith('gemini'))
        .sort()
    }

    const endpoint = provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1/models'
      : 'https://api.openai.com/v1/models'

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 8000)
    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) return []
    const data = await res.json()
    const models = (data.data ?? []).map(m => m.id).sort()
    if (provider === 'openrouter') return models
    // OpenAI: filter to chat models only
    return models.filter(m => m.startsWith('gpt-') || m.startsWith('o1') || m.startsWith('o3'))
  } catch {
    return []
  }
}

// ── Connection test ───────────────────────────────────────────────────────────
/**
 * Send a minimal request to verify the key is valid.
 * Returns { ok: true, model, latency } or { ok: false, error }
 */
export async function testApiKey({ provider, key }) {
  const start = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)

  try {
    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models?key=${key}&pageSize=1`,
        { signal: controller.signal }
      )
      clearTimeout(timer)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = body?.error?.message ?? `HTTP ${res.status}`
        return { ok: false, error: msg }
      }
      const data = await res.json()
      const model = data.models?.[0]?.displayName ?? 'gemini'
      return { ok: true, model, latency: Date.now() - start }
    }

    // OpenAI / OpenRouter: models list endpoint — no token cost
    const endpoint = provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1/models'
      : 'https://api.openai.com/v1/models'

    const res = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${key}` },
      signal: controller.signal,
    })
    clearTimeout(timer)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const msg = body?.error?.message ?? `HTTP ${res.status}`
      return { ok: false, error: msg }
    }

    const data = await res.json()
    const models = data.data ?? []
    const preferred = ['gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo', 'openai/gpt-4o']
    const found = preferred.find(m => models.some(x => x.id === m))
    const model = found ?? models[0]?.id ?? provider
    return { ok: true, model, latency: Date.now() - start }

  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') return { ok: false, error: 'Request timed out (8s)' }
    return { ok: false, error: err.message }
  }
}

/**
 * Stream a chat completion.
 * keyEntry: { id, provider, key, model, availableModels? }
 *   model = 'auto' → use DEFAULT_MODELS, with Gemini rotation on 429
 *   model = specific → use that model, no rotation
 */
export async function streamChat(keyEntry, messages, onToken, signal) {
  const { provider, key } = keyEntry

  if (provider === 'gemini') {
    // Determine model: auto = rotate, specific = fixed
    const useAuto = !keyEntry.model || keyEntry.model === 'auto'
    const model = useAuto
      ? nextGeminiModel(keyEntry.id, keyEntry.availableModels)
      : keyEntry.model

    try {
      return await streamGemini(key, model, messages, onToken, signal)
    } catch (err) {
      // On 429 rate-limit with auto mode, rotate to next model and retry once
      if (useAuto && err.message?.includes('429')) {
        const nextModel = nextGeminiModel(keyEntry.id, keyEntry.availableModels)
        return streamGemini(key, nextModel, messages, onToken, signal)
      }
      throw err
    }
  }

  const model = (!keyEntry.model || keyEntry.model === 'auto')
    ? DEFAULT_MODELS[provider] ?? 'gpt-4o-mini'
    : keyEntry.model

  return streamOpenAICompat(ENDPOINTS[provider] || ENDPOINTS.openai, key, model, messages, onToken, signal)
}

/**
 * Wrap a stream call with a combined timeout + token-inactivity watchdog.
 * @param {function} fn          - async () => void, the stream call
 * @param {number}   totalMs     - hard timeout for the whole request (default 90s)
 * @param {number}   inactiveMs  - abort if no token received for this long (default 25s)
 * @param {AbortSignal} signal   - parent abort signal
 */
async function withStreamTimeout(fn, totalMs = 90000, inactiveMs = 25000, signal) {
  const controller = new AbortController()

  // Propagate parent abort
  const parentAbort = () => controller.abort()
  signal?.addEventListener('abort', parentAbort)

  // Hard timeout
  const hardTimer = setTimeout(() => controller.abort(), totalMs)

  // Inactivity watchdog — reset every time a token arrives
  let inactiveTimer = setTimeout(() => controller.abort(), inactiveMs)
  const resetInactive = () => {
    clearTimeout(inactiveTimer)
    inactiveTimer = setTimeout(() => controller.abort(), inactiveMs)
  }

  try {
    await fn(controller.signal, resetInactive)
  } finally {
    clearTimeout(hardTimer)
    clearTimeout(inactiveTimer)
    signal?.removeEventListener('abort', parentAbort)
  }

  if (controller.signal.aborted && !signal?.aborted) {
    throw new Error('Request timed out — no response from API')
  }
}

// ── OpenAI-compatible (OpenAI + OpenRouter) ───────────────────────────────────
async function streamOpenAICompat(endpoint, key, model, messages, onToken, signal) {
  await withStreamTimeout(async (innerSignal, resetInactive) => {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ model, messages, stream: true }),
      signal: innerSignal,
    })

    if (!res.ok) {
      const errText = await res.text()
      let errMsg = `API error ${res.status}`
      try {
        const errJson = JSON.parse(errText)
        const msg = errJson?.error?.message
        if (msg) errMsg = `${res.status}: ${msg.slice(0, 200)}`
      } catch { errMsg = `API error ${res.status}: ${errText.slice(0, 120)}` }
      throw new Error(errMsg)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') return
        try {
          const json = JSON.parse(data)
          const token = json.choices?.[0]?.delta?.content
          if (token) { resetInactive(); onToken(token) }
        } catch { /* skip malformed */ }
      }
    }
  }, 90000, 25000, signal)
}

// ── Gemini streaming ──────────────────────────────────────────────────────────
async function streamGemini(key, model, messages, onToken, signal) {
  const systemMsg = messages.find(m => m.role === 'system')

  // Merge system prompt into the first user message to avoid field issues
  // across different Gemini API versions
  const userMessages = messages.filter(m => m.role !== 'system')
  if (systemMsg && userMessages.length > 0) {
    userMessages[0] = {
      ...userMessages[0],
      content: systemMsg.content + '\n\n' + userMessages[0].content,
    }
  }

  const contents = userMessages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const body = {
    contents,
    generationConfig: { temperature: 0.2 },
  }

  const url = `${ENDPOINTS.gemini.replace('{model}', model)}?key=${key}&alt=sse`

  await withStreamTimeout(async (innerSignal, resetInactive) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: innerSignal,
    })

    if (!res.ok) {
      const errText = await res.text()
      let errMsg = `Gemini error ${res.status}`
      try {
        const errJson = JSON.parse(errText)
        const msg = errJson?.error?.message
        const status = errJson?.error?.status
        if (msg) errMsg = `Gemini ${res.status}: ${msg}${status ? ` (${status})` : ''}`
      } catch { errMsg = `Gemini error ${res.status}: ${errText.slice(0, 120)}` }
      throw new Error(errMsg)
    }

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const json = JSON.parse(line.slice(6))
          const token = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (token) { resetInactive(); onToken(token) }
        } catch { /* skip */ }
      }
    }
  }, 90000, 25000, signal)
}

// ── Translation task ──────────────────────────────────────────────────────────
/**
 * Build the system prompt for a translation chunk.
 */
function buildSystemPrompt(targetLangLabel, targetLang, prevContext) {
  return [
    `You are a professional translator specializing in Minecraft plugin configuration files.`,
    `Translate ALL human-readable text strings to ${targetLangLabel} (language code: ${targetLang}).`,
    ``,
    `STRICT RULES — follow exactly:`,
    `1. Preserve ALL file structure: indentation, blank lines, YAML/JSON/properties syntax.`,
    `2. DO NOT translate: YAML/JSON keys, variable names like %player%, {player}, <player>, color codes like &a &b §a, numbers, URLs, command names starting with /, plugin class names.`,
    `3. DO translate: all string values that are human-readable messages, descriptions, titles, lore text, button labels, chat messages — even if they appear after :, inside '', "", [], {}, ().`,
    `4. For YAML: translate the value part after the colon. Example:`,
    `   Input:  message: 'Hello world'`,
    `   Output: message: 'Xin chào thế giới'`,
    `5. For multi-line strings and lists, translate each text item individually.`,
    `6. Keep placeholders intact: %s, %d, %1$s, {0}, {player}, <name>, etc.`,
    `7. Return ONLY the translated file content. No explanations, no markdown code fences, no extra text.`,
    prevContext
      ? `\nCONTEXT from adjacent chunk (for continuity):\n${prevContext}`
      : '',
  ].filter(Boolean).join('\n')
}

/**
 * Split lines into N roughly-equal groups (one per key).
 * Tries to split on blank lines to avoid cutting mid-block.
 */
function splitIntoGroups(lines, n) {
  if (n <= 1) return [lines]
  const targetSize = Math.ceil(lines.length / n)
  const groups = []
  let start = 0
  for (let g = 0; g < n; g++) {
    if (start >= lines.length) break
    if (g === n - 1) { groups.push(lines.slice(start)); break }
    let end = Math.min(start + targetSize, lines.length)
    // Try to snap to a blank line within ±10 lines
    for (let offset = 0; offset <= 10 && end + offset < lines.length; offset++) {
      if (lines[end + offset].trim() === '') { end = end + offset + 1; break }
    }
    groups.push(lines.slice(start, end))
    start = end
  }
  return groups
}

/**
 * Translate one group of lines sequentially (chunk by chunk with checkpoints).
 * If a chunk fails, automatically retries with the next available key (fallback).
 * Only throws if ALL keys fail for a chunk.
 */
async function translateGroup({
  keyEntry,
  allKeys,       // full pool for fallback
  groupLines,
  groupStartLine,
  targetLang,
  targetLangLabel,
  checkpointSize,
  tokenLimit,
  onChunkDone,
  onProgress,
  onKeyFallback, // (failedKey, fallbackKey, chunkStart, error) => void
  totalChunks,
  completedRef,
  signal,
}) {
  const charsPerChunk = Math.min(checkpointSize * 120, tokenLimit * 3)
  const chunks = []
  let cur = [], curChars = 0

  for (const line of groupLines) {
    cur.push(line)
    curChars += line.length + 1
    if (cur.length >= checkpointSize || curChars >= charsPerChunk) {
      chunks.push(cur); cur = []; curChars = 0
    }
  }
  if (cur.length > 0) chunks.push(cur)

  const resultChunks = []
  let prevTranslated = ''
  let inputLineOffset = 0
  // Start with the assigned key; fallback pool = all other active keys
  let currentKey = keyEntry
  const fallbackPool = (allKeys ?? []).filter(k => k.id !== keyEntry.id)

  for (let i = 0; i < chunks.length; i++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const chunk = chunks[i]
    const chunkStartLine = groupStartLine + inputLineOffset
    const chunkEndLine   = chunkStartLine + chunk.length - 1

    const systemPrompt = buildSystemPrompt(
      targetLangLabel, targetLang,
      prevTranslated ? prevTranslated.split('\n').slice(-10).join('\n') : null
    )

    // Try current key, then fallback keys one by one
    const keyQueue = [currentKey, ...fallbackPool]
    let translated = null
    let lastError = null

    for (const tryKey of keyQueue) {
      if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')
      try {
        let buf = ''
        await streamChat(
          tryKey,
          [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: chunk.join('\n') },
          ],
          (token) => { buf += token },
          signal,
        )
        translated = buf.replace(/\n$/, '')

        // If we had to fall back, notify caller and update currentKey
        if (tryKey.id !== currentKey.id) {
          onKeyFallback?.(currentKey, tryKey, chunkStartLine, lastError)
          currentKey = tryKey
        }
        break // success
      } catch (err) {
        if (err.name === 'AbortError') throw err // propagate user-stop immediately
        lastError = err
        // Timeout errors should also try next key
        // continue to next key in queue
      }
    }

    if (translated === null) {
      // All keys failed — keep original lines for this chunk and continue
      translated = chunk.join('\n')
      onKeyFallback?.(currentKey, null, chunkStartLine, lastError)
    }

    prevTranslated = translated
    resultChunks.push(translated)
    inputLineOffset += chunk.length

    completedRef.value += 1
    onProgress?.(completedRef.value, totalChunks)
    onChunkDone?.(translated, chunkStartLine, chunkEndLine, currentKey.label)
  }

  return resultChunks.join('\n')
}

/**
 * Translate file content.
 * - 1 active key  → sequential (original behaviour)
 * - 2+ active keys → parallel: file split into N groups, each key handles one group
 *
 * @param {object[]} activeKeys     - array of active key entries
 * @param {string}   content
 * @param {string}   targetLang
 * @param {string}   targetLangLabel
 * @param {number}   checkpointSize
 * @param {number}   tokenLimit
 * @param {function} onChunkDone    - (translatedChunk, startLine, endLine, keyLabel) => void
 * @param {function} onProgress     - (completed, total) => void
 * @param {AbortSignal} signal
 * @returns {Promise<string>}
 */
export async function translateFile({
  activeKeys,
  keyEntry,
  content,
  targetLang,
  targetLangLabel,
  checkpointSize = 80,
  tokenLimit = 40000,
  onChunkDone,
  onProgress,
  onKeyFallback,  // (failedKey, fallbackKey|null, chunkStartLine, error) => void
  signal,
}) {
  const keys = activeKeys ?? (keyEntry ? [keyEntry] : [])
  if (keys.length === 0) throw new Error('No active API keys')

  const lines = content.split('\n')

  // ── Single key ────────────────────────────────────────────────────────────
  if (keys.length === 1) {
    const charsPerChunk = Math.min(checkpointSize * 120, tokenLimit * 3)
    const chunks = []
    let cur = [], curChars = 0
    for (const line of lines) {
      cur.push(line); curChars += line.length + 1
      if (cur.length >= checkpointSize || curChars >= charsPerChunk) {
        chunks.push(cur); cur = []; curChars = 0
      }
    }
    if (cur.length > 0) chunks.push(cur)

    const completedRef = { value: 0 }
    return translateGroup({
      keyEntry: keys[0],
      allKeys: keys,
      groupLines: lines,
      groupStartLine: 0,
      targetLang, targetLangLabel,
      checkpointSize, tokenLimit,
      onChunkDone: (chunk, s, e, kl) => onChunkDone?.(chunk, s, e, kl),
      onProgress,
      onKeyFallback,
      totalChunks: chunks.length,
      completedRef,
      signal,
    })
  }

  // ── Multiple keys: parallel groups ───────────────────────────────────────
  const n = keys.length
  const groups = splitIntoGroups(lines, n)

  const charsPerChunk = Math.min(checkpointSize * 120, tokenLimit * 3)
  let totalChunks = 0
  for (const g of groups) {
    let cur = [], curChars = 0
    for (const line of g) {
      cur.push(line); curChars += line.length + 1
      if (cur.length >= checkpointSize || curChars >= charsPerChunk) {
        totalChunks++; cur = []; curChars = 0
      }
    }
    if (cur.length > 0) totalChunks++
  }

  const completedRef = { value: 0 }
  const groupOffsets = []
  let offset = 0
  for (const g of groups) { groupOffsets.push(offset); offset += g.length }

  const promises = groups.map((groupLines, idx) =>
    translateGroup({
      keyEntry: keys[idx],
      allKeys: keys,          // full pool available for fallback
      groupLines,
      groupStartLine: groupOffsets[idx],
      targetLang, targetLangLabel,
      checkpointSize, tokenLimit,
      onChunkDone,
      onProgress,
      onKeyFallback,
      totalChunks,
      completedRef,
      signal,
    })
  )

  const results = await Promise.all(promises)
  return results.join('\n')
}
