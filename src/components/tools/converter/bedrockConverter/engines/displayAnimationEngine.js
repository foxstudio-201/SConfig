/**
 * Java model display settings → Bedrock attachable animations (java2bedrock.sh port).
 */

function displayBone(display, hand, scaleHead = false) {
  if (!display) return null
  const d = display[hand]
  if (!d) return null
  const bone = {}
  if (d.rotation) {
    bone.rotation = [
      d.rotation[0] != null ? -d.rotation[0] : 0,
      d.rotation[1] != null ? (hand.includes('head') ? -d.rotation[1] : -d.rotation[1]) : 0,
      d.rotation[2] != null ? d.rotation[2] : 0,
    ]
  }
  if (d.translation) {
    const m = scaleHead ? 0.625 : 1
    bone.position = hand.includes('head')
      ? [-d.translation[0] * m, d.translation[1] * m, d.translation[2] * m]
      : hand.includes('lefthand')
        ? [d.translation[0], d.translation[1], d.translation[2]]
        : [-d.translation[0], d.translation[1], d.translation[2]]
  }
  if (d.scale) {
    bone.scale = scaleHead ? d.scale.map(v => v * 0.625) : d.scale
  } else if (scaleHead) {
    bone.scale = 0.625
  }
  return Object.keys(bone).length ? bone : null
}

export function buildDisplayAnimations(display, geometryId) {
  const prefix = `animation.${geometryId}`
  const anims = {}

  const tpR = displayBone(display, 'thirdperson_righthand')
  const tpL = displayBone(display, 'thirdperson_lefthand')
  const fpR = displayBone(display, 'firstperson_righthand')
  const fpL = displayBone(display, 'firstperson_lefthand')
  const head = displayBone(display, 'head', true)

  anims[`${prefix}.thirdperson_main_hand`] = {
    loop: true,
    bones: {
      geyser_custom_x: tpR || undefined,
      geyser_custom_y: tpR?.rotation ? { rotation: [0, tpR.rotation[1] ? -display.thirdperson_righthand.rotation[1] : 0, 0] } : undefined,
      geyser_custom_z: tpR?.rotation ? { rotation: [0, 0, display.thirdperson_righthand?.rotation?.[2] || 0] } : undefined,
      geyser_custom: { rotation: [90, 0, 0], position: [0, 13, -3] },
    },
  }

  anims[`${prefix}.thirdperson_off_hand`] = {
    loop: true,
    bones: {
      geyser_custom_x: tpL || undefined,
      geyser_custom: { rotation: [90, 0, 0], position: [0, 13, -3] },
    },
  }

  anims[`${prefix}.firstperson_main_hand`] = {
    loop: true,
    bones: {
      geyser_custom: { rotation: [90, 60, -40], position: [4, 10, 4], scale: 1.5 },
      geyser_custom_x: fpR || { rotation: [0.1, 0.1, 0.1] },
    },
  }

  anims[`${prefix}.firstperson_off_hand`] = {
    loop: true,
    bones: {
      geyser_custom: { rotation: [90, 60, -40], position: [4, 10, 4], scale: 1.5 },
      geyser_custom_x: fpL || undefined,
    },
  }

  anims[`${prefix}.head`] = {
    loop: true,
    bones: {
      geyser_custom_x: head || undefined,
      geyser_custom: { position: [0, 19.9, 0] },
    },
  }

  const clean = JSON.parse(JSON.stringify(anims, (_, v) => (v === undefined ? undefined : v)))
  return {
    format_version: '1.8.0',
    animations: clean,
    animationIds: {
      thirdperson_main_hand: `${prefix}.thirdperson_main_hand`,
      thirdperson_off_hand: `${prefix}.thirdperson_off_hand`,
      thirdperson_head: `${prefix}.head`,
      firstperson_main_hand: `${prefix}.firstperson_main_hand`,
      firstperson_off_hand: `${prefix}.firstperson_off_hand`,
      firstperson_head: 'animation.geyser_custom.disable',
    },
  }
}
