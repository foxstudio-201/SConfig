import { ALL_LOG_FIELDS, ROLLBACK_FIELDS, createProfileState } from './coreProtectData'

function formatBool(v) {
  return v ? 'true' : 'false'
}

function section(lines, title) {
  lines.push('')
  lines.push(`# ${title}`)
}

export function getProfileFileName(profile) {
  if (profile.profileType === 'world' && profile.worldName) {
    return `${profile.worldName.trim()}.yml`
  }
  return 'config.yml'
}

export function buildConfigYaml(profile) {
  const lines = ['# CoreProtect Config']
  const isWorld = profile.profileType === 'world'
  const minimal = isWorld && profile.worldOverrideMinimal
  const defaults = createProfileState({})

  if (!minimal) {
    section(lines, 'General')
    lines.push(`verbose: ${formatBool(profile.verbose)}`)
    lines.push(`check-updates: ${formatBool(profile.checkUpdates)}`)
    lines.push(`api-enabled: ${formatBool(profile.apiEnabled)}`)
    lines.push(`default-radius: ${profile.defaultRadius ?? 10}`)
    lines.push(`max-radius: ${profile.maxRadius ?? 100}`)

    if (!isWorld) {
      section(lines, 'MySQL Database')
      lines.push(`use-mysql: ${formatBool(profile.useMysql)}`)
      lines.push(`table-prefix: ${profile.tablePrefix || 'co_'}`)
      lines.push(`mysql-host: ${profile.mysqlHost || '127.0.0.1'}`)
      lines.push(`mysql-port: ${profile.mysqlPort ?? 3306}`)
      lines.push(`mysql-database: ${profile.mysqlDatabase || 'database'}`)
      lines.push(`mysql-username: ${profile.mysqlUsername || 'root'}`)
      lines.push(`mysql-password: ${profile.mysqlPassword || ''}`)
    }

    section(lines, 'Rollback')
    ROLLBACK_FIELDS.forEach(opt => {
      lines.push(`${opt.key}: ${formatBool(profile[opt.field])}`)
    })

    section(lines, 'Logging')
    ALL_LOG_FIELDS.forEach(opt => {
      lines.push(`${opt.key}: ${formatBool(profile[opt.field])}`)
    })
  } else {
    section(lines, 'World override')
    ROLLBACK_FIELDS.forEach(opt => {
      if (profile[opt.field] !== defaults[opt.field]) {
        lines.push(`${opt.key}: ${formatBool(profile[opt.field])}`)
      }
    })
    ALL_LOG_FIELDS.forEach(opt => {
      if (profile[opt.field] !== defaults[opt.field]) {
        lines.push(`${opt.key}: ${formatBool(profile[opt.field])}`)
      }
    })
  }

  if (profile.extraYaml?.trim()) {
    lines.push('')
    lines.push(profile.extraYaml.trim())
  }

  return lines.join('\n').replace(/^\n/, '')
}

export function buildBlacklistText(entries) {
  const typeComments = {
    user: 'User',
    command: 'Command',
    block: 'Block',
    entity: 'Entity',
    filter: 'Filter',
  }
  return (entries || [])
    .filter(e => e.value?.trim())
    .map(e => `${e.value.trim()} ; ${typeComments[e.type] || e.type}`)
    .join('\n')
}

export function buildProjectYaml(profiles) {
  if (profiles.length === 1) return buildConfigYaml(profiles[0])
  return profiles.map(p => {
    const name = getProfileFileName(p)
    return `# --- ${name} ---\n${buildConfigYaml(p)}`
  }).join('\n\n')
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
