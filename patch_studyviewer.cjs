const fs = require('fs');
let content = fs.readFileSync('src/components/StudyViewer.tsx', 'utf-8');

// 1. Add isLink constant
content = content.replace("const isYoutube = file.type === 'youtube';", "const isYoutube = file.type === 'youtube';\n  const isLink = file.type === 'link';");

// 2. Add link to download handler (so we open it)
content = content.replace("if (isYoutube) {\n      window.open(fileApiUrl, '_blank');", 
  "if (isYoutube || isLink) {\n      window.open(fileApiUrl, '_blank');");

// 3. Update the fullscreen wrapper condition
content = content.replace(/if \(!isPdf && !isYoutube && isFullscreen\) \{/g, "if (!isPdf && !isYoutube && !isLink && isFullscreen) {");

// 4. Update the main render block
const linkRenderBlock = `
        {isLink ? (
          <div className="w-full h-full max-w-2xl flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 w-full max-w-md space-y-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Link2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">{file.name}</h2>
                {file.description && (
                  <p className="text-sm text-slate-500 mb-6">{file.description}</p>
                )}
              </div>
              <a 
                href={fileApiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors flex items-center justify-center space-x-2"
              >
                <span>Visit Link</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : isYoutube ? (
`;
content = content.replace("{isYoutube ? (", linkRenderBlock);

// 5. Bottom bar text handler
content = content.replace("(!isPdf && !isYoutube) ? (", "(!isPdf && !isYoutube && !isLink) ? (");
content = content.replace("file.type === 'youtube' ? 'VIDEO'", "file.type === 'youtube' ? 'VIDEO' : file.type === 'link' ? 'LINK'");
content = content.replace("isYoutube ? <Youtube className=\"w-4 h-4\" /> : isPdf ? <FileText className=\"w-4 h-4\" /> : <Code className=\"w-4 h-4\" />", 
  "isLink ? <Link2 className=\"w-4 h-4\" /> : isYoutube ? <Youtube className=\"w-4 h-4\" /> : isPdf ? <FileText className=\"w-4 h-4\" /> : <Code className=\"w-4 h-4\" />");

// 6. Import Link2 and ExternalLink
if (!content.includes('Link2,')) {
    content = content.replace("import {\n  ArrowLeft,", "import {\n  ArrowLeft,\n  Link2,\n  ExternalLink,");
}

fs.writeFileSync('src/components/StudyViewer.tsx', content);
