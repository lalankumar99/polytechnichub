import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MonitorPlay, Youtube, Loader2, AlertCircle } from 'lucide-react';

export default function Studiverse() {
  const [activeTab, setActiveTab] = useState<'live' | 'vault'>('live');
  const [liveEmbed, setLiveEmbed] = useState<string>('');
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getStudiverseData();
      setLiveEmbed(data.liveEmbed || '');
      setVideos(data.videos || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      let videoId = '';
      if (url.includes('youtube.com/watch')) {
        videoId = new URL(url).searchParams.get('v') || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1].split('?')[0];
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    } catch (e) {
      return url;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="bg-slate-900 text-white pt-16 pb-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900 z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
            Studiverse
          </h1>
          <p className="text-lg text-slate-300">
            Your centralized hub for live classes and recorded video lessons.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="bg-white rounded-2xl shadow-sm p-2 flex space-x-2 w-full md:w-fit mx-auto border border-slate-100">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'live' ? 'bg-cyan-50 text-cyan-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <MonitorPlay className="w-5 h-5" />
            <span>Live Classroom</span>
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-1 md:flex-none flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'vault' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Youtube className="w-5 h-5" />
            <span>Video Vault</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start space-x-3 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Live Classroom */}
        {activeTab === 'live' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {liveEmbed ? (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 p-2">
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900" dangerouslySetInnerHTML={{ __html: liveEmbed }} />
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <MonitorPlay className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700">No Live Session</h3>
                <p className="text-slate-500 mt-2">There is no active live classroom streaming right now.</p>
              </div>
            )}
          </div>
        )}

        {/* Video Vault */}
        {activeTab === 'vault' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {videos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 overflow-hidden group">
                    <div className="aspect-video w-full bg-slate-100 relative">
                      <iframe 
                        className="w-full h-full absolute inset-0"
                        src={getYouTubeEmbedUrl(video.url)}
                        title={video.title}
                        allowFullScreen
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-sm text-slate-500 line-clamp-3">{video.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <Youtube className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700">Vault is Empty</h3>
                <p className="text-slate-500 mt-2">Check back later for recorded lessons.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
