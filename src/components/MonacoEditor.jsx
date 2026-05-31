import { useEffect, useRef } from 'react'
import Editor, { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'

// ── Monaco workers setup ──────────────────────────────────────────────────────
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker   from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import CssWorker    from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import HtmlWorker   from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import TsWorker     from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

self.MonacoEnvironment = {
  getWorker(_moduleId, label) {
    if (label === 'json')                                        return new JsonWorker()
    if (label === 'css' || label === 'scss' || label === 'less') return new CssWorker()
    if (label === 'html' || label === 'handlebars' || label === 'razor') return new HtmlWorker()
    if (label === 'typescript' || label === 'javascript')        return new TsWorker()
    return new EditorWorker()
  },
}

loader.config({ monaco })

// ── Custom dark theme ─────────────────────────────────────────────────────────
const SCONFIG_THEME = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'type.yaml',            foreground: 'a5b4fc', fontStyle: 'bold' },
    { token: 'string.yaml',          foreground: '86efac' },
    { token: 'number.yaml',          foreground: 'fb923c' },
    { token: 'keyword.yaml',         foreground: 'f472b6' },
    { token: 'comment.yaml',         foreground: '4b5563', fontStyle: 'italic' },
    { token: 'delimiter.yaml',       foreground: '6366f1' },
    { token: 'string.quoted.yaml',   foreground: '86efac' },
    { token: 'string.unquoted.yaml', foreground: 'e2e8f0' },
    { token: 'string.key.json',      foreground: 'a5b4fc', fontStyle: 'bold' },
    { token: 'string.value.json',    foreground: '86efac' },
    { token: 'number.json',          foreground: 'fb923c' },
    { token: 'keyword.json',         foreground: 'f472b6' },
    { token: 'delimiter.json',       foreground: '6366f1' },
    { token: 'key.properties',       foreground: 'a5b4fc', fontStyle: 'bold' },
    { token: 'string.properties',    foreground: '86efac' },
    { token: 'comment.properties',   foreground: '4b5563', fontStyle: 'italic' },
    { token: 'tag.xml',              foreground: 'f472b6' },
    { token: 'attribute.name.xml',   foreground: 'a5b4fc' },
    { token: 'attribute.value.xml',  foreground: '86efac' },
    { token: 'comment.xml',          foreground: '4b5563', fontStyle: 'italic' },
    { token: '',                     foreground: 'e2e8f0' },
    { token: 'comment',              foreground: '4b5563', fontStyle: 'italic' },
    { token: 'string',               foreground: '86efac' },
    { token: 'number',               foreground: 'fb923c' },
    { token: 'keyword',              foreground: 'f472b6' },
  ],
  colors: {
    'editor.background':                      '#0a0a14',
    'editor.foreground':                      '#e2e8f0',
    'editorLineNumber.foreground':            '#2d2d4a',
    'editorLineNumber.activeForeground':      '#818cf8',
    'editorCursor.foreground':                '#818cf8',
    'editor.selectionBackground':             '#818cf825',
    'editor.inactiveSelectionBackground':     '#818cf812',
    'editor.lineHighlightBackground':         '#ffffff05',
    'editor.lineHighlightBorder':             '#ffffff00',
    'editorGutter.background':                '#08080f',
    'editorIndentGuide.background1':          '#1e1e30',
    'editorIndentGuide.activeBackground1':    '#3d3d6b',
    'scrollbarSlider.background':             '#ffffff10',
    'scrollbarSlider.hoverBackground':        '#818cf830',
    'scrollbarSlider.activeBackground':       '#818cf850',
    'editor.findMatchBackground':             '#818cf840',
    'editor.findMatchHighlightBackground':    '#818cf820',
    'editorBracketMatch.background':          '#818cf820',
    'editorBracketMatch.border':              '#818cf860',
    'minimap.background':                     '#08080f',
    'minimapSlider.background':               '#ffffff08',
    'minimapSlider.hoverBackground':          '#818cf820',
    'editorWidget.background':                '#13131f',
    'editorWidget.border':                    '#ffffff12',
    'editorSuggestWidget.background':         '#13131f',
    'editorSuggestWidget.border':             '#ffffff12',
    'editorSuggestWidget.selectedBackground': '#818cf820',
    'editorSuggestWidget.highlightForeground':'#a5b4fc',
    'editorHoverWidget.background':           '#13131f',
    'editorHoverWidget.border':               '#ffffff12',
    'peekView.border':                        '#818cf840',
    'peekViewEditor.background':              '#0d0d1a',
    'peekViewResult.background':              '#0d0d1a',
    'editorOverviewRuler.border':             '#ffffff00',
  },
}

let themeRegistered = false
function ensureTheme(m) {
  if (themeRegistered) return
  m.editor.defineTheme('sconfig-dark', SCONFIG_THEME)
  themeRegistered = true
}

