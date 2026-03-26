#!/usr/bin/env node
/**
 * Генерирует все нужные иконки и splash screens для PWA
 * из одного исходного файла icon-source.png (1024x1024)
 *
 * Запуск: node scripts/generate-pwa-assets.js
 *
 * Зависимости: npm install sharp --save-dev
 */

const sharp = require('sharp')
const path  = require('path')
const fs    = require('fs')

const SRC    = path.join(__dirname, '../assets/icon-source.png') // 1024x1024
const ICONS  = path.join(__dirname, '../public/icons')
const SPLASH = path.join(__dirname, '../public/splash')

fs.mkdirSync(ICONS,  { recursive: true })
fs.mkdirSync(SPLASH, { recursive: true })

// ── Иконки ────────────────────────────────────────────────────────────────────

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

async function generateIcons() {
  for (const size of ICON_SIZES) {
    await sharp(SRC)
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS, `icon-${size}.png`))
    console.log(`✓ icon-${size}.png`)
  }

  // Badge (маленький значок для push-уведомлений — белый на прозрачном)
  await sharp(SRC)
    .resize(72, 72)
    .png()
    .toFile(path.join(ICONS, 'badge-72.png'))
  console.log('✓ badge-72.png')
}

// ── Splash screens ────────────────────────────────────────────────────────────

const SPLASH_CONFIGS = [
  { file: 'splash-750x1334.png',   w: 750,  h: 1334  }, // iPhone SE
  { file: 'splash-1125x2436.png',  w: 1125, h: 2436  }, // iPhone X/XS
  { file: 'splash-1170x2532.png',  w: 1170, h: 2532  }, // iPhone 12/13/14
  { file: 'splash-1290x2796.png',  w: 1290, h: 2796  }, // iPhone 14 Pro Max
  { file: 'splash-1536x2048.png',  w: 1536, h: 2048  }, // iPad
  { file: 'splash-2048x2732.png',  w: 2048, h: 2732  }, // iPad Pro 12.9
]

// Цвет фона — совпадает с background_color в manifest.json
const BG_COLOR = { r: 15, g: 15, b: 15, alpha: 1 }
// Размер логотипа по центру
const LOGO_FRACTION = 0.25

async function generateSplash() {
  for (const cfg of SPLASH_CONFIGS) {
    const logoSize = Math.round(Math.min(cfg.w, cfg.h) * LOGO_FRACTION)

    // Ресайзим иконку для вставки по центру
    const logoBuffer = await sharp(SRC)
      .resize(logoSize, logoSize)
      .png()
      .toBuffer()

    await sharp({
      create: {
        width:      cfg.w,
        height:     cfg.h,
        channels:   4,
        background: BG_COLOR,
      },
    })
    .composite([{
      input: logoBuffer,
      top:   Math.round((cfg.h - logoSize) / 2),
      left:  Math.round((cfg.w - logoSize) / 2),
    }])
    .png()
    .toFile(path.join(SPLASH, cfg.file))

    console.log(`✓ ${cfg.file}`)
  }
}

// ── OG Image ─────────────────────────────────────────────────────────────────

async function generateOGImage() {
  const logoBuffer = await sharp(SRC)
    .resize(200, 200)
    .png()
    .toBuffer()

  await sharp({
    create: { width: 1200, height: 630, channels: 4, background: { r: 15, g: 15, b: 15, alpha: 1 } },
  })
  .composite([{ input: logoBuffer, top: 215, left: 500 }])
  .png()
  .toFile(path.join(__dirname, '../public/og-image.png'))

  console.log('✓ og-image.png')
}

// ── Run ───────────────────────────────────────────────────────────────────────

;(async () => {
  console.log('🎨 Генерация PWA ассетов...\n')
  await generateIcons()
  console.log()
  await generateSplash()
  console.log()
  await generateOGImage()
  console.log('\n✅ Готово!')
})().catch(console.error)
