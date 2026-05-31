/** @typedef {'error'|'warning'|'info'} YamlSeverity */
/** @typedef {{ line: number, severity: YamlSeverity, key: string, params?: Record<string, string|number> }} YamlIssue */

const KEY_LINE_RE = /^(\s*)(?:-\s+)?([^:#\s][^:]*?)\s*:\s*(.*)$/
const LIST_ITEM_RE = /^(\s*)-\s+(.*)$/

/**
 * Validate Minecraft plugin YAML with structural heuristics.
 * @param {string} text
 * @returns {YamlIssue[]}
 */
export function validateYaml(text) {
  if (!text?.trim()) return []

  const issues = /** @type {YamlIssue[]} */ ([])
  const lines = text.split('\n')

  /** @type {{ indent: number, keys: Set<string> }[]} */
  const stack = [{ indent: -1, keys: new Set() }]

  lines.forEach((raw, index) => {
    const line = index + 1
    const trimmedEnd = raw.trimEnd()
    const trimmed = raw.trimStart()
    const indent = raw.length - trimmed.length

    if (trimmed === '' || trimmed.startsWith('#')) return

    if (raw.includes('\t')) {
      issues.push({ line, severity: 'error', key: 'errTab' })
    }

    if (raw !== trimmedEnd && trimmed !== '') {
      issues.push({ line, severity: 'warning', key: 'warnTrailingSpace' })
    }

    if (indent % 2 !== 0) {
      issues.push({ line, severity: 'warning', key: 'warnOddIndent', params: { indent } })
    }

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
      stack.pop()
    }

    const parent = stack[stack.length - 1]
    const indentJump = indent - (parent?.indent ?? -1)
    if (indentJump > 2 && parent && parent.indent >= 0) {
      issues.push({
        line,
        severity: 'error',
        key: 'errIndentJump',
        params: { from: parent.indent, to: indent },
      })
    }

    if ((trimmed.match(/'/g) ?? []).length % 2 !== 0) {
      issues.push({ line, severity: 'error', key: 'errUnmatchedSingleQuote' })
    }
    if ((trimmed.match(/"/g) ?? []).length % 2 !== 0) {
      issues.push({ line, severity: 'error', key: 'errUnmatchedDoubleQuote' })
    }

    if (/\S\s+:/.test(trimmed) && !trimmed.startsWith('-')) {
      issues.push({ line, severity: 'error', key: 'errSpaceBeforeColon' })
    }

    const listMatch = trimmed.match(LIST_ITEM_RE)
    if (listMatch) {
      const item = listMatch[2]
      if (item.includes(':') && !item.startsWith('"') && !item.startsWith("'")) {
        const subKey = item.split(':')[0]
        if (subKey.includes(' ')) {
          issues.push({ line, severity: 'warning', key: 'warnListInlineKey' })
        }
      }
      return
    }

    const keyMatch = trimmed.match(KEY_LINE_RE)
    if (keyMatch) {
      const key = keyMatch[2].trim()
      const value = keyMatch[3]

      if (!key) {
        issues.push({ line, severity: 'error', key: 'errEmptyKey' })
      } else if (parent.keys.has(key)) {
        issues.push({ line, severity: 'error', key: 'errDuplicateKey', params: { key } })
      } else {
        parent.keys.add(key)
      }

      if (value === '' && indent >= 0) {
        stack.push({ indent, keys: new Set() })
      }

      if (value && !value.startsWith('#')) {
        const unquoted = !/^['"]/.test(value) && !/^\[/.test(value) && value !== '|' && value !== '>' && value !== '|+' && value !== '|-'
        if (unquoted && /[#{}[\],&*!|>'"%@`]/.test(value)) {
          issues.push({ line, severity: 'warning', key: 'warnSpecialChars', params: { value: value.slice(0, 24) } })
        }
        if (unquoted && /:\s/.test(value)) {
          issues.push({ line, severity: 'warning', key: 'warnColonInValue' })
        }
      }
      return
    }

    if (/^\s*-\s*$/.test(raw)) {
      issues.push({ line, severity: 'warning', key: 'warnEmptyListItem' })
    }
  })

  return issues.sort((a, b) => a.line - b.line || severityRank(b.severity) - severityRank(a.severity))
}

function severityRank(s) {
  return s === 'error' ? 3 : s === 'warning' ? 2 : 1
}

export function summarizeIssues(issues) {
  const errors = issues.filter(i => i.severity === 'error').length
  const warnings = issues.filter(i => i.severity === 'warning').length
  const infos = issues.filter(i => i.severity === 'info').length
  return { errors, warnings, infos, total: issues.length }
}

export function countStats(text) {
  const lines = text.split('\n')
  const nonEmpty = lines.filter(l => l.trim() && !l.trim().startsWith('#')).length
  const comments = lines.filter(l => l.trim().startsWith('#')).length
  return { lines: lines.length, nonEmpty, comments, chars: text.length }
}

export const SAMPLE_PRESETS = [
  {
    id: 'valid',
    labelKey: 'sampleValid',
    text: `# Plugin config — valid example
enabled: true
server-name: FoxNetwork

database:
  host: 127.0.0.1
  port: 3306
  username: root
  password: ""

features:
  - tablist
  - scoreboard
  - nametags
`,
  },
  {
    id: 'errors',
    labelKey: 'sampleErrors',
    text: `# Common mistakes
enabled: true
server name: Broken
\tbad-tab: true
duplicate: one
duplicate: two
unclosed: 'missing quote
  jump-too-far:
    nested: value
`,
  },
]
