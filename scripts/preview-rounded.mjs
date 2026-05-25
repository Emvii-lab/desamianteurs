import sharp from 'sharp'
const src = 'public/icons/source-cropped.png'
const size = 512
const trimmed = await sharp(src).trim({ background: '#FFFFFF', threshold: 10 }).toBuffer()
// Upscale 4x puis redescend à 512 — le downsample crée un anti-aliasing naturel
await sharp(trimmed)
  .resize(size * 4, size * 4, { fit: 'contain', background: { r: 255, g: 255, b: 255 }, kernel: 'lanczos3' })
  .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255 }, kernel: 'lanczos3' })
  .png()
  .toFile('public/icons/preview-rounded.png')
console.log('OK')
