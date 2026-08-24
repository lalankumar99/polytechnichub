import React from 'react';
import { BookOpen, Users, Rocket, Target, Award, ChevronRight, Sparkles, MessageCircle } from 'lucide-react';

export default function About() {
  // WhatsApp link format (without '+' and spaces)
  const whatsappLink = "https://wa.me/919296783086";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-blue-50 z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-6 animate-pulse">
            <Sparkles size={16} />
            <span>Welcome to the future of learning</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            Empowering the Next Generation of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Polytechnic Engineers
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed">
            Polytechnic Hub is more than just a website; it's a movement to provide top-notch resources, guidance, and a thriving community for diploma students across the nation.
          </p>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Bridging the Gap Between <span className="text-indigo-600">Theory and Industry</span>
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed">
                We observed that while degree students have abundant resources, polytechnic and diploma students often struggle to find relevant, simplified, and practical study materials. 
              </p>
              <p className="text-slate-600 text-lg leading-relaxed">
                At Polytechnic Hub, we curate high-quality notes, project ideas, and career roadmaps specifically tailored for the diploma curriculum, ensuring you are industry-ready from day one.
              </p>
              <ul className="space-y-4 mt-6">
                {[
                  '100% Free & Accessible Study Materials',
                  'Guidance for Lateral Entry (B.Tech) Exams',
                  'Latest Industry Trends & Tech Updates'
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <BookOpen className="text-indigo-600 mb-4" size={32} />
                <h3 className="font-bold text-slate-900 text-lg mb-2">Smart Notes</h3>
                <p className="text-sm text-slate-600">Simplified, exam-oriented study materials.</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow transform translate-y-4 md:translate-y-8">
                <Target className="text-blue-600 mb-4" size={32} />
                <h3 className="font-bold text-slate-900 text-lg mb-2">Career Focus</h3>
                <p className="text-sm text-slate-600">Job updates and interview preparation tips.</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <Users className="text-purple-600 mb-4" size={32} />
                <h3 className="font-bold text-slate-900 text-lg mb-2">Community</h3>
                <p className="text-sm text-slate-600">Connect with peers and seniors.</p>
              </div>
              <div className="bg-teal-50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow transform translate-y-4 md:translate-y-8">
                <Rocket className="text-teal-600 mb-4" size={32} />
                <h3 className="font-bold text-slate-900 text-lg mb-2">Projects</h3>
                <p className="text-sm text-slate-600">Innovative mini & major project ideas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
            
            {/* Image / Graphic Side */}
            <div className="md:w-2/5 bg-indigo-600 relative overflow-hidden flex flex-col items-center justify-center p-10 text-white text-center">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
              <div className="relative z-10">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white shadow-2xl mb-6 mx-auto overflow-hidden bg-indigo-100 flex items-center justify-center">
                  {/* Updated Image Tag with lalan.png */}
                  <img 
                    src="/lalan.png" 
                    alt="Lalan Kumar - Founder of Polytechnic Hub" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback icon if image is missing during development
                      (e.target as HTMLImageElement).src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lalan&backgroundColor=c0aede';
                    }}
                  />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-1">Lalan Kumar</h3>
                <p className="text-indigo-200 font-medium tracking-wide uppercase text-sm">Founder & Creator</p>
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-indigo-600 mb-4">
                <Award size={24} />
                <span className="font-semibold uppercase tracking-wider text-sm">The Story Behind The Hub</span>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-4">
                "Education should empower, not overwhelm."
              </h4>
              <p className="text-slate-600 leading-relaxed mb-6">
                As a passionate tech enthusiast and visionary, Lalan Kumar realized the struggles of polytechnic students firsthand. The lack of structured syllabus material and the confusion around post-diploma career choices inspired him to take action.
              </p>
              <p className="text-slate-600 leading-relaxed mb-8">
                Polytechnic Hub was born out of Lalan's dedication to creating a single, reliable platform where students can find everything from semester notes to placement guidance. His mission is simple: to make every diploma student confident and job-ready.
              </p>
              
              <div className="flex gap-4">
                {/* Updated WhatsApp Link */}
                <a 
                  href={whatsappLink}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                  <MessageCircle size={20} />
                  Connect on WhatsApp
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to upgrade your Polytechnic Journey?</h2>
        <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of students who are already learning and growing with Polytechnic Hub.
        </p>
        <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-300">
          Explore Study Materials
        </button>
      </section>

    </div>
  );
}