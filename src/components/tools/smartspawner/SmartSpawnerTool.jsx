import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ArrowLeftIcon, ClipboardDocumentIcon, CheckCircleIcon, ArrowDownTrayIcon,
  PlusIcon, TrashIcon, MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import CustomDropdown from '../../CustomDropdown'
import SmartSpawnerChipVisual from './SmartSpawnerChipVisual'
import {
  CONFIG_SECTIONS, CONFIG_PRESETS, LOG_EVENTS,
  LANGUAGE_OPTIONS, GUI_LAYOUT_OPTIONS, CURRENCY_OPTIONS, PRICE_SOURCE_OPTIONS,
  SHOP_PLUGIN_OPTIONS, DB_MODE_OPTIONS, HOLOGRAM_ALIGN_OPTIONS,
  createSmartSpawnerState, applyConfigPreset, getMobIds, getMobsWithLoot,
  emptyLootEntry, emptyMob,
} from './smartSpawnerData'
import {
  buildConfigYaml, buildItemPricesYaml, buildSpawnersSettingsYaml, downloadText,
} from './smartSpawnerYaml'
import { useI18n } from '../../../context/I18nContext'

const PRESET_I18N = { balanced: 'presetBalanced', performance: 'presetPerformance', economy: 'presetEconomy' }
const PRESET_SUMMARY_I18N = {
  balanced: 'presetSummaryBalanced',
  performance: 'presetSummaryPerformance',
  economy: 'presetSummaryEconomy',
}
const SECTION_DESC = {
  general: 'descGeneral', spawner: 'descSpawner', break: 'descBreak', economy: 'descEconomy',
  hopper: 'descHopper', bedrock: 'descBedrock', visual: 'descVisual', logging: 'descLogging',
  database: 'descDatabase', performance: 'descPerformance',
}

const inputCls = 'w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-emerald-500/35 transition-colors'
const inputMono = `${inputCls} font-mono text-xs`
const labelCls = 'text-[10px] text-white/30 uppercase tracking-wider mb-1 block'
const btnCls = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition-all'
const sectionCls = 'rounded-2xl bg-black/40 border border-white/[0.06] p-4 flex flex-col gap-3'
const sectionHead = 'text-[10px] text-white/30 uppercase tracking-widest font-semibold'

function SectionTitle({ children }) { return <p className={sectionHead}>{children}</p> }
function Field({ label, children, hint }) {
  return (
    <div>
      {label && <label className={labelCls}>{label}</label>}
      {children}
      {hint && <p className="text-[10px] text-white/25 mt-1">{hint}</p>}
    </div>
  )
}
function Block({ title, children }) {
  return (
    <div className="rounded-xl border border-emerald-500/12 bg-gradient-to-b from-emerald-500/[0.05] to-transparent p-3 flex flex-col gap-2.5">
      {title && <p className="text-[11px] font-semibold text-emerald-200/85">{title}</p>}
      {children}
    </div>
  )
}
function Toggle({ label, value, onChange, desc }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all w-full ${
        value ? 'border-emerald-500/35 bg-emerald-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
      }`}>
      <span className={`relative w-9 h-5 rounded-full border flex-shrink-0 flex items-center transition-all ${value ? 'bg-emerald-500/40 border-emerald-500/50' : 'bg-white/[0.06] border-white/[0.12]'}`}>
        <span className={`block w-3.5 h-3.5 rounded-full bg-white/90 shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="text-[11px] font-semibold text-white/80 block">{label}</span>
        {desc && <span className="text-[10px] text-white/35 block mt-0.5">{desc}</span>}
      </span>
    </button>
  )
}
function NumInput({ value, onChange }) {
  return <input type="text" className={inputCls} value={value} onChange={e => onChange(e.target.value)} />
}
function SectionHeader({ t, id }) {
  const sec = CONFIG_SECTIONS.find(s => s.id === id)
  if (!sec) return null
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-3 py-2 mb-1">
      <p className="text-xs font-semibold text-emerald-200/90">{t(`smartSpawner.${sec.labelKey}`)}</p>
      <p className="text-[10px] text-white/35 mt-0.5">{t(`smartSpawner.${SECTION_DESC[id]}`)}</p>
    </div>
  )
}

function GeneralSection({ t, s, set }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="general" />
      <Block title={t('smartSpawner.fieldLanguage')}>
        <CustomDropdown label="" value={s.language} onChange={v => set({ language: v })}
          options={LANGUAGE_OPTIONS.map(x => ({ value: x, label: x }))} accent="indigo" className="w-full" />
        <Field label={t('smartSpawner.fieldGuiLayout')}>
          <CustomDropdown label="" value={s.guiLayout} onChange={v => set({ guiLayout: v })}
            options={GUI_LAYOUT_OPTIONS.map(x => ({ value: x, label: x }))} accent="indigo" className="w-full" />
        </Field>
        <Toggle label={t('smartSpawner.toggleDebug')} value={s.debug} onChange={v => set({ debug: v })} />
      </Block>
    </div>
  )
}

