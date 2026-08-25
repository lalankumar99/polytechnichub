const fs = require('fs');
let content = fs.readFileSync('src/firebase.ts', 'utf-8');

if (!content.includes('getAuth')) {
    content = content.replace(
        'import { getStorage } from "firebase/storage";',
        'import { getStorage } from "firebase/storage";\nimport { getAuth } from "firebase/auth";\nimport { getFirestore } from "firebase/firestore";'
    );
    content = content.replace(
        'export { app, storage };',
        'const auth = getAuth(app);\nconst db = getFirestore(app);\nexport { app, storage, auth, db };'
    );
    fs.writeFileSync('src/firebase.ts', content);
}
