/** Permission Builder — Vietnamese UI */
export default {
  title: 'Permission Builder',
  subtitle: 'Nhóm LuckPerms, preset, xuất & đồng bộ REST API',
  tabOverview: 'Tổng quan',
  tabPermissions: 'Quyền',
  tabMeta: 'Meta',
  groups: 'Nhóm',
  groupCount: '{{count}} nhóm',
  groupCount_plural: '{{count}} nhóm',
  new: 'Mới',
  nodes: '{{count}} node',
  delete: 'Xóa',
  fieldGroupName: 'Tên nhóm (chữ thường)',
  fieldDisplayName: 'Tên hiển thị',
  fieldWeight: 'Trọng số (cao hơn = rank cao hơn)',
  fieldPrefix: 'Prefix (mã màu &)',
  fieldPrefixPriority: 'Ưu tiên prefix',
  fieldSuffix: 'Suffix',
  fieldSuffixPriority: 'Ưu tiên suffix',
  prefixPreview: 'Xem trước prefix',
  inheritFrom: 'Kế thừa từ nhóm',
  searchPermissions: 'Tìm quyền…',
  customNodePlaceholder: 'Node tùy chỉnh, vd. essentials.fly',
  add: 'Thêm',
  noPermissionsYet: 'Chưa có quyền — chọn từ preset bên dưới',
  presetPermissions: 'Quyền preset',
  customMeta: 'Meta tùy chỉnh',
  addMeta: 'Thêm meta',
  metaHint: 'Meta LuckPerms thêm (nametag-color, fly-speed, …)',
  noCustomMeta: 'Chưa có meta — prefix/suffix/weight ở Tổng quan',
  fieldKey: 'Khóa',
  fieldValue: 'Giá trị',
  syncTitle: 'LuckPerms REST API',
  syncDesc: 'Kết nối LuckPerms REST API (Bearer token). Bật trong config LuckPerms: rest-server enabled.',
  fieldBaseUrl: 'URL gốc',
  fieldApiKey: 'API Key (Bearer)',
  test: 'Kiểm tra',
  pull: 'Kéo về',
  push: 'Đẩy lên',
  output: 'Kết quả',
  exportFormat: 'Định dạng xuất',
  copy: 'Sao chép',
  copied: 'Đã sao chép',
  save: 'Lưu',
  loadPreset: 'Tải preset…',
  import: 'Nhập',
  importPrompt: 'Dán YAML export LuckPerms hoặc JSON API:',
  importFileYaml: 'YAML / JSON',
  importFileAll: 'Tất cả',
  trueVal: 'true',
  falseVal: 'false',
  catLuckperms: 'LuckPerms',
  catEssentials: 'EssentialsX',
  catWorldedit: 'WorldEdit',
  catWorldguard: 'WorldGuard',
  catMinecraft: 'Minecraft (Vanilla)',
  catVault: 'Vault / Kinh tế',
  catChat: 'Chat / Xã hội',
  catServer: 'Quản trị server',
  presetRankLadder: 'Thang rank đầy đủ',
  presetRankLadderDesc: 'default → member → vip → mvp → helper → mod → admin',
  presetMinimal: 'Thiết lập tối giản',
  presetMinimalDesc: 'chỉ default + admin',
  exportCommands: 'Lệnh LP',
  exportYaml: 'YAML export LP',
  exportApi: 'JSON REST API',
  msgNoGroups: 'Không tìm thấy nhóm trong file',
  msgImported: 'Đã nhập {{count}} nhóm',
  msgImportFailed: 'Nhập thất bại',
  msgConnected: 'Đã kết nối — {{count}} nhóm trên server',
  msgPulled: 'Đã kéo {{count}} nhóm từ LuckPerms',
  msgPushPartial: 'Đẩy một phần: {{names}} thất bại',
  msgPushed: 'Đã đẩy {{count}} nhóm lên LuckPerms',

  perm: {
    luckperms_star: {
      label: 'Quản trị LuckPerms đầy đủ',
      desc: 'Mọi lệnh LuckPerms'
    },
    luckperms_user: {
      label: 'Quản lý người chơi',
      desc: 'Quản lý quyền người chơi'
    },
    luckperms_group: {
      label: 'Quản lý nhóm',
      desc: 'Tạo/sửa nhóm'
    },
    luckperms_track: {
      label: 'Quản lý track rank',
      desc: 'Quản lý track rank'
    },
    luckperms_editor: {
      label: 'Trình soạn web',
      desc: 'Mở /lp editor'
    },
    luckperms_sync: {
      label: 'Đồng bộ',
      desc: 'Ép đồng bộ quyền'
    },
    luckperms_verbose: {
      label: 'Chế độ verbose',
      desc: 'Debug quyền'
    },
    luckperms_info: {
      label: 'Lệnh xem thông tin',
      desc: 'Xem thông tin quyền'
    },
    essentials_star: {
      label: 'Toàn bộ Essentials',
      desc: 'Mọi lệnh Essentials'
    },
    essentials_spawn: {
      label: 'Điểm spawn',
      desc: '/spawn'
    },
    essentials_home: {
      label: 'Về nhà',
      desc: '/home'
    },
    essentials_sethome: {
      label: 'Đặt nhà',
      desc: '/sethome'
    },
    essentials_delhome: {
      label: 'Xóa nhà',
      desc: '/delhome'
    },
    essentials_warp: {
      label: 'Warp',
      desc: '/warp'
    },
    essentials_warp_list: {
      label: 'Danh sách warp',
      desc: '/warps'
    },
    essentials_setwarp: {
      label: 'Tạo warp',
      desc: '/setwarp'
    },
    essentials_delwarp: {
      label: 'Xóa warp',
      desc: '/delwarp'
    },
    essentials_tpa: {
      label: 'Yêu cầu TPA',
      desc: 'Yêu cầu /tpa'
    },
    essentials_tpaccept: {
      label: 'Chấp nhận TP',
      desc: '/tpaccept'
    },
    essentials_tpdeny: {
      label: 'Từ chối TP',
      desc: '/tpdeny'
    },
    essentials_msg: {
      label: 'Tin nhắn riêng',
      desc: '/msg /r'
    },
    essentials_mail: {
      label: 'Thư',
      desc: '/mail'
    },
    essentials_kit: {
      label: 'Bộ kit',
      desc: '/kit'
    },
    essentials_kits_star: {
      label: 'Mọi kit',
      desc: 'Truy cập mọi kit'
    },
    essentials_fly: {
      label: 'Bay',
      desc: 'Bật/tắt /fly'
    },
    essentials_god: {
      label: 'Chế độ god',
      desc: '/god'
    },
    essentials_heal: {
      label: 'Hồi máu',
      desc: '/heal'
    },
    essentials_feed: {
      label: 'Hồi đói',
      desc: '/feed'
    },
    essentials_speed: {
      label: 'Tốc độ',
      desc: '/speed'
    },
    essentials_nick: {
      label: 'Biệt danh',
      desc: '/nick'
    },
    essentials_afk: {
      label: 'AFK',
      desc: '/afk'
    },
    essentials_back: {
      label: 'Quay lại',
      desc: '/back sau khi chết'
    },
    essentials_workbench: {
      label: 'Bàn chế tạo',
      desc: '/workbench'
    },
    essentials_enderchest: {
      label: 'Rương ender',
      desc: '/ec'
    },
    essentials_hat: {
      label: 'Đội block lên đầu',
      desc: '/hat'
    },
    essentials_repair: {
      label: 'Sửa đồ',
      desc: '/repair'
    },
    essentials_repair_all: {
      label: 'Sửa toàn bộ',
      desc: '/repair all'
    },
    essentials_invsee: {
      label: 'Xem túi đồ',
      desc: 'Xem túi người chơi'
    },
    essentials_socialspy: {
      label: 'Theo dõi tin nhắn',
      desc: 'Theo dõi tin nhắn riêng'
    },
    essentials_ban: {
      label: 'Cấm',
      desc: '/ban'
    },
    essentials_kick: {
      label: 'Đuổi',
      desc: '/kick'
    },
    essentials_mute: {
      label: 'Cấm chat',
      desc: '/mute'
    },
    essentials_tempban: {
      label: 'Cấm tạm',
      desc: '/tempban'
    },
    essentials_jail: {
      label: 'Giam',
      desc: '/jail'
    },
    essentials_unjail: {
      label: 'Thả giam',
      desc: '/unjail'
    },
    essentials_tp: {
      label: 'Dịch chuyển',
      desc: '/tp'
    },
    essentials_tp_others: {
      label: 'TP người khác',
      desc: '/tp người1 người2'
    },
    essentials_tpall: {
      label: 'TP tất cả',
      desc: '/tpall'
    },
    essentials_gamemode: {
      label: 'Gamemode',
      desc: '/gamemode'
    },
    essentials_give: {
      label: 'Cho item',
      desc: '/give item'
    },
    essentials_clearinventory: {
      label: 'Xóa túi',
      desc: '/clear'
    },
    essentials_time: {
      label: 'Thời gian',
      desc: '/time'
    },
    essentials_weather: {
      label: 'Thời tiết',
      desc: '/weather'
    },
    essentials_broadcast: {
      label: 'Thông báo',
      desc: '/broadcast'
    },
    essentials_chat_color: {
      label: 'Màu chat',
      desc: 'Chat có màu'
    },
    essentials_chat_format: {
      label: 'Định dạng chat',
      desc: 'Định dạng chat tùy chỉnh'
    },
    essentials_sethome_multiple: {
      label: 'Nhiều nhà',
      desc: 'Nhiều hơn một nhà'
    },
    essentials_sethome_multiple_unlimited: {
      label: 'Nhà không giới hạn',
      desc: 'Không giới hạn nhà'
    },
    worldedit_star: {
      label: 'Toàn bộ WorldEdit',
      desc: 'Mọi lệnh WorldEdit'
    },
    worldedit_region: {
      label: 'Chọn vùng',
      desc: '//wand, //pos'
    },
    worldedit_selection: {
      label: 'Công cụ chọn',
      desc: 'Lệnh chọn vùng'
    },
    worldedit_clipboard: {
      label: 'Clipboard',
      desc: '//copy, //paste'
    },
    worldedit_schematic: {
      label: 'Schematic',
      desc: 'Lưu/tải schematic'
    },
    worldedit_generation: {
      label: 'Sinh địa hình',
      desc: '//generate, //hcyl'
    },
    worldedit_navigation: {
      label: 'Di chuyển nhanh',
      desc: '//thru, //jumpto'
    },
    worldedit_region_set: {
      label: 'Đặt block',
      desc: '//set'
    },
    worldedit_region_replace: {
      label: 'Thay thế',
      desc: '//replace'
    },
    worldedit_region_walls: {
      label: 'Tường',
      desc: '//walls'
    },
    worldedit_region_faces: {
      label: 'Mặt',
      desc: '//faces'
    },
    worldedit_region_stack: {
      label: 'Xếp chồng',
      desc: '//stack'
    },
    worldedit_region_move: {
      label: 'Di chuyển vùng',
      desc: '//move'
    },
    worldedit_region_deform: {
      label: 'Biến dạng',
      desc: '//deform'
    },
    worldedit_region_smooth: {
      label: 'Làm mịn',
      desc: '//smooth'
    },
    worldedit_brush: {
      label: 'Brush',
      desc: 'Công cụ brush'
    },
    worldedit_limit_unrestricted: {
      label: 'Không giới hạn block',
      desc: 'Block không giới hạn'
    },
    worldguard_star: {
      label: 'Toàn bộ WorldGuard',
      desc: 'Mọi lệnh WorldGuard'
    },
    worldguard_region: {
      label: 'Định nghĩa vùng',
      desc: '/rg define'
    },
    worldguard_region_claim: {
      label: 'Claim vùng',
      desc: '/rg claim'
    },
    worldguard_region_remove: {
      label: 'Xóa vùng',
      desc: '/rg remove'
    },
    worldguard_region_flag: {
      label: 'Flag vùng',
      desc: '/rg flag'
    },
    worldguard_region_bypass: {
      label: 'Bỏ qua flag',
      desc: 'Bỏ qua hạn chế vùng'
    },
    worldguard_entry: {
      label: 'Vào vùng cấm',
      desc: 'Vào vùng bị cấm'
    },
    worldguard_build: {
      label: 'Xây trong vùng bảo vệ',
      desc: 'Xây trong vùng bảo vệ'
    },
    minecraft_command_star: {
      label: 'Mọi lệnh',
      desc: 'Mọi lệnh vanilla'
    },
    minecraft_command_gamemode: {
      label: 'Gamemode',
      desc: '/gamemode'
    },
    minecraft_command_tp: {
      label: 'Dịch chuyển',
      desc: '/tp'
    },
    minecraft_command_give: {
      label: 'Cho item',
      desc: '/give'
    },
    minecraft_command_kill: {
      label: 'Giết',
      desc: '/kill'
    },
    minecraft_command_kick: {
      label: 'Đuổi',
      desc: '/kick'
    },
    minecraft_command_ban: {
      label: 'Cấm',
      desc: '/ban'
    },
    minecraft_command_pardon: {
      label: 'Gỡ cấm',
      desc: '/pardon'
    },
    minecraft_command_op: {
      label: 'OP',
      desc: '/op'
    },
    minecraft_command_deop: {
      label: 'Deop',
      desc: '/deop'
    },
    minecraft_command_weather: {
      label: 'Thời tiết',
      desc: '/weather'
    },
    minecraft_command_time: {
      label: 'Thời gian',
      desc: '/time'
    },
    minecraft_command_effect: {
      label: 'Hiệu ứng',
      desc: '/effect'
    },
    minecraft_command_enchant: {
      label: 'Enchant',
      desc: '/enchant'
    },
    minecraft_command_clear: {
      label: 'Xóa',
      desc: '/clear'
    },
    minecraft_command_fill: {
      label: 'Fill',
      desc: '/fill'
    },
    minecraft_command_setblock: {
      label: 'Set block',
      desc: '/setblock'
    },
    minecraft_command_summon: {
      label: 'Triệu hồi',
      desc: '/summon'
    },
    minecraft_command_whitelist: {
      label: 'Whitelist',
      desc: '/whitelist'
    },
    vault_admin: {
      label: 'Quản trị Vault',
      desc: 'Quản trị Vault'
    },
    essentials_balance: {
      label: 'Số dư',
      desc: '/balance'
    },
    essentials_pay: {
      label: 'Chuyển tiền',
      desc: '/pay'
    },
    essentials_eco: {
      label: 'Quản trị kinh tế',
      desc: '/eco give/set'
    },
    essentials_baltop: {
      label: 'Top giàu',
      desc: '/baltop'
    },
    chat_color: {
      label: 'Màu chat',
      desc: 'Dùng mã màu & trong chat'
    },
    chat_format: {
      label: 'Định dạng chat',
      desc: 'Định dạng tùy chỉnh'
    },
    chat_magic: {
      label: 'Chữ obfuscated',
      desc: 'Chữ &k'
    },
    chat_rainbow: {
      label: 'Chat cầu vồng',
      desc: 'Plugin tên/text cầu vồng'
    },
    chat_mention: {
      label: 'Nhắc người chơi',
      desc: '@nhắc người chơi'
    },
    chat_bypass_cooldown: {
      label: 'Bỏ cooldown chat',
      desc: 'Không cooldown chat'
    },
    chat_bypass_filter: {
      label: 'Bỏ lọc chat',
      desc: 'Bỏ lọc chat'
    },
    wildcard: {
      label: 'Wildcard (OP)',
      desc: 'Mọi quyền — dùng cẩn thận'
    },
    bukkit_command_plugins: {
      label: 'Liệt kê plugin',
      desc: '/plugins'
    },
    bukkit_command_reload: {
      label: 'Reload',
      desc: '/reload'
    },
    bukkit_command_restart: {
      label: 'Khởi động lại',
      desc: '/restart'
    },
    bukkit_command_stop: {
      label: 'Dừng server',
      desc: '/stop'
    },
    bukkit_broadcast: {
      label: 'Thông báo',
      desc: 'Broadcast server'
    },
    bukkit_broadcast_admin: {
      label: 'Broadcast admin',
      desc: 'Broadcast chỉ admin'
    },
    spark: {
      label: 'Spark profiler',
      desc: 'Lệnh Spark'
    },
    spark_profiler: {
      label: 'Chạy profiler Spark',
      desc: 'Chạy profiler'
    }
  },
}
