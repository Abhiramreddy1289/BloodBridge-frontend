const guides = [
  { 
    title: 'Eligibility Check', 
    icon: '📋',
    steps: ['Age: 18-65 years', 'Weight: >45kg', 'Hemoglobin: >12.5 g/dL', 'No fever or infection in last 48 hours'],
    color: 'bg-blue-50 text-blue-600'
  },
  { 
    title: 'Before Donation', 
    icon: '🍎',
    steps: ['Have a healthy meal', 'Stay hydrated (drink 2-3 glasses of water)', 'Get 8 hours of sleep', 'Avoid alcohol for 24 hours'],
    color: 'bg-emerald-50 text-emerald-600'
  },
  { 
    title: 'During Donation', 
    icon: '💉',
    steps: ['Stay relaxed', 'Breathe normally', 'Takes only 10-15 minutes', 'Staff will monitor you throughout'],
    color: 'bg-purple-50 text-purple-600'
  },
  { 
    title: 'After Care', 
    icon: '💧',
    steps: ['Rest for 15 minutes', 'Drink plenty of fluids', 'Avoid heavy lifting for 12 hours', 'Have a snack provided at the site'],
    color: 'bg-orange-50 text-orange-600'
  },
];

function Guides() {
  return (
    <section className="space-y-16 py-10">
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <span className="px-4 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-black uppercase tracking-widest">Knowledge Base</span>
        <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">Your Guide to Safe & Impactful Donation</h1>
        <p className="text-xl text-slate-500 font-medium">Everything you need to prepare for your journey as a life-saver.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <div key={guide.title} className="group relative rounded-[2.5rem] bg-white p-8 border border-slate-100 shadow-soft transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${guide.color.split(' ')[0]}`}></div>
            
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-3xl mb-8 ${guide.color}`}>
              {guide.icon}
            </div>
            
            <h2 className="text-2xl font-black text-slate-900 mb-6">{guide.title}</h2>
            
            <ul className="space-y-4">
              {guide.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0"></span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-[3rem] bg-red-600 p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 text-white">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-black">Ready to make a difference?</h2>
          <p className="text-red-100 text-lg font-medium leading-relaxed">Your single donation can save up to three lives. Join thousands of heroes across India who are making a real impact today.</p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-2xl">⚡</span>
              <span className="font-bold">Fast Process</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
              <span className="text-2xl">🛡️</span>
              <span className="font-bold">100% Safe</span>
            </div>
          </div>
        </div>
        <button className="px-10 py-5 bg-white text-red-600 rounded-3xl font-black text-xl hover:shadow-2xl hover:scale-105 transition-all active:scale-95 whitespace-nowrap">
          Register as Donor
        </button>
      </div>
    </section>
  );
}

export default Guides;
