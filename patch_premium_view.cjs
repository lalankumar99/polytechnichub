const fs = require('fs');
let code = fs.readFileSync('src/components/PremiumCourseView.tsx', 'utf-8');

// Replace the loadAccessAndData logic
code = code.replace(
  /const loadAccessAndData = async \(\) => \{([\s\S]*?)\} finally \{\s*setLoading\(false\);\s*\}\s*\};\s*loadAccessAndData\(\);/g,
  `const loadAccessAndData = async () => {
    if (!user) {
      setAccessStatus('none');
      setLoading(false);
      return;
    }
    try {
      if (user.status === 'approved') {
        setAccessStatus('approved');
        const courseItems = await api.getPremiumItems(course.id);
        setItems(courseItems.filter((i: any) => i.status === 'published'));
      } else {
        setAccessStatus('pending'); // Or just let them see they need approval
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  loadAccessAndData();`
);

// We also should change the "user" prop definition to expect the premiumUser
// But wait, the form inside PremiumCourseView creates Firebase Auth users.
// If we want to use the unified PremiumPortal, we could just replace the form with a button that triggers a login/register via PremiumPortal.
// Let's modify the PremiumCourseView to just show a simpler message if access is denied, telling them to login via the Premium button.
