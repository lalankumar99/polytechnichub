const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('premium')) {
    content = content.replace("currentView, setCurrentView] = useState<'home' | 'browse' | 'admin' | 'about'>", "currentView, setCurrentView] = useState<'home' | 'browse' | 'admin' | 'about' | 'premium'>");
    content = content.replace("handleNavigate = (view: 'home' | 'browse' | 'admin' | 'about'", "handleNavigate = (view: 'home' | 'browse' | 'admin' | 'about' | 'premium'");
    fs.writeFileSync('src/App.tsx', content);
}
