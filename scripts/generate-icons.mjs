/**
 * Generate app icons from scripts/icon-source.svg (matches AppLogo.jsx).
 * Usage: npm run generate:icons
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import toIco from 'to-ico'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT_DIR = path.join(__dirname, '../public')
const SVG_PATH = path.join(__dirname, 'icon-source.svg')

const ICO_SIZES = [16, 24, 32, 48, 64, 128, 256]

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    throw new Error(`Missing ${SVG_PATH}`)
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  const svgBuffer = fs.readFileSync(SVG_PATH)

  console.log('Rendering from icon-source.svg (AppLogo)…')

  const pngBuffers = await Promise.all(
    ICO_SIZES.map(async (size) => {
      const buf = await sharp(svgBuffer, { density: 384 })
        .resize(size, size)
        .png()
        .toBuffer()
      return { size, buf }
    }),
  )

  const icoPath = path.join(OUT_DIR, 'icon.ico')
  fs.writeFileSync(icoPath, await toIco(pngBuffers.map(({ buf }) => buf)))
  console.log(`  ✓ ${icoPath} (${ICO_SIZES.join(', ')}px)`)

  const png512 = path.join(OUT_DIR, 'icon.png')
  await sharp(svgBuffer, { density: 384 })
    .resize(512, 512)
    .png()
    .toFile(png512)
  console.log(`  ✓ ${png512}`)

  const png256 = path.join(OUT_DIR, 'icon-256.png')
  await sharp(svgBuffer, { density: 384 })
    .resize(256, 256)
    .png()
    .toFile(png256)
  console.log(`  ✓ ${png256}`)

  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
