const fs = require('fs');
let content = fs.readFileSync('src/components/HomePage.tsx', 'utf-8');

// Replace standard props
content = content.replace(
  'onOpenPremiumCourse?: (course: PremiumCourse) => void;',
  'onOpenPremiumCourse?: () => void;'
);

content = content.replace(
  '<button \n              onClick={() => onNavigateBrowse(null)}\n              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-900/30 transition-all text-sm"',
  `<button 
              onClick={() => onNavigateBrowse(null)}
              className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-900/30 transition-all text-sm"`
);

content = content.replace(
  '<button \n              onClick={onOpenSearch}\n              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-xl font-bold border border-slate-700 transition-all text-sm"\n            >',
  `<button 
              onClick={onOpenSearch}
              className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-8 py-3.5 rounded-xl font-bold border border-slate-700 transition-all text-sm"
            >`
);

content = content.replace(
  '          </div>\n\n          <div className="pt-6 flex justify-center text-xs text-slate-400 font-medium space-x-6">',
  `          </div>
          
          <div className="pt-2">
            <button 
              onClick={() => onOpenPremiumCourse && onOpenPremiumCourse()}
              className="mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 px-8 py-4 rounded-xl font-bold shadow-lg shadow-amber-900/20 transition-all transform hover:-translate-y-0.5 mx-auto w-full sm:w-auto"
            >
              <Sparkles className="w-5 h-5 text-slate-900" />
              <span>Register for Premium Courses</span>
            </button>
          </div>

          <div className="pt-6 flex justify-center text-xs text-slate-400 font-medium space-x-6">`
);

content = content.replace(
  "{onOpenPremiumCourse && (\n        <PremiumSection onOpenCourse={onOpenPremiumCourse} />\n      )}",
  ""
);

content = content.replace(
  "import { PremiumSection } from './PremiumSection';",
  ""
);

content = content.replace(
  "import { PremiumCourse } from '../types';",
  ""
);

fs.writeFileSync('src/components/HomePage.tsx', content);
