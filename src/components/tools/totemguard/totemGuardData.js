export const FILE_MODES = [
  { value: 'settings', labelKey: 'fileConfig' },
  { value: 'checks', labelKey: 'fileChecks' },
  { value: 'messages', labelKey: 'fileMessages' },
  { value: 'webhooks', labelKey: 'fileWebhooks' },
]

export const CHECK_SECTIONS = [
  {
    id: 'autototem',
    labelKey: 'secAutoTotem',
    checks: ['AutoTotemA', 'AutoTotemB', 'AutoTotemC', 'AutoTotemD', 'AutoTotemE', 'AutoTotemF', 'AutoTotemG', 'AutoTotemH'],
  },
  {
    id: 'badpackets',
    labelKey: 'secBadPackets',
    checks: ['BadPacketsA', 'BadPacketsB', 'BadPacketsC', 'BadPacketsD'],
  },
  {
    id: 'manual',
    labelKey: 'secManual',
    checks: ['ManualTotemA'],
  },
  {
    id: 'mods',
    labelKey: 'secMods',
    checks: ['Tweakeroo', 'AccurateBlockPlacement', 'ElytraSwapper'],
  },
]

export const CHECK_LABEL_KEYS = {
  AutoTotemA: 'checkAutoTotemA',
  AutoTotemB: 'checkAutoTotemB',
  AutoTotemC: 'checkAutoTotemC',
  AutoTotemD: 'checkAutoTotemD',
  AutoTotemE: 'checkAutoTotemE',
  AutoTotemF: 'checkAutoTotemF',
  AutoTotemG: 'checkAutoTotemG',
  AutoTotemH: 'checkAutoTotemH',
  BadPacketsA: 'checkBadPacketsA',
  BadPacketsB: 'checkBadPacketsB',
  BadPacketsC: 'checkBadPacketsC',
  BadPacketsD: 'checkBadPacketsD',
  ManualTotemA: 'checkManualTotemA',
  Tweakeroo: 'checkTweakeroo',
  AccurateBlockPlacement: 'checkAccurateBlockPlacement',
  ElytraSwapper: 'checkElytraSwapper',
}

export const CHECK_FIELD_MAP = {
  AutoTotemA: ['normalCheckTimeMs', 'clickTimeDifference'],
  AutoTotemB: ['standardDeviationThreshold', 'meanThreshold', 'consecutiveLowSDCount'],
  AutoTotemC: ['consistentSDRange', 'consecutiveViolations'],
  AutoTotemD: ['totalSequence', 'baseTimeDifference', 'tolerance'],
  AutoTotemE: ['standardDeviationThreshold', 'averageStDeviationThreshold'],
  AutoTotemF: ['timeDifference'],
  AutoTotemG: ['normalCheckTimeMs', 'clickToSwapTimeDifference'],
  AutoTotemH: ['minCheckTime', 'standardDeviationThreshold', 'meanThreshold', 'consecutiveLowSDCount'],
  BadPacketsB: ['bannedBrands'],
  ManualTotemA: ['checkTime'],
}

function createCheckDefaults() {
  return {
    defaultPunishment: 'ban %player% 1d [TotemGuard] Unfair Advantage',
    map: {
      AutoTotemA: {
        enabled: true, punishable: true, punishmentDelayInSeconds: 0, maxViolations: 4,
        punishmentCommands: ['%default_punishment%'],
        normalCheckTimeMs: 1500, clickTimeDifference: 75,
      },
      AutoTotemB: {
        enabled: true, punishable: true, punishmentDelayInSeconds: 0, maxViolations: 12,
        punishmentCommands: ['%default_punishment%'],
        standardDeviationThreshold: 30, meanThreshold: 500, consecutiveLowSDCount: 3,
      },
      AutoTotemC: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 6,
        punishmentCommands: ['%default_punishment%'],
        consistentSDRange: 1, consecutiveViolations: 3,
      },
      AutoTotemD: {
        enabled: true, punishable: true, punishmentDelayInSeconds: 0, maxViolations: 3,
        punishmentCommands: ['%default_punishment%'],
        totalSequence: 160, baseTimeDifference: 50, tolerance: 5,
      },
      AutoTotemE: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 4,
        punishmentCommands: ['%default_punishment%'],
        standardDeviationThreshold: 10, averageStDeviationThreshold: 10,
      },
      AutoTotemF: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 20,
        punishmentCommands: ['%default_punishment%'],
        timeDifference: 1500,
      },
      AutoTotemG: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 4,
        punishmentCommands: ['%default_punishment%'],
        normalCheckTimeMs: 1500, clickToSwapTimeDifference: 75,
      },
      AutoTotemH: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 4,
        punishmentCommands: ['%default_punishment%'],
        minCheckTime: 1500, standardDeviationThreshold: 35, meanThreshold: 100, consecutiveLowSDCount: 2,
      },
      BadPacketsA: {
        enabled: true, punishable: true, punishmentDelayInSeconds: 20, maxViolations: 1,
        punishmentCommands: ['%default_punishment%'],
      },
      BadPacketsB: {
        enabled: true, punishable: true, punishmentDelayInSeconds: 20, maxViolations: 1,
        punishmentCommands: ['%default_punishment%'],
        bannedBrands: ['autototem'],
      },
      BadPacketsC: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 20, maxViolations: 10,
        punishmentCommands: ['%default_punishment%'],
      },
      BadPacketsD: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 20, maxViolations: 1,
        punishmentCommands: ['%default_punishment%'],
      },
      ManualTotemA: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 4,
        punishmentCommands: ['%default_punishment%'],
        checkTime: 400,
      },
      Tweakeroo: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 1,
        punishmentCommands: ['kick %player% [TotemGuard] Unauthorised Mod Detected'],
      },
      AccurateBlockPlacement: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 1,
        punishmentCommands: ['kick %player% [TotemGuard] Unauthorised Mod Detected'],
      },
      ElytraSwapper: {
        enabled: true, punishable: false, punishmentDelayInSeconds: 0, maxViolations: 1,
        punishmentCommands: ['kick %player% [TotemGuard] Unauthorised Mod Detected'],
      },
    },
  }
}

