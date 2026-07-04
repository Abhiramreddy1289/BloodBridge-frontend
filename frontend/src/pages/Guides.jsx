import { Link } from 'react-router-dom';

const guides = [
  {
    title: 'Eligibility Check',
    badge: 'Check',
    steps: ['Age: 18-65 years', 'Weight: >45kg', 'Hemoglobin: >12.5 g/dL', 'No fever or infection in last 48 hours'],
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Before Donation',
    badge: 'Prep',
    steps: ['Have a healthy meal', 'Stay hydrated with 2-3 glasses of water', 'Get 8 hours of sleep', 'Avoid alcohol for 24 hours'],
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    title: 'During Donation',
    badge: 'Donate',
    steps: ['Stay relaxed', 'Breathe normally', 'Donation usually takes 10-15 minutes', 'Staff will monitor you throughout'],
    color: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'After Care',
    badge: 'Recover',
    steps: ['Rest for 15 minutes', 'Drink plenty of fluids', 'Avoid heavy lifting for 12 hours', 'Have a snack provided at the site'],
    color: 'bg-orange-50 text-orange-600',
  },
];

function Guides() {
  return (
    <section className="space-y-16 py-10">
      <div className="mx-auto max-w-3xl space-y-4 text-center">
        <span className="rounded-full bg-red-50 px-4 py-1.5 text-sm font-black uppercase tracking-widest text-red-600">Knowledge Base</span>
        <h1 className="text-5xl font-black leading-tight tracking-tight text-slate-900">Your Guide to Safe & Impactful Donation</h1>
        <p className="text-xl font-medium text-slate-500">Everything you need to prepare for your journey as a life-saver.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {guides.map((guide) => (
          <div key={guide.title} className="group relative overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-soft transition-all hover:-translate-y-2 hover:shadow-2xl">
            <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${guide.color.split(' ')[0]}`} />

            <div className={`mb-8 flex h-16 w-20 items-center justify-center rounded-[1.5rem] px-3 text-center text-xs font-black uppercase tracking-widest ${guide.color}`}>
              {guide.badge}
            </div>

            <h2 className="mb-6 text-2xl font-black text-slate-900">{guide.title}</h2>

            <ul className="space-y-4">
              {guide.steps.map((step) => (
                <li key={step} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-300" />
                  {step}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-12 rounded-[3rem] bg-red-600 p-12 text-white lg:flex-row lg:p-16">
        <div className="flex-1 space-y-6">
          <h2 className="text-4xl font-black">Ready to make a difference?</h2>
          <p className="text-lg font-medium leading-relaxed text-red-100">Your single donation can save up to three lives. Join thousands of heroes across India who are making a real impact today.</p>
          <div className="flex flex-wrap gap-4 pt-4">
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
              <span className="text-sm font-black">Fast</span>
              <span className="font-bold">Fast Process</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2">
              <span className="text-sm font-black">Safe</span>
              <span className="font-bold">100% Safe</span>
            </div>
          </div>
        </div>
        <Link to="/register" className="whitespace-nowrap rounded-3xl bg-white px-10 py-5 text-xl font-black text-red-600 transition-all hover:scale-105 hover:shadow-2xl active:scale-95">
          Register as Donor
        </Link>
      </div>
    </section>
  );
}

export default Guides;
