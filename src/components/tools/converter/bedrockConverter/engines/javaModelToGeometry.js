/**
 * Java blockbench elements → Bedrock 1.16 geometry (port of java2bedrock.sh core math).
 */

function round4(n) {
  return Math.round(n * 10000) / 10000
}

function rotationToBedrock(rot) {
  if (!rot?.axis) return null
  const a = Number(rot.angle) || 0
  if (rot.axis === 'x') return [round4(-a), 0, 0]
  if (rot.axis === 'y') return [0, round4(-a), 0]
  if (rot.axis === 'z') return [0, 0, round4(a)]
  return null
}

function pivotBedrock(origin) {
  if (!origin) return null
  return [round4(-origin[0] + 8), round4(origin[1]), round4(origin[2] - 8)]
}

function faceUv(face, texW = 16, texH = 16) {
  if (!face?.uv) return null
  const [u1, v1, u2, v2] = face.uv
  const scaleX = texW / 16
  const scaleY = texH / 16
  const fu1 = u1 * scaleX
  const fv1 = v1 * scaleY
  const fu2 = u2 * scaleX
  const fv2 = v2 * scaleY
  return {
    uv: [round4(Math.min(fu1, fu2)), round4(Math.min(fv1, fv2))],
    uv_size: [round4(Math.abs(fu2 - fu1)) || 1, round4(Math.abs(fv2 - fv1)) || 1],
  }
}

export function convertJavaElement(el, texW = 16, texH = 16) {
  const from = el.from || [0, 0, 0]
  const to = el.to || [16, 16, 16]
  const origin = [
    round4(from[0] - 8),
    round4(from[1]),
    round4(from[2] - 8),
  ]
  const size = [
    round4(to[0] - from[0]),
    round4(to[1] - from[1]),
    round4(to[2] - from[2]),
  ]
  const rot = el.rotation ? rotationToBedrock(el.rotation) : null
  const pivot = el.rotation?.origin ? pivotBedrock(el.rotation.origin) : null

  const uv = {}
  for (const face of ['north', 'south', 'east', 'west', 'up', 'down']) {
    const f = el.faces?.[face]
    const u = faceUv(f, texW, texH)
    if (u) uv[face] = u
  }

  const cube = { origin, size }
  if (Object.keys(uv).length) cube.uv = uv
  if (rot) cube.rotation = rot
  if (pivot) cube.pivot = pivot
  return cube
}

export function buildBedrockGeometry({ geometryId, elements, generated, textureWidth = 16, textureHeight = 16, binding }) {
  const geoName = `geometry.${geometryId}`

  const bindingExpr = binding || "c.item_slot == 'head' ? 'head' : q.item_slot_to_bone_name(c.item_slot)"

  const bones = [
    { name: 'geyser_custom', binding: bindingExpr, pivot: [0, 8, 0] },
    { name: 'geyser_custom_x', parent: 'geyser_custom', pivot: [0, 8, 0] },
    { name: 'geyser_custom_y', parent: 'geyser_custom_x', pivot: [0, 8, 0] },
  ]

  if (generated || !elements?.length) {
    bones.push({
      name: 'geyser_custom_z',
      parent: 'geyser_custom_y',
      pivot: [0, 8, 0],
      texture_meshes: [{
        texture: 'default',
        position: [0, 8, 0],
        rotation: [90, 0, -180],
        local_pivot: [8, 0.5, 8],
      }],
    })
  } else {
    const cubes = elements.map(el => convertJavaElement(el, textureWidth, textureHeight))
    const unrotated = cubes.filter(c => !c.rotation)
    const rotated = cubes.filter(c => c.rotation)

    bones.push({
      name: 'geyser_custom_z',
      parent: 'geyser_custom_y',
      pivot: [0, 8, 0],
      cubes: unrotated.map(({ rotation: _r, pivot: _p, ...rest }) => rest),
    })

    rotated.forEach((cube, i) => {
      bones.push({
        name: `rot_${i + 1}`,
        parent: 'geyser_custom_z',
        pivot: cube.pivot || [0, 8, 0],
        rotation: cube.rotation,
        cubes: [{
          origin: cube.origin,
          size: cube.size,
          uv: cube.uv,
        }],
      })
    })
  }

  return {
    format_version: '1.16.0',
    'minecraft:geometry': [{
      description: {
        identifier: geoName,
        texture_width: textureWidth,
        texture_height: textureHeight,
        visible_bounds_width: 4,
        visible_bounds_height: 4.5,
        visible_bounds_offset: [0, 0.75, 0],
      },
      bones,
    }],
    geometryIdentifier: geoName,
  }
}
