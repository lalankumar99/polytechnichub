const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

content = content.replace(
  '<span className="font-semibold text-slate-800">{item.name}</span>',
  '<span className="font-semibold text-slate-800">{item.name}</span>{item.isPremium && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Premium</span>}'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
