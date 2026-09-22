const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// States
content = content.replace(
  "const [newFolderSemester, setNewFolderSemester] = useState('Semester 1');",
  "const [newFolderSemester, setNewFolderSemester] = useState('Semester 1');\n  const [newFolderIsPremium, setNewFolderIsPremium] = useState(false);"
);
content = content.replace(
  "const [uploadDesc, setUploadDesc] = useState('');",
  "const [uploadDesc, setUploadDesc] = useState('');\n  const [uploadIsPremium, setUploadIsPremium] = useState(false);"
);
content = content.replace(
  "const [htmlNoteDesc, setHtmlNoteDesc] = useState('');",
  "const [htmlNoteDesc, setHtmlNoteDesc] = useState('');\n  const [htmlNoteIsPremium, setHtmlNoteIsPremium] = useState(false);"
);

// Submit handlers
content = content.replace(
  "await api.createFolder(newFolderName.trim(), currentFolderId, newFolderStatus, newFolderDesc, newFolderBranch, newFolderSemester);",
  "await api.createFolder(newFolderName.trim(), currentFolderId, newFolderStatus, newFolderDesc, newFolderBranch, newFolderSemester, newFolderIsPremium);"
);
content = content.replace(
  "setNewFolderDesc('');",
  "setNewFolderDesc('');\n      setNewFolderIsPremium(false);"
);

content = content.replace(
  "await api.uploadFile(uploadFileObj, currentFolderId, uploadStatus, uploadDesc);",
  "await api.uploadFile(uploadFileObj, currentFolderId, uploadStatus, uploadDesc, uploadIsPremium);"
);
content = content.replace(
  "setUploadDesc('');",
  "setUploadDesc('');\n      setUploadIsPremium(false);"
);

content = content.replace(
  "await api.createHtmlNote(htmlNoteName.trim(), currentFolderId, htmlNoteContent, htmlNoteStatus, htmlNoteDesc);",
  "await api.createHtmlNote(htmlNoteName.trim(), currentFolderId, htmlNoteContent, htmlNoteStatus, htmlNoteDesc, undefined, undefined, htmlNoteIsPremium);"
);
content = content.replace(
  "setHtmlNoteDesc('');",
  "setHtmlNoteDesc('');\n      setHtmlNoteIsPremium(false);"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