function SpawnerSection({ t, s, set }) {
  const p = (k, v) => set({ spawnerProperties: { ...s.spawnerProperties, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="spawner" />
      <Block title={t('smartSpawner.blockSpawnParams')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('smartSpawner.fieldMinMobs')}><NumInput value={s.spawnerProperties.minMobs} onChange={v => p('minMobs', v)} /></Field>
          <Field label={t('smartSpawner.fieldMaxMobs')}><NumInput value={s.spawnerProperties.maxMobs} onChange={v => p('maxMobs', v)} /></Field>
          <Field label={t('smartSpawner.fieldRange')}><NumInput value={s.spawnerProperties.range} onChange={v => p('range', v)} /></Field>
          <Field label={t('smartSpawner.fieldDelay')} hint={t('smartSpawner.hintTime')}><NumInput value={s.spawnerProperties.delay} onChange={v => p('delay', v)} /></Field>
        </div>
      </Block>
      <Block title={t('smartSpawner.blockStorage')}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('smartSpawner.fieldMaxPages')}><NumInput value={s.spawnerProperties.maxStoragePages} onChange={v => p('maxStoragePages', v)} /></Field>
          <Field label={t('smartSpawner.fieldMaxExp')}><NumInput value={s.spawnerProperties.maxStoredExp} onChange={v => p('maxStoredExp', v)} /></Field>
          <Field label={t('smartSpawner.fieldMaxStack')}><NumInput value={s.spawnerProperties.maxStackSize} onChange={v => p('maxStackSize', v)} /></Field>
        </div>
        <Toggle label={t('smartSpawner.toggleExpMending')} value={s.spawnerProperties.allowExpMending} onChange={v => p('allowExpMending', v)} />
        <Toggle label={t('smartSpawner.toggleProtectExplosion')} value={s.spawnerProperties.protectFromExplosions} onChange={v => p('protectFromExplosions', v)} />
      </Block>
    </div>
  )
}

function BreakSection({ t, s, set }) {
  const b = (k, v) => set({ spawnerBreak: { ...s.spawnerBreak, [k]: v } })
  const sk = (k, v) => set({ spawnerBreak: { ...s.spawnerBreak, silkTouch: { ...s.spawnerBreak.silkTouch, [k]: v } } })
  const n = (k, v) => set({ naturalSpawner: { ...s.naturalSpawner, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="break" />
      <Block title={t('smartSpawner.blockBreak')}>
        <Toggle label={t('smartSpawner.toggleBreakEnabled')} value={s.spawnerBreak.enabled} onChange={v => b('enabled', v)} />
        <Toggle label={t('smartSpawner.toggleDirectInv')} value={s.spawnerBreak.directToInventory} onChange={v => b('directToInventory', v)} />
        <Field label={t('smartSpawner.fieldRequiredTools')}>
          <textarea className={`${inputMono} min-h-[80px]`} value={(s.spawnerBreak.requiredTools || []).join('\n')}
            onChange={e => b('requiredTools', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))} />
        </Field>
        <Field label={t('smartSpawner.fieldDurabilityLoss')}><NumInput value={s.spawnerBreak.durabilityLoss} onChange={v => b('durabilityLoss', v)} /></Field>
        <Toggle label={t('smartSpawner.toggleAutoSellBreak')} value={s.spawnerBreak.autoSellAndClaimExpOnBreak} onChange={v => b('autoSellAndClaimExpOnBreak', v)} />
        <div className="grid grid-cols-2 gap-2">
          <Toggle label={t('smartSpawner.fieldSilkRequired')} value={s.spawnerBreak.silkTouch.required} onChange={v => sk('required', v)} />
          <Field label={t('smartSpawner.fieldSilkLevel')}><NumInput value={s.spawnerBreak.silkTouch.level} onChange={v => sk('level', v)} /></Field>
        </div>
      </Block>
      <Block title={t('smartSpawner.blockNatural')}>
        <Toggle label={t('smartSpawner.toggleNaturalBreak')} value={s.naturalSpawner.breakable} onChange={v => n('breakable', v)} />
        <Toggle label={t('smartSpawner.toggleConvertSmart')} value={s.naturalSpawner.convertToSmartSpawner} onChange={v => n('convertToSmartSpawner', v)} />
        <Toggle label={t('smartSpawner.toggleNaturalSpawn')} value={s.naturalSpawner.spawnMobs} onChange={v => n('spawnMobs', v)} />
        <Toggle label={t('smartSpawner.toggleNaturalProtect')} value={s.naturalSpawner.protectFromExplosions} onChange={v => n('protectFromExplosions', v)} />
      </Block>
    </div>
  )
}

function EconomySection({ t, s, set }) {
  const e = (k, v) => set({ sellIntegration: { ...s.sellIntegration, [k]: v } })
  const sh = (k, v) => set({ sellIntegration: { ...s.sellIntegration, shopIntegration: { ...s.sellIntegration.shopIntegration, [k]: v } } })
  const cp = (k, v) => set({ sellIntegration: { ...s.sellIntegration, customPrices: { ...s.sellIntegration.customPrices, [k]: v } } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="economy" />
      <Block title={t('smartSpawner.blockSell')}>
        <Toggle label={t('smartSpawner.toggleSellEnabled')} value={s.sellIntegration.enabled} onChange={v => e('enabled', v)} />
        <Field label={t('smartSpawner.fieldCurrency')}>
          <CustomDropdown label="" value={s.sellIntegration.currency} onChange={v => e('currency', v)}
            options={CURRENCY_OPTIONS.map(x => ({ value: x, label: x }))} accent="indigo" className="w-full" />
        </Field>
        <Field label={t('smartSpawner.fieldEcoCurrency')}><input className={inputCls} value={s.sellIntegration.excellenteconomyCurrency} onChange={ev => e('excellenteconomyCurrency', ev.target.value)} /></Field>
        <Field label={t('smartSpawner.fieldPriceMode')}>
          <CustomDropdown label="" value={s.sellIntegration.priceSourceMode} onChange={v => e('priceSourceMode', v)}
            options={PRICE_SOURCE_OPTIONS.map(x => ({ value: x, label: x }))} accent="indigo" className="w-full" />
        </Field>
        <Toggle label={t('smartSpawner.toggleShopIntegration')} value={s.sellIntegration.shopIntegration.enabled} onChange={v => sh('enabled', v)} />
        <Field label={t('smartSpawner.fieldShopPlugin')}>
          <CustomDropdown label="" value={s.sellIntegration.shopIntegration.preferredPlugin} onChange={v => sh('preferredPlugin', v)}
            options={SHOP_PLUGIN_OPTIONS.map(x => ({ value: x, label: x }))} accent="indigo" className="w-full" />
        </Field>
        <Toggle label={t('smartSpawner.toggleCustomPrices')} value={s.sellIntegration.customPrices.enabled} onChange={v => cp('enabled', v)} />
        <Field label={t('smartSpawner.fieldDefaultPrice')}><NumInput value={s.sellIntegration.customPrices.defaultPrice} onChange={v => cp('defaultPrice', v)} /></Field>
      </Block>
    </div>
  )
}

function HopperSection({ t, s, set }) {
  const h = (k, v) => set({ hopper: { ...s.hopper, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="hopper" />
      <Block title={t('smartSpawner.blockHopper')}>
        <Toggle label={t('smartSpawner.toggleHopper')} value={s.hopper.enabled} onChange={v => h('enabled', v)} />
        <Field label={t('smartSpawner.fieldHopperDelay')} hint={t('smartSpawner.hintTime')}><NumInput value={s.hopper.checkDelay} onChange={v => h('checkDelay', v)} /></Field>
        <Field label={t('smartSpawner.fieldHopperStacks')}><NumInput value={s.hopper.stackPerTransfer} onChange={v => h('stackPerTransfer', v)} /></Field>
      </Block>
    </div>
  )
}

function BedrockSection({ t, s, set }) {
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="bedrock" />
      <Block title={t('smartSpawner.blockBedrock')}>
        <Toggle label={t('smartSpawner.toggleFormUi')} value={s.bedrockSupport.enableFormui} onChange={v => set({ bedrockSupport: { enableFormui: v } })} />
      </Block>
    </div>
  )
}

function VisualSection({ t, s, set }) {
  const h = (k, v) => set({ hologram: { ...s.hologram, [k]: v } })
  const pt = (k, v) => set({ particle: { ...s.particle, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="visual" />
      <Block title={t('smartSpawner.blockHologram')}>
        <Toggle label={t('smartSpawner.toggleHologram')} value={s.hologram.enabled} onChange={v => h('enabled', v)} />
        <div className="grid grid-cols-3 gap-2">
          <Field label={t('smartSpawner.fieldOffsetX')}><NumInput value={s.hologram.offsetX} onChange={v => h('offsetX', v)} /></Field>
          <Field label={t('smartSpawner.fieldOffsetY')}><NumInput value={s.hologram.offsetY} onChange={v => h('offsetY', v)} /></Field>
          <Field label={t('smartSpawner.fieldOffsetZ')}><NumInput value={s.hologram.offsetZ} onChange={v => h('offsetZ', v)} /></Field>
        </div>
        <Field label={t('smartSpawner.fieldAlignment')}>
          <CustomDropdown label="" value={s.hologram.alignment} onChange={v => h('alignment', v)}
            options={HOLOGRAM_ALIGN_OPTIONS.map(x => ({ value: x, label: x }))} accent="indigo" className="w-full" />
        </Field>
        <Toggle label={t('smartSpawner.toggleShadow')} value={s.hologram.shadowedText} onChange={v => h('shadowedText', v)} />
        <Toggle label={t('smartSpawner.toggleSeeThrough')} value={s.hologram.seeThrough} onChange={v => h('seeThrough', v)} />
        <Toggle label={t('smartSpawner.toggleTransparentBg')} value={s.hologram.transparentBackground} onChange={v => h('transparentBackground', v)} />
      </Block>
      <Block title={t('smartSpawner.blockParticles')}>
        <Toggle label={t('smartSpawner.toggleParticleStack')} value={s.particle.spawnerStack} onChange={v => pt('spawnerStack', v)} />
        <Toggle label={t('smartSpawner.toggleParticleActivate')} value={s.particle.spawnerActivate} onChange={v => pt('spawnerActivate', v)} />
        <Toggle label={t('smartSpawner.toggleParticleLoot')} value={s.particle.spawnerGenerateLoot} onChange={v => pt('spawnerGenerateLoot', v)} />
      </Block>
    </div>
  )
}

function LoggingSection({ t, s, set }) {
  const l = (k, v) => set({ logging: { ...s.logging, [k]: v } })
  const toggleEvent = (ev) => {
    const list = s.logging.loggedEvents || []
    l('loggedEvents', list.includes(ev) ? list.filter(x => x !== ev) : [...list, ev])
  }
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="logging" />
      <Block title={t('smartSpawner.blockLog')}>
        <Toggle label={t('smartSpawner.toggleLogEnabled')} value={s.logging.enabled} onChange={v => l('enabled', v)} />
        <Toggle label={t('smartSpawner.toggleJsonLog')} value={s.logging.jsonFormat} onChange={v => l('jsonFormat', v)} />
        <Toggle label={t('smartSpawner.toggleConsoleLog')} value={s.logging.consoleOutput} onChange={v => l('consoleOutput', v)} />
        <div className="grid grid-cols-2 gap-2">
          <Field label={t('smartSpawner.fieldMaxLogFiles')}><NumInput value={s.logging.maxLogFiles} onChange={v => l('maxLogFiles', v)} /></Field>
          <Field label={t('smartSpawner.fieldMaxLogMb')}><NumInput value={s.logging.maxLogSizeMb} onChange={v => l('maxLogSizeMb', v)} /></Field>
        </div>
        <Toggle label={t('smartSpawner.toggleLogAll')} value={s.logging.logAllEvents} onChange={v => l('logAllEvents', v)} />
        {!s.logging.logAllEvents && (
          <div className="flex flex-wrap gap-1 max-h-40 overflow-y-auto custom-dropdown-scroll">
            {LOG_EVENTS.map(ev => (
              <button key={ev} type="button" onClick={() => toggleEvent(ev)}
                className={`text-[9px] px-1.5 py-0.5 rounded border font-mono transition-all ${
                  (s.logging.loggedEvents || []).includes(ev)
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-200'
                    : 'border-white/[0.08] text-white/40 hover:bg-white/[0.04]'
                }`}>{ev}</button>
            ))}
          </div>
        )}
      </Block>
    </div>
  )
}

function DatabaseSection({ t, s, set }) {
  const d = (k, v) => set({ database: { ...s.database, [k]: v } })
  const sq = (k, v) => set({ database: { ...s.database, sqlite: { ...s.database.sqlite, [k]: v } } })
  const sql = (k, v) => set({ database: { ...s.database, sql: { ...s.database.sql, [k]: v } } })
  const pool = (k, v) => set({ database: { ...s.database, sql: { ...s.database.sql, pool: { ...s.database.sql.pool, [k]: v } } } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="database" />
      <Block title={t('smartSpawner.blockDatabase')}>
        <Field label={t('smartSpawner.fieldDbMode')}>
          <CustomDropdown label="" value={s.database.mode} onChange={v => d('mode', v)}
            options={DB_MODE_OPTIONS.map(x => ({ value: x, label: x }))} accent="indigo" className="w-full" />
        </Field>
        <Field label={t('smartSpawner.fieldServerName')}><input className={inputCls} value={s.database.serverName} onChange={e => d('serverName', e.target.value)} /></Field>
        <Toggle label={t('smartSpawner.toggleSyncServers')} value={s.database.syncAcrossServers} onChange={v => d('syncAcrossServers', v)} />
        <Toggle label={t('smartSpawner.toggleMigrate')} value={s.database.migrateFromLocal} onChange={v => d('migrateFromLocal', v)} />
        {s.database.mode === 'MYSQL' && (
          <>
            <Field label={t('smartSpawner.fieldDbName')}><input className={inputCls} value={s.database.database} onChange={e => d('database', e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t('smartSpawner.fieldSqlHost')}><input className={inputCls} value={s.database.sql.host} onChange={e => sql('host', e.target.value)} /></Field>
              <Field label={t('smartSpawner.fieldSqlPort')}><NumInput value={s.database.sql.port} onChange={v => sql('port', v)} /></Field>
              <Field label={t('smartSpawner.fieldSqlUser')}><input className={inputCls} value={s.database.sql.username} onChange={e => sql('username', e.target.value)} /></Field>
              <Field label={t('smartSpawner.fieldSqlPass')}><input className={inputCls} type="password" value={s.database.sql.password} onChange={e => sql('password', e.target.value)} /></Field>
            </div>
          </>
        )}
        {s.database.mode === 'SQLITE' && (
          <Field label={t('smartSpawner.fieldSqliteFile')}><input className={inputCls} value={s.database.sqlite.file} onChange={e => sq('file', e.target.value)} /></Field>
        )}
      </Block>
      {s.database.mode === 'MYSQL' && (
        <Block title={t('smartSpawner.blockPool')}>
          <div className="grid grid-cols-2 gap-2">
            <Field label={t('smartSpawner.fieldPoolMax')}><NumInput value={s.database.sql.pool.maximumSize} onChange={v => pool('maximumSize', v)} /></Field>
            <Field label={t('smartSpawner.fieldPoolMin')}><NumInput value={s.database.sql.pool.minimumIdle} onChange={v => pool('minimumIdle', v)} /></Field>
          </div>
        </Block>
      )}
    </div>
  )
}

function PerformanceSection({ t, s, set }) {
  const p = (k, v) => set({ performance: { ...s.performance, [k]: v } })
  return (
    <div className="flex flex-col gap-3">
      <SectionHeader t={t} id="performance" />
      <Block title={t('smartSpawner.blockPerf')}>
        <Toggle label={t('smartSpawner.toggleApproxLoot')} value={s.performance.approximateLoot} onChange={v => p('approximateLoot', v)} />
        <Field label={t('smartSpawner.fieldApproxThreshold')} hint={t('smartSpawner.hintApprox')}>
          <NumInput value={s.performance.approximationThreshold} onChange={v => p('approximationThreshold', v)} />
        </Field>
      </Block>
    </div>
  )
}

const CONFIG_SECTION_COMPONENTS = {
  general: GeneralSection,
  spawner: SpawnerSection,
  break: BreakSection,
  economy: EconomySection,
  hopper: HopperSection,
  bedrock: BedrockSection,
  visual: VisualSection,
  logging: LoggingSection,
  database: DatabaseSection,
  performance: PerformanceSection,
}

function MobEditor({ t, s, set, mobId }) {
  const mob = s.spawnersSettings.mobs[mobId]
  if (!mob) return null
  const patchMob = (p) => set({
    spawnersSettings: {
      ...s.spawnersSettings,
      mobs: { ...s.spawnersSettings.mobs, [mobId]: { ...mob, ...p } },
    },
  })
  const patchLoot = (itemId, p) => patchMob({ loot: { ...mob.loot, [itemId]: { ...mob.loot[itemId], ...p } } })
  const addLoot = () => {
    const id = `NEW_ITEM_${Object.keys(mob.loot || {}).length + 1}`
    patchMob({ loot: { ...mob.loot, [id]: emptyLootEntry() } })
  }
  const removeLoot = (itemId) => {
    const next = { ...mob.loot }
    delete next[itemId]
    patchMob({ loot: next })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-3 py-2">
        <p className="text-sm font-mono font-bold text-emerald-200">{mobId}</p>
        <p className="text-[10px] text-white/35">{Object.keys(mob.loot || {}).length} drops · XP {mob.experience}</p>
      </div>
      <Field label={t('smartSpawner.fieldMobXp')}><NumInput value={mob.experience} onChange={v => patchMob({ experience: Number(v) || 0 })} /></Field>
      <Block title={t('smartSpawner.blockMobLoot')}>
        <button type="button" onClick={addLoot} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300 self-start`}>
          <PlusIcon className="w-3.5 h-3.5" />{t('smartSpawner.addLoot')}
        </button>
        {Object.entries(mob.loot || {}).map(([itemId, drop]) => (
          <div key={itemId} className="rounded-lg border border-white/[0.08] p-2.5 flex flex-col gap-2">
            <Field label={t('smartSpawner.fieldItemId')}>
              <input className={inputMono} value={itemId}
                onChange={e => {
                  const next = { ...mob.loot }
                  const val = next[itemId]
                  delete next[itemId]
                  next[e.target.value.trim().toUpperCase() || itemId] = val
                  patchMob({ loot: next })
                }} />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t('smartSpawner.fieldAmount')}><input className={inputMono} value={drop.amount} onChange={e => patchLoot(itemId, { amount: e.target.value })} /></Field>
              <Field label={t('smartSpawner.fieldChance')}><NumInput value={drop.chance} onChange={v => patchLoot(itemId, { chance: Number(v) || 0 })} /></Field>
            </div>
            <Field label={t('smartSpawner.fieldDurability')}><input className={inputMono} value={drop.durability || ''} onChange={e => patchLoot(itemId, { durability: e.target.value })} /></Field>
            <Field label={t('smartSpawner.fieldPotionType')}><input className={inputMono} value={drop.potionType || ''} onChange={e => patchLoot(itemId, { potionType: e.target.value })} /></Field>
            <button type="button" onClick={() => removeLoot(itemId)} className={`${btnCls} border-red-500/20 text-red-300 bg-red-500/10 self-start`}>
              <TrashIcon className="w-3.5 h-3.5" />{t('smartSpawner.deleteLoot')}
            </button>
          </div>
        ))}
      </Block>
      <Block title={t('smartSpawner.blockHeadTexture')}>
        <Field label={t('smartSpawner.fieldHeadMaterial')}>
          <input className={inputCls} value={mob.headTexture?.material || 'PLAYER_HEAD'}
            onChange={e => patchMob({ headTexture: { ...mob.headTexture, material: e.target.value } })} />
        </Field>
        <Field label={t('smartSpawner.fieldCustomTexture')}>
          <textarea className={`${inputMono} min-h-[60px]`} value={mob.headTexture?.customTexture || ''}
            onChange={e => patchMob({ headTexture: { ...mob.headTexture, customTexture: e.target.value } })} />
        </Field>
      </Block>
    </div>
  )
}

function MobListPanel({ t, mobIds, filteredMobs, mobId, mobSearch, setMobSearch, mobsWithLoot, state, set, setMobId }) {
  return (
    <div className="flex flex-col gap-3 min-h-0 flex-1">
      <div>
        <p className="text-xs font-semibold text-emerald-200/90 leading-tight">{t('smartSpawner.fileSpawners')}</p>
        <p className="text-[11px] text-white/40 mt-1">
          {t('smartSpawner.mobCount', { count: mobIds.length })} · {t('smartSpawner.mobLootCount', { loot: mobsWithLoot })}
        </p>
      </div>
      <div className="relative flex-shrink-0">
        <MagnifyingGlassIcon className="w-5 h-5 text-white/35 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-10 pr-3 py-2.5 text-sm text-white/90 outline-none focus:border-emerald-500/40 placeholder:text-white/30"
          placeholder={t('smartSpawner.mobSearch')}
          value={mobSearch}
          onChange={e => setMobSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 min-h-[200px] overflow-y-auto custom-dropdown-scroll -mx-1 px-1">
        <div className="flex flex-col gap-1.5">
          {filteredMobs.length === 0 && (
            <p className="text-sm text-white/35 text-center py-6">—</p>
          )}
          {filteredMobs.map(id => {
            const mob = state.spawnersSettings.mobs[id]
            const lootN = Object.keys(mob?.loot || {}).length
            const xp = mob?.experience ?? 0
            const active = mobId === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMobId(id)}
                className={`w-full rounded-xl border px-3 py-2.5 text-left transition-all ${
                  active
                    ? 'border-emerald-400/50 bg-emerald-500/15 shadow-[0_0_12px_rgba(16,185,129,0.12)]'
                    : 'border-white/[0.08] bg-white/[0.03] hover:border-emerald-500/25 hover:bg-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[13px] font-mono font-bold leading-tight break-all ${active ? 'text-emerald-100' : 'text-white/90'}`}>
                    {id}
                  </span>
                  {lootN > 0 && (
                    <span className={`flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
                      active ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200' : 'border-white/10 bg-white/[0.04] text-white/50'
                    }`}>
                      {lootN} drop{lootN > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                <p className={`text-[11px] mt-1 ${active ? 'text-emerald-300/70' : 'text-white/40'}`}>
                  XP {xp}{lootN === 0 ? ` · ${t('smartSpawner.noLoot')}` : ''}
                </p>
              </button>
            )
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          const id = `CUSTOM_MOB_${mobIds.length + 1}`
          set({
            spawnersSettings: {
              ...state.spawnersSettings,
              mobs: { ...state.spawnersSettings.mobs, [id]: emptyMob() },
            },
          })
          setMobId(id)
        }}
        className={`${btnCls} w-full justify-center py-2.5 text-sm bg-emerald-500/10 border-emerald-500/25 text-emerald-200 flex-shrink-0`}
      >
        <PlusIcon className="w-4 h-4" />
        {t('smartSpawner.addMob')}
      </button>
    </div>
  )
}

function PricesEditor({ t, s, set }) {
  const [q, setQ] = useState('')
  const entries = useMemo(() => Object.entries(s.itemPrices || {}).sort(([a], [b]) => a.localeCompare(b)), [s.itemPrices])
  const filtered = useMemo(() => {
    const qq = q.trim().toUpperCase()
    if (!qq) return entries
    return entries.filter(([k]) => k.includes(qq))
  }, [entries, q])

  const setPrice = (item, price) => set({ itemPrices: { ...s.itemPrices, [item]: Number(price) || 0 } })
  const remove = (item) => {
    const next = { ...s.itemPrices }
    delete next[item]
    set({ itemPrices: next })
  }
  const add = () => {
    const id = `NEW_ITEM_${Object.keys(s.itemPrices).length + 1}`
    setPrice(id, 1)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <MagnifyingGlassIcon className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
        <input className={`${inputCls} pl-9`} placeholder={t('smartSpawner.priceSearch')} value={q} onChange={e => setQ(e.target.value)} />
      </div>
      <p className="text-[10px] text-white/35">{t('smartSpawner.priceCount', { count: entries.length })}</p>
      <button type="button" onClick={add} className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300 self-start`}>
        <PlusIcon className="w-3.5 h-3.5" />{t('smartSpawner.addPrice')}
      </button>
      <div className="flex flex-col gap-1.5 max-h-[min(60vh,480px)] overflow-y-auto custom-dropdown-scroll pr-0.5">
        {filtered.map(([item, price]) => (
          <div key={item} className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 py-1.5">
            <input className={`${inputMono} flex-1 min-w-0`} value={item}
              onChange={e => {
                const next = { ...s.itemPrices }
                delete next[item]
                next[e.target.value.trim().toUpperCase() || item] = price
                set({ itemPrices: next })
              }} />
            <input className={`${inputCls} w-20`} value={price} onChange={e => setPrice(item, e.target.value)} />
            <button type="button" onClick={() => remove(item)} className="p-1 text-red-400/70 hover:text-red-300">
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SmartSpawnerTool({ onBack }) {
  const { t } = useI18n()
  const [state, setState] = useState(() => createSmartSpawnerState())
  const [fileMode, setFileMode] = useState('config')
  const [section, setSection] = useState('general')
  const [mobId, setMobId] = useState('BLAZE')
  const [mobSearch, setMobSearch] = useState('')
  const [copied, setCopied] = useState(false)
  const [presetNotice, setPresetNotice] = useState(null)
  const presetNoticeTimer = useRef(null)

  const set = useCallback(patch => setState(prev => ({ ...prev, ...patch })), [])

  const mobIds = useMemo(() => getMobIds(state), [state])
  const mobsWithLoot = useMemo(() => getMobsWithLoot(state).length, [state])
  const filteredMobs = useMemo(() => {
    const q = mobSearch.trim().toUpperCase()
    return mobIds.filter(id => !q || id.includes(q))
  }, [mobIds, mobSearch])

  const yaml = useMemo(() => {
    if (fileMode === 'spawners') return buildSpawnersSettingsYaml(state)
    if (fileMode === 'prices') return buildItemPricesYaml(state)
    return buildConfigYaml(state)
  }, [state, fileMode])

  const yamlPath = fileMode === 'spawners' ? t('smartSpawner.configPathSpawners')
    : fileMode === 'prices' ? t('smartSpawner.configPathPrices')
      : t('smartSpawner.configPathConfig')

  const downloadName = fileMode === 'spawners' ? 'spawners_settings.yml'
    : fileMode === 'prices' ? 'item_prices.yml' : 'config.yml'

  const fileModeOptions = useMemo(() => [
    { value: 'config', label: t('smartSpawner.fileConfig') },
    { value: 'spawners', label: t('smartSpawner.fileSpawners') },
    { value: 'prices', label: t('smartSpawner.filePrices') },
  ], [t])

  const presetOptions = useMemo(() => CONFIG_PRESETS.map(p => ({
    value: p.id,
    label: t(`smartSpawner.${PRESET_I18N[p.id]}`),
  })), [t])

  const handlePreset = (id) => {
    if (!id) return
    const p = CONFIG_PRESETS.find(x => x.id === id)
    if (!p) return
    setState(prev => applyConfigPreset(prev, p))
    if (fileMode === 'config' && p.focusSection) setSection(p.focusSection)
    setPresetNotice(id)
    if (presetNoticeTimer.current) clearTimeout(presetNoticeTimer.current)
    presetNoticeTimer.current = setTimeout(() => setPresetNotice(null), 4500)
  }

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ActiveConfig = CONFIG_SECTION_COMPONENTS[section]

  const hiveStats = useMemo(() => ({
    mobs: mobIds.length,
    lootMobs: mobsWithLoot,
    sell: state.sellIntegration?.enabled,
    hopper: state.hopper?.enabled,
    hologram: state.hologram?.enabled,
    db: state.database?.mode,
  }), [mobIds.length, mobsWithLoot, state])

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden animate-fade-in">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/[0.06] flex-shrink-0 flex-wrap">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/50 hover:text-white transition-all">
          <ArrowLeftIcon className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-semibold uppercase">{t('smartSpawner.badge')}</span>
            <h1 className="text-lg font-bold text-white">{t('smartSpawner.title')}</h1>
          </div>
          <p className="text-xs text-white/35 mt-0.5">{t('smartSpawner.subtitle')}</p>
        </div>
        <CustomDropdown label="" value={fileMode} onChange={v => { setFileMode(v); if (v === 'config') setSection('general') }}
          options={fileModeOptions} accent="indigo" className="w-44" />
        {fileMode === 'config' && (
          <CustomDropdown label="" value="" onChange={handlePreset} options={presetOptions}
            placeholder={t('smartSpawner.preset')} accent="indigo" className="w-36" />
        )}
      </div>
      {presetNotice && fileMode === 'config' && (
        <div className="mx-5 mb-0 -mt-1 px-3 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-start gap-2 animate-fade-in">
          <CheckCircleIcon className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-200/95">
              {t('smartSpawner.presetApplied', { name: t(`smartSpawner.${PRESET_I18N[presetNotice]}`) })}
            </p>
            <p className="text-[10px] text-white/45 mt-0.5">{t(`smartSpawner.${PRESET_SUMMARY_I18N[presetNotice]}`)}</p>
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden p-4">
        <div className={`grid grid-cols-1 gap-4 h-full min-h-0 ${
          fileMode === 'spawners'
            ? 'lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)_minmax(0,260px)]'
            : 'lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)_minmax(0,268px)]'
        }`}>
          <div className={`${sectionCls} min-h-0 overflow-hidden flex flex-col`}>
            {fileMode === 'config' && (
              <>
                <SectionTitle>{t('smartSpawner.chipMatrix')}</SectionTitle>
                <SmartSpawnerChipVisual
                  t={t}
                  activeId={section}
                  onSelect={setSection}
                  coreLabel="SS"
                  stats={hiveStats}
                />
              </>
            )}
            {fileMode === 'spawners' && (
              <MobListPanel
                t={t}
                mobIds={mobIds}
                filteredMobs={filteredMobs}
                mobId={mobId}
                mobSearch={mobSearch}
                setMobSearch={setMobSearch}
                mobsWithLoot={mobsWithLoot}
                state={state}
                set={set}
                setMobId={setMobId}
              />
            )}
            {fileMode === 'prices' && (
              <div className="text-[10px] text-white/35 leading-relaxed">
                <p className="font-semibold text-emerald-300/90 mb-2">{t('smartSpawner.filePrices')}</p>
                <p>{t('smartSpawner.descEconomy')}</p>
                <p className="mt-3 font-mono text-emerald-400/60">{Object.keys(state.itemPrices || {}).length} items</p>
              </div>
            )}
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            <div className="flex-1 min-h-0 overflow-y-auto custom-dropdown-scroll pr-0.5">
              {fileMode === 'config' && ActiveConfig && <ActiveConfig t={t} s={state} set={set} />}
              {fileMode === 'spawners' && (
                state.spawnersSettings.mobs[mobId]
                  ? <MobEditor t={t} s={state} set={set} mobId={mobId} />
                  : <p className="text-sm text-white/35">{t('smartSpawner.selectMob')}</p>
              )}
              {fileMode === 'prices' && <PricesEditor t={t} s={state} set={set} />}
            </div>
          </div>

          <div className={`${sectionCls} min-h-0 min-w-0 overflow-hidden flex flex-col`}>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <SectionTitle>{t('smartSpawner.yamlOutput')}</SectionTitle>
              <p className="text-[10px] font-mono text-emerald-400/50 break-all">{yamlPath}</p>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={copyYaml} className={`${btnCls} bg-white/[0.04] border-white/[0.08] text-white/60`}>
                  {copied ? <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-400" /> : <ClipboardDocumentIcon className="w-3.5 h-3.5" />}
                  {copied ? t('smartSpawner.copied') : t('smartSpawner.copy')}
                </button>
                <button type="button" onClick={() => downloadText(yaml, downloadName)}
                  className={`${btnCls} bg-emerald-500/10 border-emerald-500/20 text-emerald-300`}>
                  <ArrowDownTrayIcon className="w-3.5 h-3.5" />{t('smartSpawner.save')}
                </button>
              </div>
            </div>
            <pre className="flex-1 min-h-0 h-0 overflow-auto p-3 rounded-xl bg-[#0a120e] border border-white/[0.04] text-[10px] font-mono text-emerald-200/75 leading-relaxed whitespace-pre-wrap custom-dropdown-scroll">{yaml}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
