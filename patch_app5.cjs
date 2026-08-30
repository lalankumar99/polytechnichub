const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const premiumPortalJsx = `
      {/* Premium Student Portal (Login/Register) */}
      {showPremiumPortal && (
        <PremiumPortal 
          onLoginSuccess={(user) => {
            setPremiumUser(user);
            setShowPremiumPortal(false);
          }}
          onClose={() => setShowPremiumPortal(false)}
        />
      )}
`;

code = code.replace(
  "{/* Global Search Modal */}",
  premiumPortalJsx + "\n      {/* Global Search Modal */}"
);

fs.writeFileSync('src/App.tsx', code);
