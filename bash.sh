sed -i "s/'text-secondary': '#666666',/'text-secondary': '#666666',\n          dark: '#0F0F0F',/" \
  ./tailwind.config.js
grep -A8 "text:" ./tailwind.config.js | head -10
