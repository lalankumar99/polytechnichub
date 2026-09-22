const fs = require('fs');

let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

// 1. Add `const isYoutube = file.type === 'youtube';` right after `const isPdf`
content = content.replace("const isPdf = file.type === 'pdf';", "const isPdf = file.type === 'pdf';\n  const isYoutube = file.type === 'youtube';");

// 2. Change `!isPdf && isFullscreen` to `(!isPdf && !isYoutube) && isFullscreen`
content = content.replace(/if \(!isPdf && isFullscreen\) \{/g, "if (!isPdf && !isYoutube && isFullscreen) {");

// 3. Update the main render block `        {isPdf ? (`
const newRenderBlock = `
        {isYoutube ? (
          <div className="w-full h-full max-w-5xl flex flex-col items-center justify-center p-2 sm:p-6">
            <div className="w-full aspect-video rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-black">
              <iframe
                src={file.fileUrl?.includes('watch?v=') 
                  ? file.fileUrl.replace('watch?v=', 'embed/').split('&')[0] 
                  : file.fileUrl}
                title={file.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          </div>
        ) : isPdf ? (
`;

content = content.replace("{isPdf ? (", newRenderBlock);

// 4. Update the bottom bar logic
content = content.replace(/\{!isPdf \? \(/g, "{(!isPdf && !isYoutube) ? (");

// 5. Add Youtube icon import
if (!content.includes('Youtube')) {
  content = content.replace("import {\n  ArrowLeft", "import {\n  ArrowLeft,\n  Youtube");
}

// 6. Update the top bar icon
content = content.replace(/\{isPdf \? <FileText className="w-4 h-4" \/> : <Code className="w-4 h-4" \/>\}/g, 
  "{isYoutube ? <Youtube className=\"w-4 h-4\" /> : isPdf ? <FileText className=\"w-4 h-4\" /> : <Code className=\"w-4 h-4\" />}");

content = content.replace(/\{file\.type\.toUpperCase\(\)\}/g, "{file.type === 'youtube' ? 'VIDEO' : file.type.toUpperCase()}");


fs.writeFileSync('src/components/StudyViewer.tsx', content);
