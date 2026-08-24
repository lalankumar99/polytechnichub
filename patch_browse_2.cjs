const fs = require('fs');

let content = fs.readFileSync('src/components/BrowseView.tsx', 'utf-8');

const dynamicColorsGrid = `
                      <div className={\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 \${
                        isPdf ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                        file.type === 'youtube' ? 'bg-red-50 text-red-600 border border-red-200' :
                        'bg-indigo-50 text-indigo-600 border border-indigo-200'
                      }\`}>
                        {isPdf ? <FileText className="w-5 h-5" /> : 
                         file.type === 'youtube' ? <Youtube className="w-5 h-5" /> :
                         <Code className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className={\`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded border \${
                          isPdf ? 'bg-rose-50 text-rose-600 border-rose-200' :
                          file.type === 'youtube' ? 'bg-red-50 text-red-600 border-red-200' :
                          'bg-indigo-50 text-indigo-600 border-indigo-200'
                        }\`}>
                          {isPdf ? 'PDF' : file.type === 'youtube' ? 'VIDEO' : 'NOTE'}
                        </span>
`;

// Replace the grid view part
content = content.replace(/<div className=\{\`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 \$\{[\s\S]*?'bg-indigo-50 text-indigo-600 border border-indigo-200'[\s\S]*?\}\`\}>[\s\S]*?\{<FileText className="w-5 h-5" \/>\}[\s\S]*?<\/div>[\s\S]*?<div className="min-w-0 flex-1">[\s\S]*?<span className=\{\`text-\[10px\] font-extrabold uppercase px-1\.5 py-0\.5 rounded border \$\{[\s\S]*?'bg-indigo-50 text-indigo-600 border-indigo-200'[\s\S]*?\}\`\}>[\s\S]*?"DOC"[\s\S]*?<\/span>/, dynamicColorsGrid);


const dynamicColorsList = `
                      <div className={\`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 \${
                        isPdf ? 'bg-rose-50 text-rose-600' :
                        file.type === 'youtube' ? 'bg-red-50 text-red-600' :
                        'bg-indigo-50 text-indigo-600'
                      }\`}>
                        {isPdf ? <FileText className="w-4 h-4" /> : 
                         file.type === 'youtube' ? <Youtube className="w-4 h-4" /> :
                         <Code className="w-4 h-4" />}
                      </div>
`;

// Replace the list view part
content = content.replace(/<div className=\{\`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 \$\{[\s\S]*?'bg-indigo-50 text-indigo-600'[\s\S]*?\}\`\}>[\s\S]*?\{<FileText className="w-4 h-4" \/>\}[\s\S]*?<\/div>/, dynamicColorsList);

// Make sure `Youtube` is imported if not already.
if (!content.includes('Youtube,')) {
    content = content.replace("import {\n  Folder,", "import {\n  Folder,\n  Youtube,");
}

fs.writeFileSync('src/components/BrowseView.tsx', content);
