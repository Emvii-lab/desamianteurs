/**
 * Génère tous les PNG nécessaires pour la PWA et la TWA depuis le logo source
 * Usage : node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = join(__dir, '..')
const src   = join(root, 'public/icons/source-cropped.png')

const ICONS = [
  { name: 'icon-72.png',   size: 72  },
  { name: 'icon-96.png',   size: 96  },
  { name: 'icon-128.png',  size: 128 },
  { name: 'icon-144.png',  size: 144 },
  { name: 'icon-152.png',  size: 152 },
  { name: 'icon-192.png',  size: 192 },
  { name: 'icon-384.png',  size: 384 },
  { name: 'icon-512.png',  size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-16.png', size: 16 },
]

for (const { name, size } of ICONS) {
  await sharp(src).resize(size, size).png().toFile(join(root, 'public/icons', name))
  console.log(`✓ ${name} (${size}×${size})`)
}

// Maskable : logo centré sur canvas blanc 512×512 avec 12% de padding
const pad = Math.round(512 * 0.12)
const innerSize = 512 - pad * 2
const innerBuffer = await sharp(src)
  .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
  .toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 3, background: { r: 255, g: 255, b: 255 } } })
  .composite([{ input: innerBuffer, gravity: 'center' }])
  .png()
  .toFile(join(root, 'public/icons/maskable-512.png'))
console.log('✓ maskable-512.png (512×512)')

console.log('\n✅ Toutes les icônes générées dans public/icons/')
