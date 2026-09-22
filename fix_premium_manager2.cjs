const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPremiumManager.tsx', 'utf-8');

content = content.replace(
  "paymentLink: ''\\n  });",
  "paymentLink: 'upi://pay?pa=9973532153@ibl&pn=User&am=19&cu=INR'\\n  });"
);

// wait the exact string match might fail if line endings are different or spaces
content = content.replace(
  "bannerUrl: '',\\n    paymentLink: ''",
  "bannerUrl: '',\\n    paymentLink: 'upi://pay?pa=9973532153@ibl&pn=User&am=19&cu=INR'"
);

fs.writeFileSync('src/components/AdminPremiumManager.tsx', content);
