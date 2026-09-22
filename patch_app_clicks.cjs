const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// folder open check
content = content.replace(
  `const handleOpenFolder = (folderId: string) => {
    setCurrentView('browse');
    setCurrentFolderId(folderId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`,
  `const handleOpenFolder = (folderId: string) => {
    const folder = publicItems.find(i => i.id === folderId);
    if (folder?.isPremium) {
      if (!premiumUser || premiumUser.status !== 'approved') {
        setShowPremiumPortal(true);
        return;
      }
    }
    setCurrentView('browse');
    setCurrentFolderId(folderId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };`
);

// file open check
content = content.replace(
  `const handleInitiateOpenFile = (file: StudyItem) => {
    setSelectedFileForRequirement(file);
  };`,
  `const handleInitiateOpenFile = (file: StudyItem) => {
    if (file.isPremium) {
      if (!premiumUser || premiumUser.status !== 'approved') {
        setShowPremiumPortal(true);
        return;
      }
    }
    setSelectedFileForRequirement(file);
  };`
);

fs.writeFileSync('src/App.tsx', content);
