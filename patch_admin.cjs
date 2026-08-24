const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

// 1. Add state variables for link
const linkStates = `
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkDesc, setLinkDesc] = useState('');
  const [linkStatus, setLinkStatus] = useState<'published' | 'draft'>('published');
`;
content = content.replace("const [showYoutubeModal, setShowYoutubeModal] = useState(false);", linkStates + "\n  const [showYoutubeModal, setShowYoutubeModal] = useState(false);");

// 2. Add handleCreateLink function
const createLinkFunc = `
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkName.trim() || !linkUrl.trim()) return;
    try {
      await api.createFile({
        name: linkName.trim(),
        type: 'link',
        parentId: currentFolderId,
        status: linkStatus,
        size: 0,
        fileUrl: linkUrl.trim(),
        description: linkDesc.trim(),
        branch: currentFolderBranch,
        semester: currentFolderSemester
      });
      setShowLinkModal(false);
      setLinkName('');
      setLinkUrl('');
      setLinkDesc('');
      setLinkStatus('published');
      triggerSuccess('Link added successfully.');
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to add link');
    }
  };
`;
content = content.replace("const handleCreateYoutube = async", createLinkFunc + "\n\n  const handleCreateYoutube = async");

// 3. Add Add Link Button
const linkButton = `
                  <button
                    onClick={() => setShowLinkModal(true)}
                    className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-teal-50 border border-teal-100 hover:border-teal-300 hover:shadow-md transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Link2 className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-teal-900">Add Link</span>
                  </button>
`;
content = content.replace(/<button[\s\S]*?onClick=\{.*?setShowYoutubeModal\(true\)\}[\s\S]*?<\/button>/, match => match + "\n" + linkButton);

// 4. Update the rename logic to handle link URL too
content = content.replace("renameItem.type === 'youtube'", "renameItem.type === 'youtube' || renameItem.type === 'link'");
content = content.replace("renameItem?.type === 'youtube'", "renameItem?.type === 'youtube' || renameItem?.type === 'link'");
content = content.replace("YouTube URL", "URL (YouTube or Link)");

// 5. Import Link2
if (!content.includes('Link2,')) {
    content = content.replace("import {\n  Folder,", "import {\n  Folder,\n  Link2,");
}

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
