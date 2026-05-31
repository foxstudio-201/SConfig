function indent(level) {
  return '  '.repeat(level)
}

function quoteStr(s) {
  const str = String(s ?? '')
  if (str.includes("'") && !str.includes('"')) return `"${str}"`
  if (str.includes('"')) return `'${str.replace(/'/g, "''")}'`
  return `'${str}'`
}

function formatContextMap(context) {
  if (!context?.length) return null
  const obj = {}
  context.forEach(c => {
    if (c.key && c.value) obj[c.key] = c.value
  })
  return Object.keys(obj).length ? obj : null
}

export function groupToNodes(group) {
  const nodes = []

  ;(group.parents || []).forEach(parent => {
    if (!parent) return
    nodes.push({
      key: parent.startsWith('group.') ? parent : `group.${parent}`,
      type: 'inheritance',
      value: true,
      context: [],
      expiry: null,
    })
  })

  if (group.prefix?.value) {
    nodes.push({
      key: String(group.prefix.priority ?? 100),
      type: 'prefix',
      value: group.prefix.value,
      context: [],
      expiry: null,
    })
  }

  if (group.suffix?.value) {
    nodes.push({
      key: String(group.suffix.priority ?? 100),
      type: 'suffix',
      value: group.suffix.value,
      context: [],
      expiry: null,
    })
  }

  if (group.displayName) {
    nodes.push({
      key: '0',
      type: 'display_name',
      value: group.displayName,
      context: [],
      expiry: null,
    })
  }

  if (group.weight != null && group.weight !== '') {
    nodes.push({
      key: '0',
      type: 'weight',
      value: String(group.weight),
      context: [],
      expiry: null,
    })
  }

  ;(group.meta || []).forEach(m => {
    if (!m.key) return
    nodes.push({
      key: m.key,
      type: 'meta',
      value: m.value ?? '',
      context: m.context || [],
      expiry: m.expiry ?? null,
    })
  })

  ;(group.permissions || []).forEach(p => {
    if (!p.node) return
    nodes.push({
      key: p.node,
      type: 'permission',
      value: p.value !== false,
      context: p.context || [],
      expiry: p.expiry ?? null,
    })
  })

  return nodes
}

export function nodesToGroup(name, apiGroup) {
  const group = {
    _id: `import_${name}`,
    name,
    displayName: apiGroup.displayName || name,
    weight: apiGroup.weight ?? 0,
    prefix: { value: '', priority: 100 },
    suffix: { value: '', priority: 100 },
    parents: [],
    permissions: [],
    meta: [],
  }

  const nodes = apiGroup.nodes || []
  nodes.forEach(n => {
    const ctx = (n.context || []).map(c => ({ key: c.key, value: c.value }))
    switch (n.type) {
      case 'inheritance': {
        const parent = String(n.key).replace(/^group\./, '')
        if (parent && !group.parents.includes(parent)) group.parents.push(parent)
        break
      }
      case 'prefix':
        group.prefix = { value: String(n.value ?? ''), priority: Number(n.key) || 100 }
        break
      case 'suffix':
        group.suffix = { value: String(n.value ?? ''), priority: Number(n.key) || 100 }
        break
      case 'display_name':
        group.displayName = String(n.value ?? name)
        break
      case 'weight':
        group.weight = Number(n.value) || 0
        break
      case 'meta':
        group.meta.push({ _id: `m_${n.key}`, key: n.key, value: String(n.value ?? ''), context: ctx, expiry: n.expiry ?? null })
        break
      case 'permission':
      case 'regex_permission':
      default:
        group.permissions.push({
          _id: `perm_${n.key}_${group.permissions.length}`,
          node: n.key,
          value: n.value !== false,
          context: ctx,
          expiry: n.expiry ?? null,
        })
    }
  })

  if (apiGroup.metadata) {
    if (apiGroup.metadata.prefix && !group.prefix.value) group.prefix.value = apiGroup.metadata.prefix
    if (apiGroup.metadata.suffix && !group.suffix.value) group.suffix.value = apiGroup.metadata.suffix
    if (apiGroup.metadata.meta) {
      Object.entries(apiGroup.metadata.meta).forEach(([key, value]) => {
        if (!group.meta.some(m => m.key === key)) {
          group.meta.push({ _id: `m_${key}`, key, value: String(value), context: [], expiry: null })
        }
      })
    }
  }

  return group
}

