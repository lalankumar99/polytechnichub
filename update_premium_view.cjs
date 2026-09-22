const fs = require('fs');
let content = fs.readFileSync('src/components/PremiumCourseView.tsx', 'utf-8');

const oldDiv = '<div className="flex flex-col sm:flex-row gap-4 justify-center">';
const newDiv = `<div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  {course.paymentLink && (
                    <a 
                      href={course.paymentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <CreditCard className="w-6 h-6" />
                      Pay Now
                    </a>
                  )}`;

content = content.replace(oldDiv, newDiv);
fs.writeFileSync('src/components/PremiumCourseView.tsx', content);
