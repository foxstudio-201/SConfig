/**
 * rankPresets.js
 * Rank presets and default state for the Pixel Rank Generator.
 */

export const PRESETS = [
  { name: 'Crimson Red',   bg: ['#8B0000','#FF4444'], text: '#FFFFFF', tg1: '#FFFFFF', tg2: '#FF8888', border: '#FF6666', shadow: '#400000', icon: '#FFFFFF', divider: '#FF8888' },
  { name: 'Emerald Green', bg: ['#004400','#00AA44'], text: '#FFFFFF', tg1: '#FFFFFF', tg2: '#00FF88', border: '#00FF66', shadow: '#002200', icon: '#FFFFFF', divider: '#00CC55' },
  { name: 'Cyan Diamond',  bg: ['#003366','#0099CC'], text: '#FFFFFF', tg1: '#FFFFFF', tg2: '#00CCFF', border: '#00CCFF', shadow: '#001133', icon: '#FFFFFF', divider: '#00AADD' },
  { name: 'Rainbow',       bg: ['#FF0066','#FF6600','#6600FF'], text: '#FFFFFF', tg1: '#FFFF00', tg2: '#FF00FF', border: '#FF66FF', shadow: '#330033', icon: '#FFFFFF', divider: '#CC44FF' },
  { name: 'Ocean Blue',    bg: ['#001a4d','#0055AA'], text: '#FFFFFF', tg1: '#FFFFFF', tg2: '#3399FF', border: '#3399FF', shadow: '#000d26', icon: '#FFFFFF', divider: '#2277CC' },
  { name: 'Gold',          bg: ['#5C3A00','#D4A017'], text: '#FFFFFF', tg1: '#FFD700', tg2: '#FF8800', border: '#FFD700', shadow: '#2E1D00', icon: '#FFFFFF', divider: '#C8960C' },
]

export const DEFAULT_STATE = {
  rankText: 'RANK',
  icon: 'Shield',
  iconPosition: 'Left',
  paddingX: 3,
  iconGap: 1,
  bgColorCount: 2,
  bgColors: ['#43b9f2','#1b75bd','#0a3d6b','#05203d','#031428','#010a14','#000508'],
  bgDir: 'Top to Bottom',
  textColor: '#ffffff',
  showTextGradient: false,
  textGrad1: '#ffffff',
  textGrad2: '#88ccff',
  textGradDir: 'Top to Bottom',
  shadowColor: '#0b1d98',
  showTextShadow: true,
  showIconShadow: true,
  iconColor: '#ffffff',
  showIconGradient: false,
  iconGrad1: '#ffffff',
  iconGrad2: '#88ccff',
  iconGradDir: 'Top to Bottom',
  borderColor: '#0bc4c7',
  dividerColor: '#0a355e',
  showIcon: true,
  showBg: true,
  showBgGradient: true,
  showBorder: true,
  showGloss: true,
  showCorners: true,
  showIconDivider: true,
}
