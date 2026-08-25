const fs = require('fs');
let content = fs.readFileSync('src/components/About.tsx', 'utf-8');

const feedbackImport = `import React, { useState } from 'react';
import { BookOpen, Target, Users, Rocket, Award, MessageCircle, Send, CheckCircle } from 'lucide-react';
import { api } from '../services/api';`;

content = content.replace(/import React.*?from 'react';\nimport {.*?lucide-react';/, feedbackImport);

const feedbackFormSection = `
      {/* Feedback Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">We Value Your Feedback</h2>
            <p className="text-lg text-slate-600">Help us improve Polytechnic Hub by sharing your suggestions and feedback.</p>
          </div>
          
          <div className="bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-100">
            {isSubmitting ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-lg font-medium text-slate-600">Submitting your feedback...</p>
              </div>
            ) : submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
                <p className="text-slate-600 mb-6">Your feedback has been successfully submitted. We appreciate your time.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Submit Another Response
                </button>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                    <input 
                      type="text" 
                      id="name"
                      required
                      value={feedbackData.name}
                      onChange={(e) => setFeedbackData({...feedbackData, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                    <input 
                      type="email" 
                      id="email"
                      required
                      value={feedbackData.email}
                      onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-slate-700 mb-2">Mobile Number *</label>
                  <input 
                    type="tel" 
                    id="mobile"
                    required
                    value={feedbackData.mobile}
                    onChange={(e) => setFeedbackData({...feedbackData, mobile: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="Your mobile number"
                  />
                </div>
                <div>
                  <label htmlFor="suggestion" className="block text-sm font-medium text-slate-700 mb-2">Suggestion / Feedback *</label>
                  <textarea 
                    id="suggestion"
                    required
                    rows={5}
                    value={feedbackData.suggestion}
                    onChange={(e) => setFeedbackData({...feedbackData, suggestion: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-y"
                    placeholder="Tell us what you think or how we can improve..."
                  ></textarea>
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Send size={20} />
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
`;

const stateHooks = `  // Feedback State
  const [feedbackData, setFeedbackData] = useState({ name: '', email: '', mobile: '', suggestion: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await api.submitFeedback(feedbackData);
      setSubmitted(true);
      setFeedbackData({ name: '', email: '', mobile: '', suggestion: '' });
    } catch (err) {
      setError('Failed to submit feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };
`;

content = content.replace("export default function About() {", "export default function About() {\n" + stateHooks);
content = content.replace("{/* CTA Section */}", feedbackFormSection + "\n      {/* CTA Section */}");

fs.writeFileSync('src/components/About.tsx', content);
