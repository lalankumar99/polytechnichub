const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('studentUser')) {
    content = content.replace(
        "import { api, authState } from './services/api';",
        "import { api, authState } from './services/api';\nimport { auth } from './firebase';\nimport { onAuthStateChanged, User } from 'firebase/auth';"
    );
    content = content.replace(
        "const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authState.getUser());",
        "const [adminUser, setAdminUser] = useState<AdminUser | null>(() => authState.getUser());\n  const [studentUser, setStudentUser] = useState<User | null>(null);"
    );
    
    const studentAuthHook = `
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setStudentUser(user);
    });
    return () => unsubscribe();
  }, []);
`;
    content = content.replace(
        "// Load public data",
        studentAuthHook + "\n  // Load public data"
    );
    
    fs.writeFileSync('src/App.tsx', content);
}
