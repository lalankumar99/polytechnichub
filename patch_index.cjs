const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
html = html.replace('<link rel="manifest" href="/manifest.json" />', '');
html = html.replace('</head>', '  <link rel="icon" href="/icon.svg" type="image/svg+xml">\n    <link rel="apple-touch-icon" href="/icon-192.png">\n  </head>');
fs.writeFileSync('index.html', html);
