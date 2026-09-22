const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPremiumManager.tsx', 'utf-8');

// 1. Add isSaving state
if (!content.includes('const [isSaving, setIsSaving]')) {
    content = content.replace(
        "const [loading, setLoading] = useState(true);", 
        "const [loading, setLoading] = useState(true);\n  const [isSaving, setIsSaving] = useState(false);"
    );
}

// 2. Update handleCourseSubmit
content = content.replace(
    "const handleCourseSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    try {",
    "const handleCourseSubmit = async (e: React.FormEvent) => {\n    e.preventDefault();\n    setIsSaving(true);\n    try {"
);

content = content.replace(
    "      setShowCourseModal(false);\n      loadData();\n    } catch (err) {\n      console.error(err);\n    }\n  };",
    "      setShowCourseModal(false);\n      loadData();\n    } catch (err: any) {\n      console.error(err);\n      alert('Failed to save course: ' + err.message);\n    } finally {\n      setIsSaving(false);\n    }\n  };"
);

// 3. Update the submit button
content = content.replace(
    `<button type="submit" className="px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors flex items-center shadow-md">
                  <Save className="w-4 h-4 mr-2" />
                  Save Course
                </button>`,
    `<button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-colors flex items-center shadow-md disabled:opacity-50">
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isSaving ? 'Saving...' : 'Save Course'}
                </button>`
);

fs.writeFileSync('src/components/AdminPremiumManager.tsx', content);
