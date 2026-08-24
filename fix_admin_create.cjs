const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const oldYoutubeCreate = `await api.createItem({
        type: 'youtube',
        name: youtubeName.trim(),
        parentId: currentFolderId,
        status: youtubeStatus,
        description: youtubeDesc.trim(),
        fileUrl: youtubeUrl.trim(),
        size: 0
      });`;
const newYoutubeCreate = `await api.createFileRecord(
        youtubeName.trim(),
        'youtube',
        youtubeUrl.trim(),
        0,
        currentFolderId,
        youtubeStatus,
        youtubeDesc.trim(),
        newFolderBranch,
        newFolderSemester
      );`;

const oldLinkCreate = `await api.createItem({
        type: 'link',
        name: linkName.trim(),
        parentId: currentFolderId,
        status: linkStatus,
        description: linkDesc.trim(),
        fileUrl: linkUrl.trim(),
        size: 0
      });`;
const newLinkCreate = `await api.createFileRecord(
        linkName.trim(),
        'link',
        linkUrl.trim(),
        0,
        currentFolderId,
        linkStatus,
        linkDesc.trim(),
        newFolderBranch,
        newFolderSemester
      );`;

content = content.replace(oldYoutubeCreate, newYoutubeCreate);
content = content.replace(oldLinkCreate, newLinkCreate);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
