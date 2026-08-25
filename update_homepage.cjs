const fs = require('fs');
let content = fs.readFileSync('src/components/HomePage.tsx', 'utf-8');

if (!content.includes('PremiumSection')) {
    content = content.replace(
        "import { usePWAInstall } from '../hooks/usePWAInstall';",
        "import { usePWAInstall } from '../hooks/usePWAInstall';\nimport { PremiumSection } from './PremiumSection';\nimport { PremiumCourse } from '../types';"
    );
    
    content = content.replace(
        "interface HomePageProps {",
        "interface HomePageProps {\n  onOpenPremiumCourse?: (course: PremiumCourse) => void;"
    );

    content = content.replace(
        "stats,\n  items",
        "stats,\n  items,\n  onOpenPremiumCourse"
    );

    content = content.replace(
        "</main>",
        `
        {onOpenPremiumCourse && <PremiumSection onOpenCourse={onOpenPremiumCourse} />}
      </main>`
    );

    fs.writeFileSync('src/components/HomePage.tsx', content);
}
