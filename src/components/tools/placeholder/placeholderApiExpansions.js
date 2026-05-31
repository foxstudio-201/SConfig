/** PlaceholderAPI expansion catalog (curated subset for browse & simulate) */
export const EXPANSIONS = [
  {
    id: 'player',
    name: 'Player',
    author: 'PlaceholderAPI',
    description: 'Information about the player viewing or parsing the placeholder.',
    placeholders: [
      { name: '%player_name%', desc: 'Real username.', example: 'Steve' },
      { name: '%player_displayname%', desc: 'Display name including prefixes.', example: '§b[Hero] Steve' },
      { name: '%player_uuid%', desc: 'Unique player ID.', example: 'f84c6a79-a7ba-4b0f-b25b-80dfcc01f11a' },
      { name: '%player_ping%', desc: 'Connection latency in ms.', example: '42' },
      { name: '%player_level%', desc: 'Current XP level.', example: '24' },
      { name: '%player_exp%', desc: 'XP progress toward next level.', example: '345' },
      { name: '%player_world%', desc: 'Current world name.', example: 'world_survival' },
      { name: '%player_x%', desc: 'X coordinate.', example: '142' },
      { name: '%player_y%', desc: 'Y coordinate.', example: '68' },
      { name: '%player_z%', desc: 'Z coordinate.', example: '-310' },
      { name: '%player_health%', desc: 'Current health.', example: '18' },
      { name: '%player_max_health%', desc: 'Maximum health.', example: '20' },
      { name: '%player_food_level%', desc: 'Hunger bar level (0–20).', example: '17' },
      { name: '%player_gamemode%', desc: 'Active game mode.', example: 'SURVIVAL' },
      { name: '%player_biome%', desc: 'Biome at player location.', example: 'PLAINS' },
      { name: '%player_direction%', desc: 'Cardinal facing direction.', example: 'SOUTH' },
      { name: '%player_has_permission_vip%', desc: 'Returns yes/no for permission node (example).', example: 'yes' },
    ],
  },
  {
    id: 'server',
    name: 'Server',
    author: 'PlaceholderAPI',
    description: 'General server statistics and environment values.',
    placeholders: [
      { name: '%server_name%', desc: 'Configured server name.', example: 'FoxNetwork' },
      { name: '%server_online%', desc: 'Online player count.', example: '84' },
      { name: '%server_max_players%', desc: 'Maximum player slots.', example: '200' },
      { name: '%server_tps%', desc: 'Current TPS (1m average).', example: '19.95' },
      { name: '%server_uptime%', desc: 'Time since last restart.', example: '2d 4h 12m' },
      { name: '%server_ram_used%', desc: 'Used RAM in MB.', example: '4120' },
      { name: '%server_ram_max%', desc: 'Max allocated RAM in MB.', example: '8192' },
      { name: '%server_version%', desc: 'Server version string.', example: '1.20.4' },
      { name: '%server_time_HH:mm%', desc: 'Real-world time (formatter).', example: '14:32' },
      { name: '%server_weather%', desc: 'Current weather in player world.', example: 'clear' },
    ],
  },
  {
    id: 'vault',
    name: 'Vault',
    author: 'MilkBowl',
    description: 'Economy and permission hooks via Vault.',
    placeholders: [
      { name: '%vault_eco_balance%', desc: 'Exact balance.', example: '12540.50' },
      { name: '%vault_eco_balance_formatted%', desc: 'Formatted balance with currency.', example: '$12,540.50' },
      { name: '%vault_rank%', desc: 'Primary permission group.', example: 'MVP' },
      { name: '%vault_prefix%', desc: 'Active permission prefix.', example: '&b[MVP] &r' },
      { name: '%vault_suffix%', desc: 'Active permission suffix.', example: ' &7[Pro]' },
      { name: '%vault_group%', desc: 'Same as vault_rank.', example: 'MVP' },
    ],
  },
  {
    id: 'luckperms',
    name: 'LuckPerms',
    author: 'Luck',
    description: 'LuckPerms groups, weights, prefixes and metadata.',
    placeholders: [
      { name: '%luckperms_primary_group_name%', desc: 'Primary group name.', example: 'admin' },
      { name: '%luckperms_prefix%', desc: 'Active prefix.', example: '&4[Admin] &7' },
      { name: '%luckperms_suffix%', desc: 'Active suffix.', example: ' &7[Dev]' },
      { name: '%luckperms_weight%', desc: 'Primary group weight.', example: '100' },
      { name: '%luckperms_meta_tag%', desc: 'Custom meta key (example: tag).', example: 'Builder' },
      { name: '%luckperms_has_permission_vip%', desc: 'Permission check (yes/no).', example: 'yes' },
    ],
  },
  {
    id: 'essentials',
    name: 'EssentialsX',
    author: 'EssentialsX Team',
    description: 'EssentialsX nicknames, homes, AFK and toggles.',
    placeholders: [
      { name: '%essentials_nickname%', desc: 'Essentials nickname.', example: 'Stevy' },
      { name: '%essentials_afk%', desc: 'AFK status (yes/no).', example: 'no' },
      { name: '%essentials_godmode%', desc: 'God mode enabled (yes/no).', example: 'no' },
      { name: '%essentials_muted%', desc: 'Muted status (yes/no).', example: 'no' },
      { name: '%essentials_homes%', desc: 'Number of set homes.', example: '3' },
      { name: '%essentials_kit_is_newbie%', desc: 'Whether newbie kit is available.', example: 'no' },
      { name: '%essentials_jailed%', desc: 'Jailed status (yes/no).', example: 'no' },
    ],
  },
  {
    id: 'statistic',
    name: 'Statistic',
    author: 'PlaceholderAPI',
    description: 'Vanilla Minecraft player statistics.',
    placeholders: [
      { name: '%statistic_deaths%', desc: 'Total deaths.', example: '12' },
      { name: '%statistic_player_kills%', desc: 'Players killed.', example: '57' },
      { name: '%statistic_mob_kills%', desc: 'Mobs killed.', example: '483' },
      { name: '%statistic_jump%', desc: 'Jump count.', example: '4201' },
      { name: '%statistic_time_played%', desc: 'Total play time (ticks).', example: '1840000' },
      { name: '%statistic_distance_walked%', desc: 'Blocks walked.', example: '89234' },
      { name: '%statistic_blocks_mined%', desc: 'Blocks mined (example stat).', example: '12450' },
    ],
  },
  {
    id: 'bungee',
    name: 'Bungee',
    author: 'PlaceholderAPI',
    description: 'Network-wide stats when running behind BungeeCord / Velocity.',
    placeholders: [
      { name: '%bungee_total_players%', desc: 'Players across all servers.', example: '312' },
      { name: '%bungee_server_count%', desc: 'Number of registered servers.', example: '8' },
      { name: '%bungee_server_<server>_online%', desc: 'Online on named server.', example: '42' },
      { name: '%bungee_server_<server>_maxplayers%', desc: 'Max slots on named server.', example: '100' },
      { name: '%bungee_server_<server>_name%', desc: 'Display name of server.', example: 'Survival' },
    ],
  },
  {
    id: 'math',
    name: 'Math',
    author: 'PlaceholderAPI',
    description: 'Evaluate arithmetic expressions in placeholders.',
    placeholders: [
      { name: '%math_10+5%', desc: 'Basic addition.', example: '15' },
      { name: '%math_{vault_eco_balance}/100%', desc: 'Divide balance by 100.', example: '125.405' },
      { name: '%math_{player_health}*5%', desc: 'Multiply health by 5.', example: '90' },
      { name: '%math_round({player_ping}/10)%', desc: 'Round ping divided by 10.', example: '4' },
      { name: '%math_max(0,{player_health}-10)%', desc: 'Max function example.', example: '8' },
    ],
  },
  {
    id: 'formatter',
    name: 'Formatter',
    author: 'PlaceholderAPI',
    description: 'Format numbers, dates and text from other placeholders.',
    placeholders: [
      { name: '%formatter_number_{vault_eco_balance}%,###.##%', desc: 'Format number with pattern.', example: '12,540.50' },
      { name: '%formatter_date_yyyy-MM-dd%', desc: 'Current date pattern.', example: '2026-05-31' },
      { name: '%formatter_time_HH:mm:ss%', desc: 'Current time pattern.', example: '14:32:08' },
      { name: '%formatter_uppercase_{player_name}%', desc: 'Uppercase text.', example: 'STEVE' },
      { name: '%formatter_lowercase_{luckperms_primary_group_name}%', desc: 'Lowercase text.', example: 'admin' },
    ],
  },
  {
    id: 'parseother',
    name: 'ParseOther',
    author: 'PlaceholderAPI',
    description: 'Parse placeholders as another online player.',
    placeholders: [
      { name: '%parseother_player_name_<target>%', desc: 'Target player name.', example: 'Alex' },
      { name: '%parseother_player_health_<target>%', desc: 'Target player health.', example: '20' },
      { name: '%parseother_luckperms_prefix_<target>%', desc: 'Target player prefix.', example: '&a[VIP] &r' },
      { name: '%parseother_vault_eco_balance_<target>%', desc: 'Target player balance.', example: '500.00' },
    ],
  },
  {
    id: 'worldguard',
    name: 'WorldGuard',
    author: 'PlaceholderAPI',
    description: 'WorldGuard region information at player location.',
    placeholders: [
      { name: '%worldguard_region_name%', desc: 'Primary region name.', example: 'spawn' },
      { name: '%worldguard_region_owner%', desc: 'Region owner.', example: 'Steve' },
      { name: '%worldguard_region_members%', desc: 'Member count.', example: '5' },
      { name: '%worldguard_region_flag_pvp%', desc: 'PVP flag value.', example: 'deny' },
      { name: '%worldguard_region_flag_build%', desc: 'Build flag value.', example: 'allow' },
    ],
  },
  {
    id: 'checkitem',
    name: 'CheckItem',
    author: 'PlaceholderAPI',
    description: 'Check items in player inventory (requires CheckItem expansion).',
    placeholders: [
      { name: '%checkitem_amount_mat:DIAMOND%', desc: 'Count of material in inventory.', example: '12' },
      { name: '%checkitem_amount_mat:EMERALD%', desc: 'Emerald count.', example: '4' },
      { name: '%checkitem_amount_namecontains:Sword%', desc: 'Items with name containing text.', example: '1' },
      { name: '%checkitem_has_mat:NETHERITE_PICKAXE%', desc: 'Has item (yes/no).', example: 'yes' },
    ],
  },
]

/** Flat list of all catalog placeholder tokens */
export function getAllPlaceholderKeys() {
  const keys = new Set()
  for (const exp of EXPANSIONS) {
    for (const p of exp.placeholders) {
      const inner = p.name.replace(/^%|%$/g, '')
      keys.add(inner)
    }
  }
  return keys
}
