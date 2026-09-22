const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf-8');

// Add manifest link
if (!index.includes('rel="manifest"')) {
  index = index.replace(
    '</title>',
    `</title>\n    <link rel="manifest" href="/manifest.json" />`
  );
}

// Add service worker registration
if (!index.includes('serviceWorker')) {
  index = index.replace(
    '</body>',
    `  <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('ServiceWorker registration successful');
          }).catch((err) => {
            console.log('ServiceWorker registration failed: ', err);
          });
        });
      }
    </script>
  </body>`
  );
}

fs.writeFileSync('index.html', index);
console.log('Patched index.html');
