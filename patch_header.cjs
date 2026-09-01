const fs = require('fs');
let code = fs.readFileSync('src/components/Header.tsx', 'utf-8');

code = code.replace(/adminUser: AdminUser \| null;/g, `adminUser: AdminUser | null;\n  premiumUser?: any;\n  onPremiumLogout?: () => void;`);

code = code.replace(/onLogout\n\}\) => \{/g, `onLogout,\n  premiumUser,\n  onPremiumLogout\n}) => {`);

// Right before the `{!adminUser && (` block, add the premium user profile
code = code.replace(/\{!adminUser && \(/, 
`{premiumUser && !adminUser && (
              <div className="hidden md:flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-xl p-1 pl-3">
                <div className="flex items-center space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {premiumUser.name ? premiumUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-bold text-indigo-900 max-w-[100px] truncate">{premiumUser.name}</span>
                  {premiumUser.status === 'approved' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Premium Active" />}
                </div>
                <button
                  onClick={onPremiumLogout}
                  className="p-1.5 rounded-lg text-indigo-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-2"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {!adminUser && !premiumUser && (`);

// And update the mobile menu if needed, but for now we just show it on desktop at least, or mobile too
code = code.replace(/\{!adminUser && \(\s*<button\s*onClick=\{onOpenLogin\}/,
`{!adminUser && !premiumUser && (
              <button
                onClick={onOpenLogin}`);

fs.writeFileSync('src/components/Header.tsx', code);
console.log('Header.tsx patched');
