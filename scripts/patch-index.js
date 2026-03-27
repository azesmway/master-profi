const fs = require('fs')
const path = require('path')

const arrayDirs = ['/../dist']
const arrayHtml = [
  '+not-found.html',
  '_sitemap.html',
  'chats.html',
  'dashboard.html',
  'earnings.html',
  'home.html',
  'index.html',
  'offline.html',
  'orders.html',
  'otp.html',
  'phone.html',
  'profile.html',
  'register.html',
  'responses.html',
  'search.html',
  'welcome.html'
]

for (let i = 0; i < arrayHtml.length; i++) {
  const htmlPath = path.join(__dirname, arrayDirs[0], arrayHtml[i])

  try {
    const html = fs.readFileSync(htmlPath, 'utf8')

    // eslint-disable-next-line max-len
    const customCode1 = '\n<link rel="manifest" href="/manifest.json">\n<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n<meta name="apple-mobile-web-app-title" content="Мастер">\n<meta name="mobile-web-app-capable" content="yes">\n<meta name="theme-color" content="#0F0F0F">\n'

    const modifiedHtml = html.replace('<head>', `<head>${customCode1}`)
    fs.writeFileSync(htmlPath, modifiedHtml)

    console.log(`✅ ${arrayHtml[i]} патчен`)
  } catch (e) {
    console.error(`Ошибка при работе с ${arrayHtml[i]}:`, e)
    process.exit(1)
  }
}
