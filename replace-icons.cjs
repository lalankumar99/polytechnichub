const fs = require('fs');


// Use hardcoded files instead of glob for simplicity
const files = [
  'src/components/AdminDashboard.tsx',
  'src/components/BrowseView.tsx',
  'src/components/GlobalSearchModal.tsx',
  'src/components/HomePage.tsx',
  'src/components/StudyViewer.tsx',
  'src/components/ViewingRequirementModal.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // Replace colors & badges based on isPdf
  // Example: isPdf ? 'bg-rose-500' : 'bg-emerald-500' -> 'bg-indigo-500'
  content = content.replace(/isPdf \? 'bg-rose-500' : 'bg-emerald-500'/g, "'bg-indigo-500'");
  content = content.replace(/isPdf \? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'/g, "'bg-indigo-50 text-indigo-600'");
  content = content.replace(/isPdf \? 'text-rose-500' : 'text-emerald-500'/g, "'text-indigo-500'");
  content = content.replace(/isPdf\n?\s*\?\s*'bg-rose-50 text-rose-600'\n?\s*:\s*'bg-emerald-50 text-emerald-600'/g, "'bg-indigo-50 text-indigo-600'");
  content = content.replace(/isPdf\n?\s*\?\s*'text-rose-600'\n?\s*:\s*'text-emerald-600'/g, "'text-indigo-600'");
  content = content.replace(/isPdf \? 'bg-rose-500\/20 text-rose-400 border-rose-500\/30' : 'bg-emerald-500\/20 text-emerald-400 border-emerald-500\/30'/g, "'bg-indigo-500/20 text-indigo-400 border-indigo-500/30'");
  content = content.replace(/isPdf \? 'bg-rose-500\/20 text-rose-400 border border-rose-500\/30' : 'bg-emerald-500\/20 text-emerald-400 border border-emerald-500\/30'/g, "'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'");
  
  // Icons
  content = content.replace(/isPdf \? <FileText className="w-5 h-5" \/> : <Code className="w-5 h-5" \/>/g, "<FileText className=\"w-5 h-5\" />");
  content = content.replace(/isPdf \? <FileText className="w-4 h-4" \/> : <Code className="w-4 h-4" \/>/g, "<FileText className=\"w-4 h-4\" />");
  content = content.replace(/isFolder \? <Folder className="w-5 h-5" \/> : isPdf \? <FileText className="w-5 h-5" \/> : <Code className="w-5 h-5" \/>/g, "isFolder ? <Folder className=\"w-5 h-5\" /> : <FileText className=\"w-5 h-5\" />");
  content = content.replace(/isFolder \? <Folder className="w-4 h-4 fill-blue-500\/20" \/> : isPdf \? <FileText className="w-4 h-4" \/> : <Code className="w-4 h-4" \/>/g, "isFolder ? <Folder className=\"w-4 h-4 fill-blue-500/20\" /> : <FileText className=\"w-4 h-4\" />");
  content = content.replace(/isFolder \? <Folder className="w-6 h-6 fill-blue-500\/20" \/> : isPdf \? <FileText className="w-6 h-6" \/> : <Code className="w-6 h-6" \/>/g, "isFolder ? <Folder className=\"w-6 h-6 fill-blue-500/20\" /> : <FileText className=\"w-6 h-6\" />");

  content = content.replace(/isPdf \? 'PDF Document' : 'Interactive HTML Guide'/g, "'Study Material'");

  // AdminDashboard specific
  content = content.replace(/upload PDFs\/HTMLs/g, 'upload files');
  content = content.replace(/uploading PDF\/HTML materials/g, 'uploading materials');
  content = content.replace(/PDF Notes/g, 'Files');
  content = content.replace(/totalPdfs/g, 'totalFiles'); // Since totalPdfs now is not correct, we will show totalFiles
  content = content.replace(/Upload PDF/g, 'Upload File');
  content = content.replace(/Write HTML Note/g, 'Write Note');
  content = content.replace(/HTML Study Content/g, 'Note Content');
  content = content.replace(/Create HTML Note/g, 'Create Note');
  content = content.replace(/Create Interactive HTML Study Note/g, 'Create Study Note');

  fs.writeFileSync(file, content);
});

