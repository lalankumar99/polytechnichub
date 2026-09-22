const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const youtubeAndLinkHandlers = `
  const handleCreateYoutube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeName.trim() || !youtubeUrl.trim() || !currentFolderId) return;

    setLoading(true);
    try {
      await api.createItem({
        type: 'youtube',
        name: youtubeName.trim(),
        parentId: currentFolderId,
        status: youtubeStatus,
        description: youtubeDesc.trim(),
        fileUrl: youtubeUrl.trim(),
        size: 0
      });
      setShowYoutubeModal(false);
      setYoutubeName('');
      setYoutubeUrl('');
      setYoutubeDesc('');
      triggerSuccess('YouTube video added successfully.');
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to add YouTube video');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkName.trim() || !linkUrl.trim() || !currentFolderId) return;

    setLoading(true);
    try {
      await api.createItem({
        type: 'link',
        name: linkName.trim(),
        parentId: currentFolderId,
        status: linkStatus,
        description: linkDesc.trim(),
        fileUrl: linkUrl.trim(),
        size: 0
      });
      setShowLinkModal(false);
      setLinkName('');
      setLinkUrl('');
      setLinkDesc('');
      triggerSuccess('Link added successfully.');
      await loadAdminData();
    } catch (err: any) {
      setError(err.message || 'Failed to add link');
    } finally {
      setLoading(false);
    }
  };
`;

if (!content.includes('handleCreateYoutube')) {
    content = content.replace("const handleCreateFolder =", youtubeAndLinkHandlers + "\n  const handleCreateFolder =");
}

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
