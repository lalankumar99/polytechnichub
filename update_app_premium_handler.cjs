const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('selectedPremiumCourse')) {
    content = content.replace(
        "const [activeViewingFile, setActiveViewingFile] = useState<StudyItem | null>(null);",
        "const [activeViewingFile, setActiveViewingFile] = useState<StudyItem | null>(null);\n  const [selectedPremiumCourse, setSelectedPremiumCourse] = useState<any | null>(null);"
    );
    
    content = content.replace(
        "const handleOpenFolder = (folderId: string) => {",
        `const handleOpenPremiumCourse = (course: any) => {
    setSelectedPremiumCourse(course);
    setCurrentView('premium');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenFolder = (folderId: string) => {`
    );

    content = content.replace(
        "onOpenFile={handleInitiateOpenFile}",
        "onOpenFile={handleInitiateOpenFile}\n            onOpenPremiumCourse={handleOpenPremiumCourse}"
    );

    fs.writeFileSync('src/App.tsx', content);
}
