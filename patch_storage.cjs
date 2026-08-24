const fs = require('fs');

let content = fs.readFileSync('server/storage.ts', 'utf-8');

const newStatsReturn = `    const htmls = items.filter(i => i.type === 'html');
    const youtubeVideos = items.filter(i => i.type === 'youtube');
    const published = items.filter(i => i.status === 'published');
    const draft = items.filter(i => i.status === 'draft');
    const unpublished = items.filter(i => i.status === 'unpublished');
    const totalViews = items.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

    return {
      totalFolders: folders.length,
      totalFiles: files.length,
      totalPdfs: pdfs.length,
      totalHtmls: htmls.length,
      totalYoutubeVideos: youtubeVideos.length,
      publishedCount: published.length,
      draftCount: draft.length,
      unpublishedCount: unpublished.length,
      totalViews
    };`;

content = content.replace(/const htmls = items\.filter\(i => i\.type === 'html'\);[\s\S]*?totalViews\s*\};/, newStatsReturn);

fs.writeFileSync('server/storage.ts', content);
