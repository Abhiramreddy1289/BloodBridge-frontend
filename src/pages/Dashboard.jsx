import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import contentService from '../services/contentService';
import requestService from '../services/requestService';

function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await requestService.getRequests();
        setRequests(response);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load requests');
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, []);

  const calculateEligibility = () => {
    if (!user?.lastDonationDate) return { eligible: true, daysLeft: 0, percentage: 100 };
    const lastDate = new Date(user.lastDonationDate);
    const today = new Date();
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const daysLeft = 90 - diffDays;
    const percentage = Math.min(100, Math.max(0, (diffDays / 90) * 100));
    return { eligible: daysLeft <= 0, daysLeft: Math.max(0, daysLeft), percentage };
  };

  const eligibility = calculateEligibility();
  const activeRequests = requests.filter((r) => r.status === 'pending').length;
  const completedDonations = requests.filter((r) => r.status === 'completed' && (r.donorId?._id === user?._id || r.donorId === user?._id)).length;
  const hasFulfilledRequest = requests.some(r => 
    r.status === 'completed' && 
    ((r.requesterId?._id || r.requesterId) === user?._id || (r.donorId?._id || r.donorId) === user?._id)
  );

  const [storyQuote, setStoryQuote] = useState('');
  const [storySuccess, setStorySuccess] = useState('');

  const handleShareStory = async () => {
    if (!storyQuote) return;
    try {
      await contentService.createStory(storyQuote);
      setStorySuccess('Your story has been shared! It will be visible on the community page soon.');
      setStoryQuote('');
    } catch (err) {
      console.error('Failed to share story:', err);
    }
  };

  return (
    <section className="space-y-16">
      {/* Share Story Section */}
      {hasFulfilledRequest && (
        <div className="card-premium bg-gradient-to-r from-emerald-500 to-teal-600 border-none !p-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
              <span className="px-4 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">Share Your Heroic Story</span>
              <h2 className="text-4xl font-[1000] tracking-tighter italic">Your action saved a life. <br />Inspire others with your words.</h2>
              <p className="text-emerald-50 text-lg font-medium">Sharing your experience helps build a stronger, more compassionate community. Others are waiting to hear from you.</p>
              {storySuccess && (
                <p className="mt-4 p-4 bg-emerald-400/20 rounded-2xl border border-emerald-400/30 font-black italic animate-bounce">
                  {storySuccess}
                </p>
              )}
            </div>
            <div className="w-full lg:w-[450px] space-y-4">
              <textarea 
                value={storyQuote}
                onChange={(e) => setStoryQuote(e.target.value)}
                placeholder="Describe your experience or share a message of hope..."
                className="w-full h-32 rounded-[2rem] bg-white/10 border border-white/20 p-8 text-white placeholder:text-emerald-100/50 focus:bg-white/20 transition-all outline-none font-medium text-lg leading-relaxed"
              />
              <button 
                onClick={handleShareStory}
                disabled={!storyQuote}
                className="w-full py-5 bg-white text-emerald-600 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-emerald-900/20 transition-all active:scale-95 disabled:opacity-50"
              >
                Publish Story
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Command Header */}
      <div className="card-premium mesh-bg border-none">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-red-200">
              <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
              Operational: Active
            </span>
            <h1 className="text-5xl font-[1000] tracking-tighter text-slate-900">Command Center</h1>
            <p className="text-xl font-medium text-slate-500 max-w-xl leading-relaxed">
              Welcome back, <span className="text-slate-900 font-black">{user?.name.split(' ')[0]}</span>. Your current reliability score is <span className="text-emerald-600 font-black underline decoration-emerald-200 underline-offset-4">98%</span>.
            </p>
          </div>
          
          <div className="relative group">
            <div className={`rounded-[2.5rem] p-10 min-w-[320px] transition-all duration-500 group-hover:-translate-y-2 ${eligibility.eligible ? 'glass-red' : 'glass-dark'}`}>
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-60">Donation Readiness</p>
                <div className={`h-3 w-3 rounded-full ${eligibility.eligible ? 'bg-white' : 'bg-red-500'} animate-pulse`} />
              </div>
              {eligibility.eligible ? (
                <>
                  <p className="text-4xl font-black tracking-tighter">Ready to Save</p>
                  <p className="mt-3 text-red-50 font-bold">You are medically eligible.</p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-black tracking-tighter">{eligibility.daysLeft} Days</p>
                  <p className="mt-3 text-slate-400 font-bold">until next eligibility</p>
                  <div className="mt-6 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-600 transition-all duration-1000" style={{ width: `${eligibility.percentage}%` }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Impact Score', value: `${completedDonations * 3} Lives`, sub: 'Saved through system', color: 'text-slate-900' },
            { label: 'Donation Streak', value: completedDonations, sub: 'Confirmed fulfilments', color: 'text-slate-900' },
            { label: 'Network Type', value: user?.bloodGroup, sub: 'Verified blood group', color: 'text-red-600' },
            { label: 'Nearby Alerts', value: activeRequests, sub: 'Requests within 20km', color: 'text-orange-600' },
          ].map((stat) => (
            <div key={stat.label} className="group p-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{stat.label}</p>
              <p className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-bold text-slate-400 mt-2">{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-3">
        {/* System SOS Alerts */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic">Live SOS Alerts</h2>
            <Link to="/find-donor" className="text-sm font-black uppercase tracking-widest text-red-600 hover:text-red-700 transition-colors">View Deployment Map -&gt;</Link>
          </div>
          
          <div className="grid gap-6">
            {loading ? (
              <div className="animate-pulse space-y-6">
                {[1, 2].map(i => <div key={i} className="h-32 glass rounded-[2.5rem]" />)}
              </div>
            ) : requests.length === 0 ? (
              <div className="card-premium py-20 text-center border-dashed">
                <p className="text-xl font-bold text-slate-400">The network is currently stable. <br /> No active SOS alerts detected.</p>
              </div>
            ) : (
              requests.slice(0, 3).map((request) => (
                <div key={request._id} className="card-premium group flex items-center justify-between !p-10 border-white/60 hover:!border-red-500/20">
                  <div className="flex items-center gap-10">
                    <div className="flex flex-col items-center justify-center rounded-[2rem] glass-dark h-24 w-24 shadow-2xl">
                      <span className="text-3xl font-[1000] text-red-500">{request.bloodGroup}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`h-2.5 w-2.5 rounded-full ${request.urgencyLevel === 'critical' ? 'bg-red-600 animate-ping' : 'bg-orange-500 animate-pulse'}`} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{request.urgencyLevel} Priority</span>
                      </div>
                      <p className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-red-600 transition-colors">{request.hospitalName}</p>
                      <p className="text-base font-bold text-slate-400 uppercase tracking-widest mt-1">{request.city} &bull; {request.unitsRequired} Units Required</p>
                    </div>
                  </div>
                  <Link to={`/requests/${request._id}`} className="btn-press rounded-2xl bg-slate-900 px-10 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-200">
                    Respond
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tactical Overview */}
        <div className="space-y-8">
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter italic px-2">Tactical</h2>
          
          <div className="card-premium glass-dark border-none !p-10 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 h-40 w-40 bg-red-600/10 blur-3xl" />
            <h3 className="text-xl font-black mb-8 uppercase tracking-widest text-red-400">Response Protocol</h3>
            <div className="space-y-8">
              {[
                { n: '01', t: 'Accepting a request marks your GPS status as "Deployed" towards the hospital.' },
                { n: '02', t: 'Establish contact with the doctor-on-call immediately via the secure system link.' },
                { n: '03', t: 'Post-donation, request a Digital Fulfilment Token to update your impact score.' }
              ].map(step => (
                <div key={step.n} className="flex gap-5 group">
                  <span className="text-xs font-black text-red-500 group-hover:scale-125 transition-transform">{step.n}</span>
                  <p className="text-sm font-bold text-slate-400 leading-relaxed group-hover:text-white transition-colors">{step.t}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card-premium border-red-100 !p-10 bg-red-50/30">
            <h3 className="text-xl font-black text-red-900 mb-8 uppercase tracking-widest">Rapid Deployment</h3>
            <div className="grid gap-4">
              <Link to="/request-blood" className="btn-press flex items-center justify-center rounded-[1.5rem] bg-primary py-5 font-black uppercase tracking-widest text-white shadow-xl shadow-red-200 hover:bg-red-700">
                New Emergency SOS
              </Link>
              <Link to="/profile" className="btn-press flex items-center justify-center rounded-[1.5rem] glass py-5 font-black uppercase tracking-widest text-slate-900 hover:bg-white">
                Update Availability
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;

