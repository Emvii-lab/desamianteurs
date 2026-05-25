/**
 * Génère tous les PNG nécessaires pour la PWA et la TWA depuis le logo source
 * Usage : node scripts/generate-icons.mjs
 */

import sharp from 'sharp'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root  = join(__dir, '..')
const src   = join(root, 'public/icons/source-logo.png')

// Trim whitespace + supersampling 4x → downsample pour anti-aliasing naturel
const trimmed = await sharp(src).trim({ background: '#FFFFFF', threshold: 10 }).toBuffer()

const LOGO_PADDING = 0.10  // 10% de marge de chaque côté

async function resizeTo(size, { rounded = false } = {}) {
  const inner = Math.round(size * (1 - LOGO_PADDING * 2))
  const fitted = await sharp(trimmed)
    .resize(inner * 4, inner * 4, { fit: 'inside', kernel: 'lanczos3' })
    .resize(inner, inner, { fit: 'inside', kernel: 'lanczos3' })
    .toBuffer()

  const withBg = await sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } } })
    .composite([{ input: fitted, gravity: 'center' }])
    .png()
    .toBuffer()

  if (!rounded) {
    return sharp(withBg).png()
  }

  // Coins arrondis ~22% (style iOS/Android)
  const r = Math.round(size * 0.22)
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="white"/></svg>`
  )
  return sharp(withBg)
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
}

const ICONS = [
  { name: 'icon-72.png',          size: 72,  rounded: true  },
  { name: 'icon-96.png',          size: 96,  rounded: true  },
  { name: 'icon-128.png',         size: 128, rounded: true  },
  { name: 'icon-144.png',         size: 144, rounded: true  },
  { name: 'icon-152.png',         size: 152, rounded: true  },
  { name: 'icon-192.png',         size: 192, rounded: true  },
  { name: 'icon-384.png',         size: 384, rounded: true  },
  { name: 'icon-512.png',         size: 512, rounded: true  },
  { name: 'apple-touch-icon.png', size: 180, rounded: false }, // iOS arrondit lui-même
  { name: 'favicon-32.png',       size: 32,  rounded: false },
  { name: 'favicon-16.png',       size: 16,  rounded: false },
]

for (const { name, size, rounded } of ICONS) {
  await (await resizeTo(size, { rounded })).toFile(join(root, 'public/icons', name))
  console.log(`✓ ${name} (${size}×${size})`)
}

// Maskable : logo centré sur canvas blanc 512×512 avec 12% de padding
const pad = Math.round(512 * 0.12)
const innerSize = 512 - pad * 2
const innerBuffer = await sharp(trimmed)
  .resize(innerSize * 4, innerSize * 4, { fit: 'contain', background: { r: 255, g: 255, b: 255 }, kernel: 'lanczos3' })
  .resize(innerSize, innerSize, { fit: 'contain', background: { r: 255, g: 255, b: 255 }, kernel: 'lanczos3' })
  .toBuffer()
await sharp({ create: { width: 512, height: 512, channels: 3, background: { r: 255, g: 255, b: 255 } } })
  .composite([{ input: innerBuffer, gravity: 'center' }])
  .png()
  .toFile(join(root, 'public/icons/maskable-512.png'))
console.log('✓ maskable-512.png (512×512)')

console.log('\n✅ Toutes les icônes générées dans public/icons/')
