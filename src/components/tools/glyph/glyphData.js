/**
 * Bedrock Edition Glyph data
 *
 * Glyphs are stored in glyph_E0.png, glyph_E1.png, etc.
 * Each file is a 256×256 grid of 16×16 cells (16 cols × 16 rows).
 * A glyph code like "E102" means:
 *   - File: glyph_E1.png
 *   - Row 0, Column 2 → position 02 in hex
 * The Unicode character is: \uE102
 *
 * Vanilla uses E0 and E1. Free slots: E2–F8.
 */

// Vanilla glyph_E0 known mappings (row-col hex → label)
export const VANILLA_E0 = {
  '00': 'Xbox A',        '01': 'Xbox B',        '02': 'Xbox X',        '03': 'Xbox Y',
  '04': 'Xbox LB',       '05': 'Xbox RB',        '06': 'Xbox LT',       '07': 'Xbox RT',
  '08': 'Xbox Select',   '09': 'Xbox Start',     '0A': 'Xbox LS',       '0B': 'Xbox RS',
  '0C': 'D-Pad Up',      '0D': 'D-Pad Down',     '0E': 'D-Pad Left',    '0F': 'D-Pad Right',
  '10': 'PS Cross',      '11': 'PS Circle',      '12': 'PS Square',     '13': 'PS Triangle',
  '14': 'PS L1',         '15': 'PS R1',          '16': 'PS L2',         '17': 'PS R2',
  '18': 'PS Select',     '19': 'PS Start',       '1A': 'PS L3',         '1B': 'PS R3',
  '1C': 'PS D-Up',       '1D': 'PS D-Down',      '1E': 'PS D-Left',     '1F': 'PS D-Right',
  '20': 'Switch A',      '21': 'Switch B',       '22': 'Switch X',      '23': 'Switch Y',
  '24': 'Switch L',      '25': 'Switch R',       '26': 'Switch ZL',     '27': 'Switch ZR',
  '28': 'Switch Minus',  '29': 'Switch Plus',    '2A': 'Switch LS',     '2B': 'Switch RS',
  '2C': 'Switch D-Up',   '2D': 'Switch D-Down',  '2E': 'Switch D-Left', '2F': 'Switch D-Right',
}

// Vanilla glyph_E1 known mappings
export const VANILLA_E1 = {
  '00': 'Crafting Table', '01': 'Anvil',         '02': 'Chest',         '03': 'Ender Chest',
  '04': 'Shulker Box',    '05': 'Barrel',        '06': 'Furnace',       '07': 'Blast Furnace',
  '08': 'Smoker',         '09': 'Brewing Stand', '0A': 'Enchant Table', '0B': 'Grindstone',
  '0C': 'Cartography',    '0D': 'Loom',          '0E': 'Stonecutter',   '0F': 'Smithing Table',
  '10': 'Bed',            '11': 'Respawn Anchor','12': 'Lodestone',     '13': 'Composter',
  '14': 'Beacon',         '15': 'Conduit',       '16': 'Bell',          '17': 'Jukebox',
  '18': 'Note Block',     '19': 'Dispenser',     '1A': 'Dropper',       '1B': 'Hopper',
  '1C': 'Observer',       '1D': 'Piston',        '1E': 'Sticky Piston', '1F': 'Redstone',
}

// Available glyph files (vanilla + free slots)
export const GLYPH_FILES = [
  { id: 'E0', label: 'glyph_E0.png', vanilla: true,  known: VANILLA_E0 },
  { id: 'E1', label: 'glyph_E1.png', vanilla: true,  known: VANILLA_E1 },
  { id: 'E2', label: 'glyph_E2.png', vanilla: false, known: {} },
  { id: 'E3', label: 'glyph_E3.png', vanilla: false, known: {} },
  { id: 'E4', label: 'glyph_E4.png', vanilla: false, known: {} },
  { id: 'E5', label: 'glyph_E5.png', vanilla: false, known: {} },
  { id: 'E6', label: 'glyph_E6.png', vanilla: false, known: {} },
  { id: 'E7', label: 'glyph_E7.png', vanilla: false, known: {} },
  { id: 'E8', label: 'glyph_E8.png', vanilla: false, known: {} },
  { id: 'E9', label: 'glyph_E9.png', vanilla: false, known: {} },
  { id: 'EA', label: 'glyph_EA.png', vanilla: false, known: {} },
  { id: 'EB', label: 'glyph_EB.png', vanilla: false, known: {} },
  { id: 'EC', label: 'glyph_EC.png', vanilla: false, known: {} },
  { id: 'ED', label: 'glyph_ED.png', vanilla: false, known: {} },
  { id: 'EE', label: 'glyph_EE.png', vanilla: false, known: {} },
  { id: 'EF', label: 'glyph_EF.png', vanilla: false, known: {} },
  { id: 'F0', label: 'glyph_F0.png', vanilla: false, known: {} },
  { id: 'F1', label: 'glyph_F1.png', vanilla: false, known: {} },
  { id: 'F2', label: 'glyph_F2.png', vanilla: false, known: {} },
  { id: 'F3', label: 'glyph_F3.png', vanilla: false, known: {} },
  { id: 'F4', label: 'glyph_F4.png', vanilla: false, known: {} },
  { id: 'F5', label: 'glyph_F5.png', vanilla: false, known: {} },
  { id: 'F6', label: 'glyph_F6.png', vanilla: false, known: {} },
  { id: 'F7', label: 'glyph_F7.png', vanilla: false, known: {} },
  { id: 'F8', label: 'glyph_F8.png', vanilla: false, known: {} },
]

/**
 * Convert a glyph code like "E102" to a Unicode character.
 * @param {string} code - 4-char hex string e.g. "E102"
 * @returns {string} Unicode character
 */
export function glyphCodeToChar(code) {
  const codePoint = parseInt(code, 16)
  if (isNaN(codePoint)) return ''
  return String.fromCodePoint(codePoint)
}

/**
 * Convert row (0-15) and col (0-15) within a file to a glyph code.
 * @param {string} fileId - e.g. "E1"
 * @param {number} row
 * @param {number} col
 * @returns {string} 4-char code e.g. "E102"
 */
export function posToCode(fileId, row, col) {
  const pos = (row * 16 + col).toString(16).toUpperCase().padStart(2, '0')
  return fileId + pos
}

/**
 * Get row and col from a 2-char position string like "02"
 */
export function posToRowCol(pos) {
  const n = parseInt(pos, 16)
  return { row: Math.floor(n / 16), col: n % 16 }
}
