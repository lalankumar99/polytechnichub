const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');
const linkStat = `
        <div className="bg-white p-4 rounded-xl border border-teal-200 bg-teal-50/40 shadow-sm">
          <span className="text-xs text-teal-700 font-semibold block">External Links</span>
          <span className="text-2xl font-black text-teal-700 font-mono mt-1 block">{stats?.totalLinks ?? 0}</span>
        </div>
`;
content = content.replace("</div>\n      </div>", "</div>\n" + linkStat + "      </div>");
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