function detectLanguage(filename) {
  if (!filename) return 'plaintext'
  const lower = filename.toLowerCase()
  if (lower.endsWith('.yml') || lower.endsWith('.yaml')) return 'yaml'
  if (lower.endsWith('.json'))       return 'json'
  if (lower.endsWith('.toml'))       return 'ini'
  if (lower.endsWith('.properties')) return 'ini'
  if (lower.endsWith('.conf'))       return 'ini'
  if (lower.endsWith('.cfg'))        return 'ini'
  if (lower.endsWith('.ini'))        return 'ini'
  if (lower.endsWith('.xml'))        return 'xml'
  if (lower.endsWith('.sh'))         return 'shell'
  if (lower.endsWith('.bat'))        return 'bat'
  return 'plaintext'
}

function EditorSkeleton() {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a14] flex">
      <div className="w-12 h-full bg-[#08080f] border-r border-white/[0.04] flex flex-col gap-3 pt-3 px-2 flex-shrink-0">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-white/[0.04]" style={{ width: `${20 + (i % 3) * 8}px` }} />
        ))}
      </div>
      <div className="flex-1 flex flex-col gap-3 pt-3 px-4">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-white/[0.03]"
            style={{ width: `${30 + (i * 37 + i * i * 3) % 55}%` }} />
        ))}
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Props:
 *   initialValue   — content when editor first mounts / file changes
 *   originalContent — pre-AI content, used for per-line revert
 *   onChange       — called only when USER edits
 *   filename
 *   readOnly
 *   changedLines   — Set<number> of 1-indexed lines to highlight
 *   issueLines     — { line, severity: 'error'|'warning' }[] for validator highlights
 *
 * AI updates → custom event "monaco-set-content": { content }
 * Revert line → custom event "monaco-revert-line": { line, originalLine }
 */
