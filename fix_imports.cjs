const fs = require('fs');
let content = fs.readFileSync('src/components/PremiumCourseView.tsx', 'utf-8');
content = content.replace("import { MessageCircle, PhoneCall, CheckCircle } from 'lucide-react';", "import { MessageCircle, PhoneCall } from 'lucide-react';");
fs.writeFileSync('src/components/PremiumCourseView.tsx', content);
