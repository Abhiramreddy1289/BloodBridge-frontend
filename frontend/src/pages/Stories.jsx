import { useEffect, useState } from 'react';
import contentService from '../services/contentService';

function Stories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const data = await contentService.getStories();
        setStories(data);
      } catch (err) {
        console.error('Failed to fetch stories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <section className="space-y-16 py-10">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-black uppercase tracking-widest">Community Impact</span>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Every drop tells a story of hope</h1>
        <p className="text-xl text-slate-500 font-medium">Real stories from real heroes who turned a small gesture into a life-saving miracle.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {stories.map((story) => (
            <div key={story._id} className="group relative rounded-[2.5rem] bg-white p-10 border border-slate-100 shadow-soft transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-6 left-6 text-6xl text-red-100 font-serif leading-none opacity-50 group-hover:scale-110 transition-transform">“</div>
              
              <div className="relative z-10 space-y-6">
                <p className="text-slate-700 text-lg font-medium leading-relaxed pt-6">
                  {story.quote}
                </p>
                
                <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-black">
                    {story.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900">{story.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      {story.location} · {story.bloodGroup} Hero
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {stories.length === 0 && (
            <div className="lg:col-span-3 text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold text-xl italic">Be the first to share your story of hope.</p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-[3rem] bg-slate-900 p-12 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full -mr-32 -mt-32"></div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="text-4xl font-black italic">"I never thought my blood could mean the world to someone."</h2>
          <p className="text-slate-400 font-medium">Have you helped someone or received help through BloodBridge? Your story can inspire others to take the first step.</p>
        </div>
      </div>
    </section>
  );
}

export default Stories;
