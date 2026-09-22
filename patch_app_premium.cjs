const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace the PremiumCourseView instance
code = code.replace(
  /<PremiumCourseView \s*course=\{selectedCourse\} \s*onBack=\{\(\) => setSelectedCourse\(null\)\} \s*user=\{studentUser\} \s*onOpenFile=\{setViewingFile\}\s*\/>/g,
  `<PremiumCourseView 
    course={selectedCourse} 
    onBack={() => setSelectedCourse(null)} 
    user={premiumUser} 
    onOpenFile={setViewingFile}
    onOpenPremiumLogin={handleOpenPremiumCourse}
  />`
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx patched for PremiumCourseView props');
