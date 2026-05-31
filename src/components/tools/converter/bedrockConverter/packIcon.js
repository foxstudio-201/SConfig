/** Resize/drag-drop image → 256×256 PNG for Bedrock pack_icon.png */

const PACK_ICON_SIZE = 256

export function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not load image'))
    }
    img.src = url
  })
}

export function loadImageFromBase64(base64, mime = 'image/png') {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not load image'))
    img.src = `data:${mime};base64,${base64}`
  })
}

export function renderPackIcon(img, size = PACK_ICON_SIZE) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, size, size)

  const scale = Math.min(size / img.width, size / img.height)
  const w = img.width * scale
  const h = img.height * scale
  const x = (size - w) / 2
  const y = (size - h) / 2
  ctx.drawImage(img, x, y, w, h)
  return canvas
}

export async function fileToPackIconPngBlob(file) {
  const img = await loadImageFromFile(file)
  const canvas = renderPackIcon(img)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('PNG export failed'))
    }, 'image/png')
  })
}

export async function base64ToPackIconPngBlob(base64) {
  const img = await loadImageFromBase64(base64)
  const canvas = renderPackIcon(img)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('PNG export failed'))
    }, 'image/png')
  })
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      resolve(String(dataUrl).split(',')[1] || '')
    }
    reader.onerror = () => reject(new Error('Read failed'))
    reader.readAsDataURL(blob)
  })
}
