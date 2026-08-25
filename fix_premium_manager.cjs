const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPremiumManager.tsx', 'utf-8');

// Change type="url" to type="text" for the paymentLink input
content = content.replace('<input type="url" value={formData.paymentLink}', '<input type="text" value={formData.paymentLink}');

// Also change it for bannerUrl just in case
content = content.replace('<input type="url" value={formData.bannerUrl}', '<input type="text" value={formData.bannerUrl}');

// Update the default paymentLink in the New Course button
content = content.replace(
  "paymentLink: '' });", 
  "paymentLink: 'upi://pay?pa=9973532153@ibl&pn=User&am=19&cu=INR' });"
);

// Update the initial state
content = content.replace(
  "paymentLink: ''\\n  });",
  "paymentLink: 'upi://pay?pa=9973532153@ibl&pn=User&am=19&cu=INR'\\n  });"
);

fs.writeFileSync('src/components/AdminPremiumManager.tsx', content);
