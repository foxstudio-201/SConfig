/**
 * rankRenderer.js
 * Pixel rank rendering engine — icons, font, color helpers, and canvas renderer.
 */

// ── 8×8 pixel icon maps ───────────────────────────────────────────────────────
export const ICONS = {
  Crown: [
    [1,0,0,0,0,0,0,1],
    [1,0,1,0,0,1,0,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Sword: [
    [0,0,0,0,0,0,1,1],
    [0,0,0,0,0,1,1,0],
    [0,0,0,0,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,0,0,0,0],
    [0,1,1,1,0,0,0,0],
    [1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Shield: [
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,0,1,1,0,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Star: [
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,1,0,1,1,0,1,0],
    [1,0,0,1,1,0,0,1],
    [0,0,0,0,0,0,0,0],
  ],
  Heart: [
    [0,1,1,0,0,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Diamond: [
    [0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Skull: [
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,0],
    [0,1,0,1,1,0,1,0],
    [0,1,1,1,1,1,1,0],
    [0,0,0,0,0,0,0,0],
  ],
  Flame: [
    [0,0,0,1,0,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [1,1,0,1,1,1,1,0],
    [1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,0,0],
    [0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Bolt: [
    [0,0,0,1,1,1,0,0],
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,0,0,0,0],
    [1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,0],
    [0,0,0,0,1,1,0,0],
    [0,0,0,0,0,1,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Cross: [
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Check: [
    [0,0,0,0,0,0,1,0],
    [0,0,0,0,0,1,1,0],
    [0,0,0,0,1,1,0,0],
    [1,0,0,1,1,0,0,0],
    [1,1,1,1,0,0,0,0],
    [0,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  X: [
    [1,0,0,0,0,0,0,1],
    [0,1,0,0,0,0,1,0],
    [0,0,1,0,0,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,1,0,0,1,0,0],
    [0,1,0,0,0,0,1,0],
    [1,0,0,0,0,0,0,1],
  ],
  Gem: [
    [0,0,1,1,1,1,0,0],
    [0,1,1,0,0,1,1,0],
    [1,1,0,0,0,0,1,1],
    [1,0,1,0,0,1,0,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Pickaxe: [
    [0,0,0,0,0,1,1,0],
    [0,0,0,0,1,1,1,1],
    [0,0,0,1,1,1,0,0],
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,0,0,0,0],
    [1,1,1,0,0,0,0,0],
    [1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Axe: [
    [0,1,1,1,1,0,0,0],
    [1,1,0,1,1,1,0,0],
    [1,1,1,1,1,1,0,0],
    [0,1,1,1,1,0,0,0],
    [0,0,1,1,0,0,0,0],
    [0,0,0,1,1,0,0,0],
    [0,0,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0],
  ],
  Spark: [
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,1,0,1,0,1,0,0],
    [0,0,1,1,1,0,0,0],
    [1,1,1,1,1,1,1,0],
    [0,0,1,1,1,0,0,0],
    [0,1,0,1,0,1,0,0],
    [0,0,0,1,0,0,0,0],
  ],
  None: null,
}

// ── Bitmap font (5 wide × 5 tall per char) ────────────────────────────────────
export const FONT = {
  A:[[0,1,1,0],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  B:[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,1],[1,1,1,0]],
  C:[[0,1,1,1],[1,0,0,0],[1,0,0,0],[1,0,0,0],[0,1,1,1]],
  D:[[1,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,1,0]],
  E:[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,1,1,1]],
  F:[[1,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  G:[[0,1,1,1],[1,0,0,0],[1,0,1,1],[1,0,0,1],[0,1,1,1]],
  H:[[1,0,0,1],[1,0,0,1],[1,1,1,1],[1,0,0,1],[1,0,0,1]],
  I:[[1,1,1],[0,1,0],[0,1,0],[0,1,0],[1,1,1]],
  J:[[0,0,1],[0,0,1],[0,0,1],[1,0,1],[0,1,1]],
  K:[[1,0,0,1],[1,0,1,0],[1,1,0,0],[1,0,1,0],[1,0,0,1]],
  L:[[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,1,1,1]],
  M:[[1,0,0,0,1],[1,1,0,1,1],[1,0,1,0,1],[1,0,0,0,1],[1,0,0,0,1]],
  N:[[1,0,0,1],[1,1,0,1],[1,0,1,1],[1,0,0,1],[1,0,0,1]],
  O:[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  P:[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,0,0],[1,0,0,0]],
  Q:[[0,1,1,0],[1,0,0,1],[1,0,1,1],[1,0,0,1],[0,1,1,1]],
  R:[[1,1,1,0],[1,0,0,1],[1,1,1,0],[1,0,1,0],[1,0,0,1]],
  S:[[0,1,1,1],[1,0,0,0],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  T:[[1,1,1,1,1],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  U:[[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  V:[[1,0,0,0,1],[1,0,0,0,1],[0,1,0,1,0],[0,1,0,1,0],[0,0,1,0,0]],
  W:[[1,0,0,0,1],[1,0,0,0,1],[1,0,1,0,1],[1,1,0,1,1],[1,0,0,0,1]],
  X:[[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,0,0,1]],
  Y:[[1,0,0,0,1],[0,1,0,1,0],[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]],
  Z:[[1,1,1,1],[0,0,1,0],[0,1,0,0],[1,0,0,0],[1,1,1,1]],
  '0':[[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,1,1,0]],
  '1':[[0,1,0],[1,1,0],[0,1,0],[0,1,0],[1,1,1]],
  '2':[[1,1,1,0],[0,0,0,1],[0,1,1,0],[1,0,0,0],[1,1,1,1]],
  '3':[[1,1,1,0],[0,0,0,1],[0,1,1,0],[0,0,0,1],[1,1,1,0]],
  '4':[[1,0,0,1],[1,0,0,1],[1,1,1,1],[0,0,0,1],[0,0,0,1]],
  '5':[[1,1,1,1],[1,0,0,0],[1,1,1,0],[0,0,0,1],[1,1,1,0]],
  '6':[[0,1,1,1],[1,0,0,0],[1,1,1,0],[1,0,0,1],[0,1,1,0]],
  '7':[[1,1,1,1],[0,0,0,1],[0,0,1,0],[0,1,0,0],[0,1,0,0]],
  '8':[[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0]],
  '9':[[0,1,1,0],[1,0,0,1],[0,1,1,1],[0,0,0,1],[0,1,1,0]],
  ' ':[[0],[0],[0],[0],[0]],
  '-':[[0,0,0],[0,0,0],[1,1,1],[0,0,0],[0,0,0]],
  '+':[[0,1,0],[0,1,0],[1,1,1],[0,1,0],[0,1,0]],
  '!':[[1],[1],[1],[0],[1]],
}

export function getChar(ch) {
  return FONT[ch.toUpperCase()] ?? [[1,0,1],[0,1,0],[1,0,1],[0,1,0],[1,0,1]]
}

export function measureText(text) {
  let w = 0
  for (const ch of text) { const bm = getChar(ch); w += (bm[0]?.length ?? 3) + 1 }
  return Math.max(0, w - 1)
}

// ── Color helpers ─────────────────────────────────────────────────────────────
export function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

export function lerpRgb(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  }
}

export function rgbStr(c) { return `rgb(${c.r},${c.g},${c.b})` }

/** Multi-stop gradient: stops = array of hex, t in [0,1] */
export function multiGradient(stops, t) {
  if (stops.length === 1) return hexToRgb(stops[0])
  const seg = 1 / (stops.length - 1)
  const idx = Math.min(Math.floor(t / seg), stops.length - 2)
  const localT = (t - idx * seg) / seg
  return lerpRgb(hexToRgb(stops[idx]), hexToRgb(stops[idx + 1]), localT)
}

// ── Canvas renderer ───────────────────────────────────────────────────────────
export function renderRank(canvas, s, scale) {
  const iconMap = s.showIcon ? ICONS[s.icon] : null
  const iconW   = iconMap ? 8 : 0
  const gap     = iconMap ? (s.iconGap ?? 1) : 0
  const divW    = (iconMap && s.showIconDivider) ? 2 : 0
  const textW   = measureText(s.rankText)
  const px      = s.paddingX
  const bw      = s.showBorder ? 1 : 0
  // Total height is ALWAYS 9px — border is included within that
  const totalH  = 9
  const innerH  = totalH - bw * 2   // 7 when border on, 9 when off
  const innerW  = (iconMap ? iconW + gap + divW + 2 : 0) + textW + px * 2
  const totalW  = innerW + bw * 2

  canvas.width  = totalW * scale
  canvas.height = totalH * scale
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = false

  // Corner pixels to skip (pixel-art rounded corners = cut 1px at each corner)
  const cornerSet = s.showCorners ? new Set([
    `0,0`, `${totalW-1},0`, `0,${totalH-1}`, `${totalW-1},${totalH-1}`
  ]) : new Set()

  function dot(x, y, color) {
    if (cornerSet.has(`${x},${y}`)) return
    ctx.fillStyle = color
    ctx.fillRect(x * scale, y * scale, scale, scale)
  }

  const isVert = s.bgDir === 'Top to Bottom'
  const bgStops = s.bgColors.slice(0, s.bgColorCount)

  // ── Background ──────────────────────────────────────────────────────────────
  if (s.showBg) {
    for (let y = bw; y < totalH - bw; y++) {
      for (let x = bw; x < totalW - bw; x++) {
        let color
        if (s.showBgGradient) {
          const t = isVert
            ? (y - bw) / Math.max(1, innerH - 1)
            : (x - bw) / Math.max(1, innerW - 1)
          color = rgbStr(multiGradient(bgStops, t))
        } else {
          color = bgStops[0]
        }
        dot(x, y, color)
      }
    }
  }

  // ── Gloss ───────────────────────────────────────────────────────────────────
  if (s.showGloss) {
    for (let x = bw; x < totalW - bw; x++) {
      dot(x, bw,     'rgba(255,255,255,0.30)')
      dot(x, bw + 1, 'rgba(255,255,255,0.12)')
    }
  }

  // ── Border ──────────────────────────────────────────────────────────────────
  if (s.showBorder) {
    for (let x = 0; x < totalW; x++) {
      dot(x, 0,          s.borderColor)
      dot(x, totalH - 1, s.borderColor)
    }
    for (let y = 0; y < totalH; y++) {
      dot(0,          y, s.borderColor)
      dot(totalW - 1, y, s.borderColor)
    }
  }

  let cx = bw + px
  // Center text (5px tall) and icon (7px tall) vertically within innerH
  const textOffsetY = Math.floor((innerH - 5) / 2)
  const iconOffsetY = Math.floor((innerH - 7) / 2)
  const cy  = bw + textOffsetY
  const icy = bw + Math.max(0, iconOffsetY)

  // ── Icon (left) ─────────────────────────────────────────────────────────────
  if (iconMap && s.iconPosition === 'Left') {
    const ic1 = hexToRgb(s.iconColor)
    const ic2 = hexToRgb(s.showIconGradient ? s.iconGrad2 : s.iconColor)
    const iconIsVert = (s.iconGradDir ?? 'Top to Bottom') === 'Top to Bottom'
    iconMap.forEach((row, iy) => {
      row.forEach((bit, ix) => {
        if (!bit) return
        let color
        if (s.showIconGradient) {
          const t = iconIsVert ? iy / 7 : ix / 7
          color = rgbStr(lerpRgb(ic1, ic2, t))
        } else {
          color = s.iconColor
        }
        if (s.showIconShadow) dot(cx + ix + 1, icy + iy, s.shadowColor)
        dot(cx + ix, icy + iy, color)
      })
    })
    if (s.showIconDivider) {
      for (let dy = 0; dy < innerH - 2; dy++) {
        dot(cx + iconW + gap + 1, bw + 1 + dy, s.dividerColor)
      }
    }
    cx += iconW + gap + divW + 2
  }

  // ── Text ────────────────────────────────────────────────────────────────────
  const textIsVert = s.textGradDir === 'Top to Bottom'
  const CHAR_H = 5
  let tx = cx
  const ty = cy

  for (const ch of s.rankText) {
    const bm = getChar(ch)
    const cw = bm[0]?.length ?? 3
    bm.forEach((row, ry) => {
      row.forEach((bit, rx) => {
        if (!bit) return
        let color
        if (s.showTextGradient) {
          const t = textIsVert ? ry / (CHAR_H - 1) : rx / Math.max(1, cw - 1)
          color = rgbStr(lerpRgb(hexToRgb(s.textGrad1), hexToRgb(s.textGrad2), t))
        } else {
          color = s.textColor
        }
        if (s.showTextShadow) dot(tx + rx + 1, ty + ry + 1, s.shadowColor)
        dot(tx + rx, ty + ry, color)
      })
    })
    tx += cw + 1
  }

  // ── Icon (right) ────────────────────────────────────────────────────────────
  if (iconMap && s.iconPosition === 'Right') {
    const rightX = totalW - bw - px - iconW
    if (s.showIconDivider) {
      for (let dy = 0; dy < innerH - 2; dy++) {
        dot(rightX - gap - 2, bw + 1 + dy, s.dividerColor)
      }
    }
    const ic1 = hexToRgb(s.iconColor)
    const ic2 = hexToRgb(s.showIconGradient ? s.iconGrad2 : s.iconColor)
    const iconIsVert = (s.iconGradDir ?? 'Top to Bottom') === 'Top to Bottom'
    iconMap.forEach((row, iy) => {
      row.forEach((bit, ix) => {
        if (!bit) return
        let color
        if (s.showIconGradient) {
          const t = iconIsVert ? iy / 7 : ix / 7
          color = rgbStr(lerpRgb(ic1, ic2, t))
        } else {
          color = s.iconColor
        }
        if (s.showIconShadow) dot(rightX + ix + 1, icy + iy, s.shadowColor)
        dot(rightX + ix, icy + iy, color)
      })
    })
  }
}