export default function MonacoEditor({
  initialValue,
  originalContent,
  onChange,
  filename,
  readOnly = false,
  changedLines,
  issueLines,
}) {
  const editorRef        = useRef(null)
  const decorationsRef   = useRef([])   // changed-line decorations
  const issueDecRef      = useRef([])
  const hoverDecRef      = useRef([])   // hover revert-button decoration
  const suppressRef      = useRef(false)
  const originalLinesRef = useRef([])   // original lines for revert
  const changedLinesRef  = useRef(new Set())

  // Keep refs in sync via layout effect (before paint, safe)
  useEffect(() => {
    changedLinesRef.current = changedLines ?? new Set()
  }, [changedLines])

  useEffect(() => {
    originalLinesRef.current = (originalContent ?? '').split('\n')
  }, [originalContent])

  // ── AI content push ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      const editor = editorRef.current
      if (!editor) return
      const model = editor.getModel()
      if (!model) return
      const newContent = e.detail?.content
      if (typeof newContent !== 'string') return
      if (model.getValue() === newContent) return

      const scrollTop  = editor.getScrollTop()
      const scrollLeft = editor.getScrollLeft()
      const position   = editor.getPosition()

      suppressRef.current = true
      model.setValue(newContent)

      editor.setScrollTop(scrollTop)
      editor.setScrollLeft(scrollLeft)
      if (position) {
        const lineCount = model.getLineCount()
        editor.setPosition({
          lineNumber: Math.min(position.lineNumber, lineCount),
          column: position.column,
        })
      }
      requestAnimationFrame(() => requestAnimationFrame(() => {
        suppressRef.current = false
      }))
    }
    window.addEventListener('monaco-set-content', handler)
    return () => window.removeEventListener('monaco-set-content', handler)
  }, [])

  // ── Changed-line decorations (VSCode diff style) ────────────────────────────
  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    const newDecorations = changedLines && changedLines.size > 0
      ? Array.from(changedLines).map(line => ({
          range: { startLineNumber: line, endLineNumber: line, startColumn: 1, endColumn: 1 },
          options: {
            isWholeLine: true,
            className: 'monaco-ai-changed-line',
            marginClassName: 'monaco-ai-changed-margin',
            overviewRuler: { color: '#10b981aa', position: 1 },
            minimap: { color: '#10b98166', position: 1 },
          },
        }))
      : []
    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations)
  }, [changedLines])

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    const newDecorations = (issueLines ?? []).map(({ line, severity }) => ({
      range: { startLineNumber: line, endLineNumber: line, startColumn: 1, endColumn: 1 },
      options: {
        isWholeLine: true,
        className: severity === 'error' ? 'monaco-yaml-error-line' : 'monaco-yaml-warn-line',
        glyphMarginClassName: severity === 'error' ? 'monaco-yaml-error-glyph' : 'monaco-yaml-warn-glyph',
        overviewRuler: {
          color: severity === 'error' ? '#ef4444aa' : '#f59e0baa',
          position: severity === 'error' ? 4 : 2,
        },
      },
    }))
    issueDecRef.current = editor.deltaDecorations(issueDecRef.current, newDecorations)
  }, [issueLines])

  // ── Mount ───────────────────────────────────────────────────────────────────
  function handleBeforeMount(m) { ensureTheme(m) }

  function handleMount(editor, m) {
    editorRef.current = editor
    ensureTheme(m)
    m.editor.setTheme('sconfig-dark')

    // Ctrl+S
    editor.addCommand(m.KeyMod.CtrlCmd | m.KeyCode.KeyS, () => {
      window.dispatchEvent(new CustomEvent('monaco-save'))
    })

    // Reveal-line from AI panel
    const revealHandler = (e) => {
      const line = e.detail?.line
      if (typeof line === 'number' && line > 0) {
        editor.revealLineInCenterIfOutsideViewport(line, 0)
      }
    }
    window.addEventListener('monaco-reveal-line', revealHandler)

    // ── Hover: show revert button on changed lines ──────────────────────────
    editor.onMouseMove((e) => {
      const lineNumber = e.target?.position?.lineNumber
      if (!lineNumber || !changedLinesRef.current.has(lineNumber)) {
        hoverDecRef.current = editor.deltaDecorations(hoverDecRef.current, [])
        return
      }
      // Show revert glyph on this line
      hoverDecRef.current = editor.deltaDecorations(hoverDecRef.current, [{
        range: { startLineNumber: lineNumber, endLineNumber: lineNumber, startColumn: 1, endColumn: 1 },
        options: {
          glyphMarginClassName: 'monaco-revert-glyph',
          glyphMarginHoverMessage: { value: '↩ Revert this line to original' },
          stickiness: 1,
        },
      }])
    })

    editor.onMouseLeave(() => {
      hoverDecRef.current = editor.deltaDecorations(hoverDecRef.current, [])
    })

    // ── Click on revert glyph ───────────────────────────────────────────────
    editor.onMouseDown((e) => {
      if (e.target?.type !== 2) return // 2 = GUTTER_GLYPH_MARGIN
      const lineNumber = e.target?.position?.lineNumber
      if (!lineNumber || !changedLinesRef.current.has(lineNumber)) return

      const model = editor.getModel()
      if (!model) return

      // Get original line (0-indexed)
      const origLine = originalLinesRef.current[lineNumber - 1] ?? ''
      const currentLine = model.getLineContent(lineNumber)
      if (origLine === currentLine) return

      // Apply revert via edit (undoable)
      suppressRef.current = true
      editor.executeEdits('revert-line', [{
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: model.getLineMaxColumn(lineNumber),
        },
        text: origLine,
      }])
      requestAnimationFrame(() => requestAnimationFrame(() => {
        suppressRef.current = false
        // Notify parent that content changed after revert
        const newContent = model.getValue()
        window.dispatchEvent(new CustomEvent('monaco-user-edit', { detail: { content: newContent, revertedLine: lineNumber } }))
      }))
    })

    editor.onDidDispose(() => {
      window.removeEventListener('monaco-reveal-line', revealHandler)
    })
  }

  function handleChange(newVal) {
    if (suppressRef.current) return
    onChange?.(newVal)
  }

  return (
    <div className="w-full h-full rounded-xl overflow-hidden border border-white/[0.06]">
      <Editor
        height="100%"
        language={detectLanguage(filename)}
        defaultValue={initialValue}
        theme="sconfig-dark"
        onChange={handleChange}
        onMount={handleMount}
        beforeMount={handleBeforeMount}
        loading={<EditorSkeleton />}
        options={{
          readOnly,
          fontSize: 13,
          fontFamily: '"Cascadia Code", "Fira Code", "JetBrains Mono", Consolas, monospace',
          fontLigatures: true,
          lineNumbers: 'on',
          lineNumbersMinChars: 4,
          lineDecorationsWidth: 8,
          glyphMargin: true,   // needed for revert glyph
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'mouseover',
          minimap: { enabled: true, scale: 1, renderCharacters: false, maxColumn: 80 },
          scrollBeyondLastLine: false,
          wordWrap: 'off',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          renderWhitespace: 'selection',
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          bracketPairColorization: { enabled: true },
          guides: { bracketPairs: true, indentation: true, highlightActiveIndentation: true },
          suggest: { showWords: false },
          quickSuggestions: { other: true, comments: false, strings: false },
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
            useShadows: false,
            vertical: 'visible',
            horizontal: 'visible',
          },
          overviewRulerLanes: 2,
          contextmenu: true,
          mouseWheelZoom: true,
          accessibilitySupport: 'off',
        }}
      />
    </div>
  )
}
