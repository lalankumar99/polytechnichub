const fs = require('fs');

function replaceText(file) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/HTML Guides/g, "Study Guides");
  content = content.replace(/totalHtmls/g, "totalFiles"); // since we want to show generic counts
  content = content.replace(/PDFs\/HTMLs/g, "materials");
  content = content.replace(/PDFs, and interactive reference guides/g, "documents and reference guides");
  content = content.replace(/PDFs/g, "Documents");
  content = content.replace(/Published PDFs/g, "Published Documents");
  content = content.replace(/PDF Document/g, "Document");
  content = content.replace(/Interactive HTML Guide/g, "Document");
  content = content.replace(/PDF Reader Preview/g, "Document Preview");
  content = content.replace(/Open PDF in New Window/g, "Open Document in New Window");
  content = content.replace(/Download Study Material as PDF/g, "Download Study Material");
  
  // Also remove .html and .pdf display from the UI in name renderings.
  // Instead of replacing every instance of file.name, we can just let it be, but the user requested: "only its name will be visible." 
  // We can do a string replace in the render. E.g. {item.name} -> {item.name.replace(/\.(pdf|html)$/i, '')}
  content = content.replace(/\{item\.name\}/g, "{item.name.replace(/\\.(pdf|html)$/i, '')}");
  content = content.replace(/\{file\.name\}/g, "{file.name.replace(/\\.(pdf|html)$/i, '')}");
  content = content.replace(/\{activeViewingFile\.name\}/g, "{activeViewingFile.name.replace(/\\.(pdf|html)$/i, '')}");
  content = content.replace(/\{selectedFileForRequirement\.name\}/g, "{selectedFileForRequirement.name.replace(/\\.(pdf|html)$/i, '')}");

  fs.writeFileSync(file, content);
}

const files = [
  'src/components/AdminDashboard.tsx',
  'src/components/BrowseView.tsx',
  'src/components/GlobalSearchModal.tsx',
  'src/components/HomePage.tsx',
  'src/components/StudyViewer.tsx',
  'src/components/ViewingRequirementModal.tsx'
];

files.forEach(replaceText);