function escapeCommandArg(s) {
  return String(s).replace(/"/g, '\\"')
}

export function buildCommands(groups) {
  const lines = []
  groups.forEach(g => {
    if (!g.name) return
    lines.push(`/lp creategroup ${g.name}`)
    if (g.displayName && g.displayName !== g.name) {
      lines.push(`/lp group ${g.name} meta set display-name "${escapeCommandArg(g.displayName)}"`)
    }
    if (g.weight != null && g.weight !== '') {
      lines.push(`/lp group ${g.name} setweight ${g.weight}`)
    }
    if (g.prefix?.value) {
      lines.push(`/lp group ${g.name} meta setprefix ${g.prefix.priority ?? 100} "${escapeCommandArg(g.prefix.value)}"`)
    }
    if (g.suffix?.value) {
      lines.push(`/lp group ${g.name} meta setsuffix ${g.suffix.priority ?? 100} "${escapeCommandArg(g.suffix.value)}"`)
    }
    ;(g.parents || []).forEach(parent => {
      lines.push(`/lp group ${g.name} parent add ${parent}`)
    })
    ;(g.meta || []).forEach(m => {
      if (!m.key) return
      const ctx = formatContextArg(m.context)
      lines.push(`/lp group ${g.name} meta set ${m.key} "${escapeCommandArg(m.value)}"${ctx}`)
    })
    ;(g.permissions || []).forEach(p => {
      if (!p.node) return
      const ctx = formatContextArg(p.context)
      const val = p.value !== false ? 'true' : 'false'
      lines.push(`/lp group ${g.name} permission set ${p.node} ${val}${ctx}`)
    })
  })
  return lines.join('\n')
}

function formatContextArg(context) {
  const ctx = formatContextMap(context)
  if (!ctx) return ''
  const pairs = Object.entries(ctx).map(([k, v]) => `${k}=${v}`).join(',')
  return ` context=${pairs}`
}

function writeMetaEntry(lines, key, priority, value, level) {
  if (!value && value !== 0) return
  lines.push(`${indent(level)}${key}:`)
  lines.push(`${indent(level + 1)}'${priority}':`)
  lines.push(`${indent(level + 2)}value: ${quoteStr(value)}`)
}

export function buildExportYaml(groups) {
  const lines = ['groups:']
  groups.forEach(g => {
    if (!g.name) return
    lines.push(`${indent(1)}${g.name}:`)

    const permLines = []
    ;(g.parents || []).forEach(parent => {
      permLines.push(`${indent(3)}- group.${parent}`)
    })
    ;(g.permissions || []).forEach(p => {
      if (!p.node) return
      const ctx = formatContextMap(p.context)
      if (p.value === false || ctx || p.expiry) {
        permLines.push(`${indent(3)}- permission: ${quoteStr(p.node)}`)
        permLines.push(`${indent(4)}value: ${p.value !== false}`)
        if (ctx) {
          permLines.push(`${indent(4)}context:`)
          Object.entries(ctx).forEach(([k, v]) => {
            permLines.push(`${indent(5)}${k}: ${quoteStr(v)}`)
          })
        }
        if (p.expiry) permLines.push(`${indent(4)}expiry: ${p.expiry}`)
      } else {
        permLines.push(`${indent(3)}- ${quoteStr(p.node)}`)
      }
    })

    if (permLines.length) {
      lines.push(`${indent(2)}permissions:`)
      lines.push(...permLines)
    }

    const hasMeta = g.prefix?.value || g.suffix?.value || g.displayName || (g.weight != null && g.weight !== '') || (g.meta || []).length
    if (hasMeta) {
      lines.push(`${indent(2)}meta:`)
      if (g.prefix?.value) writeMetaEntry(lines, 'prefix', g.prefix.priority ?? 100, g.prefix.value, 3)
      if (g.suffix?.value) writeMetaEntry(lines, 'suffix', g.suffix.priority ?? 100, g.suffix.value, 3)
      if (g.displayName) writeMetaEntry(lines, 'displayname', 0, g.displayName, 3)
      if (g.weight != null && g.weight !== '') writeMetaEntry(lines, 'weight', 0, String(g.weight), 3)
      ;(g.meta || []).forEach(m => {
        if (!m.key) return
        writeMetaEntry(lines, m.key, 0, m.value, 3)
      })
    }
  })
  return lines.join('\n')
}

export function buildApiJson(groups) {
  return groups.map(g => ({
    name: g.name,
    displayName: g.displayName || g.name,
    weight: Number(g.weight) || 0,
    nodes: groupToNodes(g).map(n => ({
      key: n.key,
      type: n.type,
      value: n.value,
      context: n.context || [],
      ...(n.expiry ? { expiry: n.expiry } : {}),
    })),
    metadata: {
      meta: Object.fromEntries((g.meta || []).filter(m => m.key).map(m => [m.key, m.value])),
      prefix: g.prefix?.value || '',
      suffix: g.suffix?.value || '',
      primaryGroup: g.name,
    },
  }))
}

export function buildOutput(groups, format) {
  if (format === 'commands') return buildCommands(groups)
  if (format === 'api') return JSON.stringify(buildApiJson(groups), null, 2)
  return buildExportYaml(groups)
}

export function downloadText(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function parseSimpleYamlImport(text) {
  const groups = []
  const lines = text.split('\n')
  let i = 0
  let currentGroup = null
  let section = null
  let pendingPerm = null

  const flushGroup = () => {
    if (currentGroup) groups.push(currentGroup)
    currentGroup = null
    section = null
    pendingPerm = null
  }

  while (i < lines.length) {
    const raw = lines[i]
    const line = raw.replace(/\t/g, '  ')
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) { i++; continue }

    const groupMatch = line.match(/^ {2}([a-z0-9_-]+):\s*$/)
    if (groupMatch && !line.startsWith('    ')) {
      flushGroup()
      currentGroup = { name: groupMatch[1], permissions: [], parents: [], meta: [], prefix: { value: '', priority: 100 }, suffix: { value: '', priority: 100 }, weight: 0, displayName: groupMatch[1] }
      i++
      continue
    }

    if (!currentGroup) { i++; continue }

    if (trimmed === 'permissions:') { section = 'permissions'; i++; continue }
    if (trimmed === 'meta:') { section = 'meta'; i++; continue }

    if (section === 'permissions') {
      const simple = trimmed.match(/^- ['"]?(.+?)['"]?\s*$/)
      if (simple) {
        const node = simple[1]
        if (node.startsWith('group.')) {
          currentGroup.parents.push(node.replace(/^group\./, ''))
        } else {
          currentGroup.permissions.push({ node, value: true, context: [], expiry: null })
        }
        i++
        continue
      }
      if (trimmed.startsWith('- permission:')) {
        pendingPerm = { node: trimmed.replace(/^- permission:\s*/, '').replace(/^['"]|['"]$/g, ''), value: true, context: [], expiry: null }
        i++
        continue
      }
      if (pendingPerm) {
        if (trimmed.startsWith('value:')) pendingPerm.value = trimmed.includes('true')
        else if (trimmed.startsWith('expiry:')) pendingPerm.expiry = Number(trimmed.split(':')[1].trim())
        else if (trimmed === 'context:') {
          i++
          while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('-')) {
            const ctxLine = lines[i].trim()
            const [k, ...rest] = ctxLine.split(':')
            if (k && rest.length) pendingPerm.context.push({ key: k.trim(), value: rest.join(':').trim().replace(/^['"]|['"]$/g, '') })
            i++
          }
          currentGroup.permissions.push(pendingPerm)
          pendingPerm = null
          continue
        } else {
          currentGroup.permissions.push(pendingPerm)
          pendingPerm = null
          continue
        }
        i++
        continue
      }
    }

    if (section === 'meta') {
      const metaKeyMatch = trimmed.match(/^(prefix|suffix|displayname|weight|['"]?[\w-]+['"]?):\s*$/)
      if (metaKeyMatch) {
        const metaKey = metaKeyMatch[1].replace(/['"]/g, '')
        i++
        let priority = '100'
        let value = ''
        while (i < lines.length) {
          const ml = lines[i].trim()
          if (ml.match(/^'?\d+'?:\s*$/)) { priority = ml.replace(/['":]/g, ''); i++; continue }
          if (ml.startsWith('value:')) { value = ml.replace(/^value:\s*/, '').replace(/^['"]|['"]$/g, ''); i++; break }
          if (ml && !ml.startsWith('value:') && !ml.match(/^'?\d+'?:/)) break
          i++
        }
        if (metaKey === 'prefix') currentGroup.prefix = { value, priority: Number(priority) || 100 }
        else if (metaKey === 'suffix') currentGroup.suffix = { value, priority: Number(priority) || 100 }
        else if (metaKey === 'displayname') currentGroup.displayName = value
        else if (metaKey === 'weight') currentGroup.weight = Number(value) || 0
        else currentGroup.meta.push({ key: metaKey, value, context: [], expiry: null })
        continue
      }
    }

    i++
  }
  if (pendingPerm && currentGroup) currentGroup.permissions.push(pendingPerm)
  flushGroup()
  return groups
}

export function parseImportYaml(text) {
  const trimmed = text.trim()
  if (!trimmed) return []
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const data = JSON.parse(trimmed)
    const arr = Array.isArray(data) ? data : [data]
    return arr.map(g => nodesToGroup(g.name, g))
  }
  const parsed = parseSimpleYamlImport(trimmed)
  return parsed.map((g, idx) => ({
    _id: `import_${idx}_${g.name}`,
    name: g.name,
    displayName: g.displayName || g.name,
    weight: g.weight ?? 0,
    prefix: g.prefix || { value: '', priority: 100 },
    suffix: g.suffix || { value: '', priority: 100 },
    parents: g.parents || [],
    permissions: (g.permissions || []).map((p, pi) => ({
      _id: `perm_${pi}`,
      node: p.node,
      value: p.value !== false,
      context: p.context || [],
      expiry: p.expiry ?? null,
    })),
    meta: (g.meta || []).map((m, mi) => ({ _id: `meta_${mi}`, ...m })),
  }))
}

export async function luckPermsRequest(baseUrl, apiKey, method, path, body) {
  const api = window.sconfigAPI
  if (api?.luckPermsRequest) {
    return api.luckPermsRequest({ baseUrl, apiKey, method, path, body })
  }
  const url = `${baseUrl.replace(/\/$/, '')}${path}`
  const headers = { Accept: 'application/json', 'Content-Type': 'application/json' }
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  const res = await fetch(url, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  return { ok: res.ok, status: res.status, data, error: res.ok ? null : (data?.message || text || res.statusText) }
}

export async function pullFromLuckPerms(baseUrl, apiKey) {
  const listRes = await luckPermsRequest(baseUrl, apiKey, 'GET', '/group')
  if (!listRes.ok) throw new Error(listRes.error || `HTTP ${listRes.status}`)
  const names = listRes.data || []
  const groups = []
  for (const name of names) {
    const res = await luckPermsRequest(baseUrl, apiKey, 'GET', `/group/${name}`)
    if (res.ok && res.data) groups.push(nodesToGroup(name, res.data))
  }
  return groups
}

export async function pushToLuckPerms(baseUrl, apiKey, groups) {
  const results = []
  for (const g of groups) {
    if (!g.name) continue
    const existing = await luckPermsRequest(baseUrl, apiKey, 'GET', `/group/${g.name}`)
    if (existing.status === 404) {
      const create = await luckPermsRequest(baseUrl, apiKey, 'POST', '/group', { name: g.name })
      if (!create.ok) {
        results.push({ name: g.name, ok: false, error: create.error })
        continue
      }
    }
    const nodes = groupToNodes(g).map(n => ({
      key: n.key,
      type: n.type,
      value: n.value,
      context: n.context || [],
      ...(n.expiry ? { expiry: n.expiry } : {}),
    }))
    const setRes = await luckPermsRequest(baseUrl, apiKey, 'PUT', `/group/${g.name}/nodes`, nodes)
    results.push({ name: g.name, ok: setRes.ok, error: setRes.error })
  }
  return results
}

export async function testLuckPermsConnection(baseUrl, apiKey) {
  const res = await luckPermsRequest(baseUrl, apiKey, 'GET', '/group')
  return { ok: res.ok, status: res.status, count: Array.isArray(res.data) ? res.data.length : 0, error: res.error }
}
