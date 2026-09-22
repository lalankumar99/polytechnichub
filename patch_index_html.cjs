const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

const iosMetaTags = `
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="PolyHub">
    <link rel="apple-touch-icon" href="/icon-192.png">
`;

// Insert after theme-color
if (!html.includes('apple-mobile-web-app-capable')) {
  html = html.replace('<meta name="theme-color" content="#020617" />', '<meta name="theme-color" content="#020617" />\\n' + iosMetaTags);
  fs.writeFileSync('index.html', html);
  console.log('index.html updated with iOS meta tags');
} else {
  console.log('index.html already has iOS meta tags');
}
