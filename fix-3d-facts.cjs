const fs = require('fs');
let content = fs.readFileSync('src/components/HomePage.tsx', 'utf-8');

const replacement = `      {/* WHY POLYTECHNIC APP SECTION WITH 3D FACTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 border border-slate-200/80 overflow-hidden relative">
          
          <div className="text-center max-w-2xl mx-auto mb-10 relative z-10">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Engineered for Polytechnic Success</h2>
            <p className="text-sm text-slate-600 mt-2">Direct access to curriculum folders without distracting clutter.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            
            <div className="group [perspective:1000px]">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(5deg)_rotateY(-5deg)_translateZ(10px)] group-hover:shadow-xl group-hover:border-blue-300">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold [transform:translateZ(20px)] shadow-sm">
                  1
                </div>
                <h3 className="font-bold text-base text-slate-900 [transform:translateZ(20px)]">Unlimited Folders</h3>
                <p className="text-xs text-slate-600 leading-relaxed [transform:translateZ(15px)]">
                  Branch &rarr; Semester &rarr; Subject hierarchy mirroring your exact syllabus structure with deep breadcrumb tracing.
                </p>
              </div>
            </div>

            <div className="group [perspective:1000px]">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(5deg)_rotateY(-5deg)_translateZ(10px)] group-hover:shadow-xl group-hover:border-emerald-300">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold [transform:translateZ(20px)] shadow-sm">
                  2
                </div>
                <h3 className="font-bold text-base text-slate-900 [transform:translateZ(20px)]">Immersive Viewer</h3>
                <p className="text-xs text-slate-600 leading-relaxed [transform:translateZ(15px)]">
                  Optimized reading viewport with distraction-free landscape mode for clear mathematical and circuit analysis.
                </p>
              </div>
            </div>

            <div className="group [perspective:1000px]">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(5deg)_rotateY(-5deg)_translateZ(10px)] group-hover:shadow-xl group-hover:border-rose-300">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold [transform:translateZ(20px)] shadow-sm">
                  3
                </div>
                <h3 className="font-bold text-base text-slate-900 [transform:translateZ(20px)]">Instant Sync</h3>
                <p className="text-xs text-slate-600 leading-relaxed [transform:translateZ(15px)]">
                  The moment faculty uploads new study materials, they become live for students across all devices instantly.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>`;

const regex = /\{\/\* WHY POLYTECHNIC APP SECTION \*\/\}.*?<\/section>/s;
content = content.replace(regex, replacement);

fs.writeFileSync('src/components/HomePage.tsx', content);
