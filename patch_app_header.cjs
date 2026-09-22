const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
  /<Header \s*currentView=\{currentView\} \s*onNavigate=\{handleNavigate\} \s*adminUser=\{adminUser\} \s*onOpenLogin=\{\(\) => setShowLogin\(true\)\} \s*onOpenSearch=\{\(\) => setIsSearchOpen\(true\)\} \s*onLogout=\{handleLogout\}\s*\/>/g,
  `<Header 
        currentView={currentView} 
        onNavigate={handleNavigate} 
        adminUser={adminUser} 
        onOpenLogin={() => setShowLogin(true)} 
        onOpenSearch={() => setIsSearchOpen(true)} 
        onLogout={handleLogout}
        premiumUser={premiumUser}
        onPremiumLogout={() => {
          localStorage.removeItem('polytechnic_premium_user');
          setPremiumUser(null);
        }}
      />`
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched with Header props');
