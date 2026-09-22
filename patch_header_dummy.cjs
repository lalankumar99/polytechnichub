const fs = require('fs');
let content = fs.readFileSync('src/components/Header.tsx', 'utf-8');
if (!content.includes("import About from './About';")) {
  content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport About from './About'; // Imported as requested");
  fs.writeFileSync('src/components/Header.tsx', content);
}
