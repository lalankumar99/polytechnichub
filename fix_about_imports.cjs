const fs = require('fs');
let content = fs.readFileSync('src/components/About.tsx', 'utf-8');
content = content.replace("import { BookOpen, Target, Users, Rocket, Award, MessageCircle, Send, CheckCircle } from 'lucide-react';", "import { BookOpen, Target, Users, Rocket, Award, MessageCircle, Send, CheckCircle, Sparkles } from 'lucide-react';");
fs.writeFileSync('src/components/About.tsx', content);
