export default {
  badge: 'AE',
  title: 'Advanced Enchantments Builder',
  subtitle: 'Create custom enchantments with levels, effects, triggers and export to YAML',

  // Sections
  sectionBasicInfo: 'Basic Info',
  sectionTriggers: 'Triggers & Targets',
  sectionApplies: 'Applies To',
  sectionSettings: 'Settings',
  sectionLevelEditor: 'Level Editor',

  // Basic info fields
  nameLabel: 'System Name',
  nameHint: 'Lowercase, no spaces (e.g. my_enchantment)',
  displayLabel: 'Display Name',
  displayHint: 'Use %group-color% for automatic group color prefix',
  descriptionLabel: 'Description',
  appliesToVisual: 'Applies To (visual)',
  appliesToVisualHint: 'Shown in the enchantment description, purely cosmetic',
  groupLabel: 'Group',

  // Triggers
  typeLabel: 'Trigger Type(s)',
  typeHint: 'Semicolon separated for multiple triggers (e.g. ATTACK;DEFENSE)',
  targetsLabel: 'Available Targets',

  // Applies
  addAppliesPlaceholder: 'Add material/shortcut…',

  // Settings
  showActionBar: 'Show Action Bar',
  removeable: 'Removeable',
  disableInEnchanter: 'Disable in Enchanter',
  disabledWorlds: 'Disabled Worlds',
  worldPlaceholder: 'world_name',
  requiredEnchants: 'Required Enchants',
  notApplyableWith: 'Not Applyable With',
  removedEnchants: 'Removed Enchants',
  enchantPlaceholder: 'enchantment_name',
  selectEnchant: 'Select enchantment…',

  // Levels
  levels: 'Levels',
  levelsCount: 'Levels',
  levelPrefix: 'Level',
  addLevel: 'Add Level',
  levelNum: 'Level #',
  chance: 'Chance (%)',
  cooldown: 'Cooldown (s)',
  noLevels: 'No levels defined. Add one to get started.',

  // Effects
  effectsLabel: 'Effects',
  effectPlaceholder: 'POTION:SPEED:1:60 @Self',
  addEffect: 'Add',
  addEffectTitle: 'Add new effect',
  selectEffect: 'Select effect template…',
  effectsHint: 'POTION:TYPE:AMP:DURATION | DAMAGE:amount | STEAL_HEALTH:amount | BURN:ticks | LIGHTNING | TNT | LAUNCH_UP:power | BLIND:duration | MESSAGE:text | COMMAND:cmd | DROP_ITEM:material:amount | PARTICLE:type:amount | FREEZE:ticks | THROW_BACK:power — Target: @Attacker @Victim @Self @Random @All',

  // Conditions
  conditionsLabel: 'Conditions',
  conditionPlaceholder: 'HEALTH:BELOW:50%',
  addCondition: 'Add',
  addConditionTitle: 'Add new condition',
  selectCondition: 'Select condition template…',

  // Sidebar
  triggerLabel: 'Trigger',

  // Groups
  groupSimple: 'Simple',
  groupUnique: 'Unique',
  groupElite: 'Elite',
  groupUltimate: 'Ultimate',
  groupLegendary: 'Legendary',
  groupHeroic: 'Heroic',

  // Triggers list
  triggerAttack: 'Attack',
  triggerAttackMob: 'Attack Mob',
  triggerDefense: 'Defense',
  triggerDefenseMob: 'Defense Mob',
  triggerMining: 'Mining',
  triggerShoot: 'Shoot',
  triggerShootMob: 'Shoot Mob',
  triggerHeld: 'Held',
  triggerEffectStatic: 'Effect Static',
  triggerExplosionDamage: 'Explosion Damage',
  triggerDeath: 'Death',
  triggerKill: 'Kill',
  triggerBlockPlace: 'Block Place',
  triggerBlockBreak: 'Block Break',
  triggerRightClick: 'Right Click',
  triggerLeftClick: 'Left Click',
  triggerSneak: 'Sneak',
  triggerJoin: 'Join',
  triggerRespawn: 'Respawn',
  triggerCrouch: 'Crouch',
  triggerSprint: 'Sprint',
  triggerJump: 'Jump',

  // Presets
  presetBlank: 'Blank (empty)',
  presetVenom: 'Venom',
  presetBerserk: 'Berserk',
  presetLifesteal: 'Lifesteal',
  presetExplosive: 'Explosive',
  presetSpeed: 'Speed',
  presetLuckyMiner: 'Lucky Miner',
  presetThunderStrike: 'Thunder Strike',
  presetPlaceholder: 'Load preset…',
  presetApplied: 'Preset applied!',

  // Actions
  copy: 'Copy',
  copied: 'Copied!',
  download: 'Download',
  yamlOutput: 'YAML Output',
}