export function createTotemGuardState() {
  return {
    settings: {
      api: true,
      server: 'Default',
      command: 'totemguard',
      commandAliases: ['tg'],
      bypass: false,
      consoleAlerts: true,
      announceClientBrand: false,
      announceCheckCommand: true,
      debug: false,
      redis: {
        enabled: false,
        syncAlerts: true,
        channel: 'totemguard',
        host: 'localhost',
        port: 6379,
        username: 'default',
        password: 'yourPassword',
      },
      updateChecker: {
        enabled: true,
        printToConsole: true,
        notifyInGame: true,
      },
      database: {
        type: 'h2',
        host: 'localhost',
        port: 3306,
        name: 'TotemGuard',
        username: 'root',
        password: 'password',
        connectionPoolSize: 4,
      },
    },
    checks: createCheckDefaults(),
    messages: {
      format: 'LEGACY',
      prefix: '&6&lTG &8»',
      alertsEnabled: '%prefix% &aAlerts enabled',
      alertsDisabled: '%prefix% &cAlerts disabled',
      alertsEnabledOther: '%prefix% &aAlerts enabled for %player%',
      alertsDisabledOther: '%prefix% &cAlerts disabled for %player%',
      noPermissionToggleOther: '%prefix% &cYou do not have permission to toggle alerts for other players.',
      alertToggleBlocked: '%prefix% &cAn external event handler is blocking your alert toggle.',
      alertBrand: '%prefix% &6%player% &7joined using: &6%client_brand%',
      alertFormat: {
        alertFormat: '%prefix% &e%player%&7 failed &6%check_name% &7VL[&6%violations%/%max_violations%&7]%dev%',
        alertFormatConsole: '%prefix% &e%player%&7 failed &6%check_name% &7VL[&6%violations%/%max_violations%&7]%dev%',
        alertHoverMessage: '&7TPS: &6%tps%&8 |&7 Client Version: &6%client_version%&8 |&7 Client Brand: &6%client_brand%\n\n&7Player: &6%player%\n&7Ping: &6(K: %k_ping%ms | T: %t_ping%ms)\n\n&7Check: &6%check_name%\n&7Description: &6%check_description%\n&7Server: &6%server%\n\n%check_details%\n\n&7Click to &6teleport &7to %player%.',
        alertClickCommand: '/tp %player%',
        devPrefix: '&d&l *',
        checkDetailsColor: { main: '&7', secondary: '&6' },
      },
      commandMessages: {
        genericCommands: {
          specifyPlayer: '%prefix% &cPlease specify a player.',
          pluginReloaded: '%prefix% &aThe plugin has been reloaded!',
          targetNeverJoined: '%prefix% &cTarget has never joined the server.',
          noDatabasePlayerFound: '%prefix% &cNo database player found for %player%.',
        },
      },
    },
    webhooks: {
      alert: {
        enabled: false,
        url: 'https://discord.com/api/webhooks/your_webhook_url',
        name: 'TotemGuard',
        color: '#d9b61a',
        title: 'TotemGuard Alert',
        profileImage: 'https://imgur.com/a/9IUVips',
        timestamp: true,
        footer: true,
      },
      punishment: {
        enabled: false,
        url: 'https://discord.com/api/webhooks/your_webhook_url',
        name: 'TotemGuard',
        color: '#d60010',
        title: 'TotemGuard Punishment',
        profileImage: 'https://imgur.com/a/9IUVips',
        timestamp: true,
        footer: true,
      },
    },
  }
}
