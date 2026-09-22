const fs = require('fs');

let content = fs.readFileSync('src/services/api.ts', 'utf-8');

// 1. Let's fix the authState closing brace.
// We look for:
//   clearUser() {
//     localStorage.removeItem('polytechnic_admin_user');
//   }
// and anything after it up to `export const api = {`
// Actually, it seems I overwrote `};` at the end of `authState` with `  async getStudiverseData...`

// So let's replace `  clearUser() {\n    localStorage.removeItem('polytechnic_admin_user');\n  }\n  async getStudiverseData`
// with `  clearUser() {\n    localStorage.removeItem('polytechnic_admin_user');\n  }\n};\n`

content = content.replace(/clearUser\(\)\s*\{\s*localStorage\.removeItem\('polytechnic_admin_user'\);\s*\}/, `clearUser() {
    localStorage.removeItem('polytechnic_admin_user');
  }
};`);

// 2. Now let's remove ALL instances of `getStudiverseData`, `updateStudiverseLive`, `updateStudiverseVideos`
content = content.replace(/async getStudiverseData\(\)[\s\S]*?(?=async getPublicTree|export const api|async updateStudiverseLive|$)/g, '');
content = content.replace(/async updateStudiverseLive\(\)[\s\S]*?(?=async updateStudiverseVideos|$)/g, '');
content = content.replace(/async updateStudiverseVideos\(\)[\s\S]*?(?=\};|$)/g, '');

// Clean up
// Let's just create api.ts anew, it's safer.
