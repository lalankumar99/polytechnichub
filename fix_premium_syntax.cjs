const fs = require('fs');
let content = fs.readFileSync('src/components/PremiumCourseView.tsx', 'utf-8');

// The file currently ends with:
//           </div>
//       </div>
//     </div>
//   );
// };
// We need it to end with:
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

content = content.replace("          </div>\n\n      </div>", "          </div>\n        )}\n      </div>");

fs.writeFileSync('src/components/PremiumCourseView.tsx', content);
