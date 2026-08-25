const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const modalsStart = `{/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW FOLDER (Unlimited Nesting) */}`;
const newModalsStart = `
        </>
      )}
      
      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW FOLDER (Unlimited Nesting) */}`;
      
if (content.includes(modalsStart)) {
    content = content.replace(modalsStart, newModalsStart);
    fs.writeFileSync('src/components/AdminDashboard.tsx', content);
    console.log("Updated correctly.");
} else {
    console.log("Could not find modals string");
}
