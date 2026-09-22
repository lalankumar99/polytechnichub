const fs = require('fs');
let code = fs.readFileSync('server/storage.ts', 'utf-8');

if (!code.includes('const cleanUndefined')) {
  code = code.replace("import path from 'path';", "import path from 'path';\n\nconst cleanUndefined = (obj: any) => Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));");
}

code = code.replace("await setDoc(doc(db, this.collectionPath, newFolder.id), newFolder);", "await setDoc(doc(db, this.collectionPath, newFolder.id), cleanUndefined(newFolder));");

code = code.replace("await setDoc(doc(db, this.collectionPath, newFile.id), newFile);", "await setDoc(doc(db, this.collectionPath, newFile.id), cleanUndefined(newFile));");

code = code.replace("await updateDoc(doc(db, this.collectionPath, id), updated as any);", "await updateDoc(doc(db, this.collectionPath, id), cleanUndefined(updated));");

// Remove initial data seeding entirely
code = code.replace(/import \{ INITIAL_ITEMS \} from '\.\/initialData';/g, '');
code = code.replace(/console\.log\('Seeding initial data to Firestore\.\.\.'\);\s*for \(const item of INITIAL_ITEMS\) \{\s*await setDoc\(doc\(db, this\.collectionPath, item\.id\), item\);\s*\}\s*console\.log\('Seeding complete\.'\);/g, "console.log('No initial seeding for production.');");

fs.writeFileSync('server/storage.ts', code);
