const fs = require('fs');
let content = fs.readFileSync('src/components/BrowseView.tsx', 'utf-8');

// 1. Grid view dynamic color and text
content = content.replace("file.type === 'youtube' ? 'bg-red-50 text-red-600 border border-red-200' :", 
  "file.type === 'youtube' ? 'bg-red-50 text-red-600 border border-red-200' :\n                        file.type === 'link' ? 'bg-teal-50 text-teal-600 border border-teal-200' :");

content = content.replace("file.type === 'youtube' ? <Youtube className=\"w-5 h-5\" /> :", 
  "file.type === 'youtube' ? <Youtube className=\"w-5 h-5\" /> :\n                         file.type === 'link' ? <Link2 className=\"w-5 h-5\" /> :");

content = content.replace("file.type === 'youtube' ? 'bg-red-50 text-red-600 border-red-200' :", 
  "file.type === 'youtube' ? 'bg-red-50 text-red-600 border-red-200' :\n                          file.type === 'link' ? 'bg-teal-50 text-teal-600 border-teal-200' :");

content = content.replace("isPdf ? 'PDF' : file.type === 'youtube' ? 'VIDEO' : 'NOTE'", 
  "isPdf ? 'PDF' : file.type === 'youtube' ? 'VIDEO' : file.type === 'link' ? 'LINK' : 'NOTE'");

// 2. List view dynamic color and text
content = content.replace("file.type === 'youtube' ? 'bg-red-50 text-red-600' :", 
  "file.type === 'youtube' ? 'bg-red-50 text-red-600' :\n                        file.type === 'link' ? 'bg-teal-50 text-teal-600' :");

content = content.replace("file.type === 'youtube' ? <Youtube className=\"w-4 h-4\" /> :", 
  "file.type === 'youtube' ? <Youtube className=\"w-4 h-4\" /> :\n                         file.type === 'link' ? <Link2 className=\"w-4 h-4\" /> :");

// 3. Import Link2 and ExternalLink
if (!content.includes('Link2,')) {
    content = content.replace("import {\n  Folder,", "import {\n  Folder,\n  Link2,\n  ExternalLink,");
}

fs.writeFileSync('src/components/BrowseView.tsx', content);
