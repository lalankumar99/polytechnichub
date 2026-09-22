const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf-8');

serverCode = serverCode.replace(
  /user: { id: user.id, internalId: user.internalId, name: user.name, email: user.email, mobile: user.mobile }/g,
  'user: { id: user.id, internalId: user.internalId, name: user.name, email: user.email, mobile: user.mobile, status: user.status }'
);

fs.writeFileSync('server.ts', serverCode);
console.log('Patched server.ts to include status');
