/** ExcellentCrates Builder — Tiếng Việt */
export default {
  badge: 'ExcellentCrates',
  title: 'ExcellentCrates Builder',
  subtitle: 'Tạo crate với key, phần thưởng, độ hiếm, milestone và xuất YAML.',
  preset: 'Chọn preset…',
  presetApplied: 'Đã áp dụng preset!',
  copy: 'Sao chép',
  copied: 'Đã sao chép!',
  download: 'Tải xuống',
  yamlOutput: 'Kết quả YAML',
  stats: 'Thống kê',
  statKeys: 'Key',
  statRewards: 'Phần thưởng',
  statItems: 'Item reward',
  statCommands: 'Cmd reward',
  statMilestones: 'Milestone',

  // Modules
  moduleGeneral: 'Chung',
  moduleKeys: 'Key',
  moduleRewards: 'Phần thưởng',
  moduleAnimation: 'Animation',
  modulePreview: 'Xem trước',
  moduleMilestones: 'Milestone',
  moduleEffects: 'Hiệu ứng',

  // General
  sectionGeneral: 'Cài đặt Crate',
  fieldCrateId: 'ID crate',
  fieldDisplayName: 'Tên hiển thị',
  fieldDescription: 'Mô tả',
  fieldPermissionRequired: 'Yêu cầu permission',
  fieldPermission: 'Permission node',

  // Cost
  sectionOpenCost: 'Chi phí mở',
  fieldCostType: 'Loại chi phí',
  fieldCostAmount: 'Số lượng',
  costNone: 'Không',
  costVault: 'Vault (Tiền)',
  costExp: 'Điểm EXP',
  costLevels: 'Cấp EXP',
  costPlayerPoints: 'PlayerPoints',

  // Cooldown
  sectionCooldown: 'Cooldown mở',
  fieldCooldownEnabled: 'Bật cooldown',
  fieldCooldownAmount: 'Số lượng',
  fieldCooldownUnit: 'Đơn vị',
  unitSeconds: 'Giây',
  unitMinutes: 'Phút',
  unitHours: 'Giờ',
  unitDays: 'Ngày',

  // Mass open
  fieldMassOpenEnabled: 'Mở hàng loạt',
  fieldMassOpenMax: 'Tối đa key 1 lần',
  hintMassOpen: 'Số key tối đa người chơi có thể mở 1 lần',

  // Pushback
  fieldPushbackEnabled: 'Đẩy lùi',
  fieldPushbackStrength: 'Lực đẩy',

  // Keys
  sectionKeyEditor: 'Cài đặt Key',
  addKey: 'Thêm Key',
  noKeys: 'Chưa có key nào',
  fieldKeyName: 'Tên key',
  fieldKeyType: 'Loại',
  keyPhysical: 'Vật lý',
  keyVirtual: 'Ảo',
  fieldMaterial: 'Material',
  fieldLore: 'Lore (mỗi dòng một dòng)',
  fieldGlowing: 'Phát sáng (enchant glow)',

  // Rewards
  sectionRewardEditor: 'Cài đặt phần thưởng',
  addItemReward: '+ Item',
  addCmdReward: '+ Lệnh',
  noRewards: 'Chưa có phần thưởng nào',
  fieldEnabled: 'Bật',
  fieldRewardType: 'Loại',
  rewardItem: 'Item',
  rewardCommand: 'Lệnh',
  fieldRewardName: 'Tên',
  fieldRarity: 'Độ hiếm',
  fieldWeight: 'Trọng số',
  fieldBroadcast: 'Broadcast khi thắng',
  fieldAmount: 'Số lượng',
  fieldEnchantments: 'Phép thuật',
  addEnchantment: 'Thêm phép thuật',
  sectionItemDetails: 'Chi tiết Item',
  sectionCommandDetails: 'Chi tiết lệnh',
  fieldCommands: 'Lệnh (mỗi dòng một lệnh)',
  hintCommands: 'Dùng %player% cho tên người chơi. Chạy từ console.',

  // Rarities
  rarityCommon: 'Phổ thông',
  rarityUncommon: 'Không phổ biến',
  rarityRare: 'Hiếm',
  rarityEpic: 'Sử thi',
  rarityLegendary: 'Huyền thoại',
  rarityMythic: 'Thần thoại',

  // Win limits
  sectionWinLimit: 'Giới hạn thắng',
  fieldWinLimitEnabled: 'Giới hạn theo người chơi',
  fieldWinLimitAmount: 'Tối đa',
  fieldWinLimitCooldown: 'Cooldown',
  fieldGlobalLimitEnabled: 'Giới hạn toàn server',
  fieldGlobalLimitAmount: 'Tối đa (server)',
  fieldGlobalLimitCooldown: 'Cooldown',

  // Animation
  sectionAnimation: 'Animation mở crate',
  fieldAnimationEnabled: 'Bật animation',
  fieldAnimationType: 'Kiểu',
  fieldPreventSkip: 'Không cho bỏ qua',
  animNone: 'Không có',
  animSpin: 'Xoay',
  animCsgo: 'Cuộn CSGO',
  animWheel: 'Bánh xe',
  animLetter: 'Thư',

  // Preview
  sectionPreview: 'GUI xem trước',
  fieldPreviewEnabled: 'Bật xem trước',
  fieldPreviewTitle: 'Tiêu đề GUI',
  fieldPreviewRows: 'Số hàng (1-6)',
  hintPreviewRows: 'Số hàng trong GUI xem trước (tối đa 6)',

  // Milestones
  sectionMilestoneEditor: 'Cài đặt Milestone',
  addMilestone: 'Thêm Milestone',
  noMilestones: 'Chưa có milestone nào',
  fieldOpenings: 'Số lần mở yêu cầu',
  fieldMilestoneRewards: 'Phần thưởng Milestone',
  milestoneReward: 'Phần thưởng',
  addMilestoneReward: 'Thêm phần thưởng',
  openingsLabel: 'lần mở',
  rewardsLabel: 'phần thưởng',

  // Effects
  sectionEffects: 'Hiệu ứng Block',
  fieldParticle: 'Particle',
  fieldParticleData: 'Dữ liệu particle',
  hintParticleData: 'RGB cho REDSTONE (vd. 255,100,0) hoặc dữ liệu khác',
  sectionHologram: 'Hologram',
  fieldHologramEnabled: 'Bật hologram',
  fieldHologramLines: 'Dòng chữ (mỗi dòng một hàng)',
  fieldHologramOffset: 'Độ lệch Y',

  // Presets
  presetBlank: 'Trống',
  presetVoteCrate: 'Crate Vote',
  presetCommonCrate: 'Crate Phổ thông',
  presetRareCrate: 'Crate Hiếm',
  presetLegendaryCrate: 'Crate Huyền thoại',
  presetSeasonalCrate: 'Crate Mùa',
}
