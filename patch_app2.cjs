const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

const filterLogic = `
  const isPremiumActive = premiumUser && premiumUser.status === 'approved';
  
  const filteredItems = useMemo(() => {
    if (adminUser) return publicItems; // Admin sees all
    
    return publicItems.filter(item => {
      // If marked as premium only, hide from non-premium users
      if (item.accessType === 'premium' || item.isPremium) {
        return isPremiumActive;
      }
      // If marked as free only, hide from premium users (based on some interpretations, but user said "Jo free wala hai vah bhi dikhna chahie premium lene wala ko", meaning premium sees free content. So we don't hide free content from premium.)
      // Therefore, if it's 'free' or 'both', it's visible to everyone.
      return true;
    });
  }, [publicItems, premiumUser, adminUser]);
`;

if (!content.includes('const filteredItems = useMemo')) {
  content = content.replace(
    'return (\n    <div',
    filterLogic + '\n  return (\n    <div'
  );
  
  content = content.replace(/items=\{publicItems\}/g, 'items={filteredItems}');
  
  // also change in handleOpenFolder and handleInitiateOpenFile to use filteredItems if needed, but actually we don't even need the check anymore if it's hidden!
  // But wait, what if they access via direct URL? We still need the check.
  
  fs.writeFileSync('src/App.tsx', content);
}
