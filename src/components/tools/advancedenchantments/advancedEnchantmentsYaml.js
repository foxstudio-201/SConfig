function yamlQuote(str) {
  if (str == null) return "''"
  const s = String(str)
  if (s.includes("'")) return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  return `'${s}'`
}

function yamlBool(v) {
  return v ? 'true' : 'false'
}

export function buildEnchantmentYaml(state) {
  const lines = []
  const name = (state.name || 'my_enchantment').toLowerCase().replace(/\s+/g, '_')

  lines.push(`${name}:`)
  lines.push(`  display: ${yamlQuote(state.display || '')}`)
  lines.push(`  description: ${yamlQuote(state.description || '')}`)
  lines.push(`  applies-to: ${yamlQuote(state.appliesTo || '')}`)
  lines.push(`  type: ${yamlQuote(state.type || 'ATTACK')}`)
  lines.push(`  group: ${state.group || 'SIMPLE'}`)

  // applies
  if (state.applies?.length) {
    lines.push('  applies:')
    state.applies.forEach(mat => {
      lines.push(`    - ${mat}`)
    })
  }

  // settings
  const s = state.settings || {}
  lines.push('  settings:')
  lines.push(`    showActionBar: ${yamlBool(s.showActionBar)}`)
  lines.push(`    removeable: ${yamlBool(s.removeable !== false)}`)
  lines.push(`    disableInEnchanter: ${yamlBool(s.disableInEnchanter)}`)

  if (s.disabledWorlds?.length) {
    lines.push('    disabledWorlds:')
    s.disabledWorlds.forEach(w => lines.push(`      - ${yamlQuote(w)}`))
  }
  if (s.requiredEnchants?.length) {
    lines.push('    requiredEnchants:')
    s.requiredEnchants.forEach(e => lines.push(`      - ${yamlQuote(e)}`))
  }
  if (s.notApplyableWith?.length) {
    lines.push('    notApplyableWith:')
    s.notApplyableWith.forEach(e => lines.push(`      - ${yamlQuote(e)}`))
  }
  if (s.removedEnchants?.length) {
    lines.push('    removedEnchants:')
    s.removedEnchants.forEach(e => lines.push(`      - ${yamlQuote(e)}`))
  }

  // levels
  if (state.levels?.length) {
    lines.push('  levels:')
    state.levels.forEach(lvl => {
      lines.push(`    '${lvl.level}':`)
      lines.push(`      chance: ${lvl.chance ?? 20}`)
      lines.push(`      cooldown: ${lvl.cooldown ?? 5}`)
      if (lvl.effects?.length) {
        lines.push('      effects:')
        lvl.effects.forEach(eff => {
          lines.push(`        - ${yamlQuote(eff)}`)
        })
      }
      if (lvl.conditions?.length) {
        lines.push('      conditions:')
        lvl.conditions.forEach(cond => {
          lines.push(`        - ${yamlQuote(cond)}`)
        })
      }
    })
  }

  return lines.join('\n') + '\n'
}

export function downloadYaml(content, filename) {
  const blob = new Blob([content], { type: 'text/yaml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'enchantment.yml'
  a.click()
  URL.revokeObjectURL(url)
}
