import { useEffect, useState } from 'react';
import contentService from '../services/contentService';
import adminService from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

function Camps() {
  const { user } = useAuth();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    organiser: '',
    phone: ''
  });
  const [success, setSuccess] = useState('');

  const fetchCamps = async () => {
    try {
      const data = user?.role === 'admin' 
        ? await adminService.getAllCamps() 
        : await contentService.getCamps();
      setCamps(data);
    } catch (err) {
      console.error('Failed to fetch camps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCamps();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await contentService.createCamp(formData);
      setSuccess('Camp submitted successfully! It will be visible once approved by an admin.');
      setFormData({ title: '', date: '', location: '', organiser: '', phone: '' });
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
        fetchCamps();
      }, 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit camp');
    }
  };

  const handleApprove = async (id) => {
    try {
      await contentService.approveCamp(id);
      fetchCamps();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve camp');
    }
  };

  return (
    <section className="space-y-16 py-10">
      <div className="card-premium bg-slate-900 border-none !p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/20 blur-[120px] rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-red-600/20 border border-red-500/30 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
              Community Drives
            </span>
            <h1 className="text-5xl font-[1000] tracking-tighter">Blood Donation Camps</h1>
            <p className="text-xl font-medium text-slate-400 max-w-xl">
              Join a local drive or organize one to help us build a steady supply of blood for emergencies.
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="px-10 py-5 bg-red-600 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-red-700 transition-all active:scale-95 shadow-2xl shadow-red-900/20"
          >
            Organize a Camp
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {loading ? (
          <div className="lg:col-span-2 flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : camps.length === 0 ? (
          <div className="lg:col-span-2 text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold text-xl italic">No upcoming camps scheduled. Check back soon!</p>
          </div>
        ) : (
          camps.map((camp) => (
            <div key={camp._id} className={`group relative rounded-[2.5rem] bg-white p-10 border transition-all hover:shadow-2xl hover:-translate-y-2 ${camp.isApproved ? 'border-slate-100' : 'border-orange-200 bg-orange-50/30'}`}>
              {!camp.isApproved && (
                <span className="absolute top-6 right-10 px-3 py-1 bg-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full">Pending Approval</span>
              )}
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="flex-shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-[2rem] bg-slate-900 text-white shadow-xl">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">{new Date(camp.date).toLocaleString('default', { month: 'short' })}</span>
                  <span className="text-3xl font-[1000]">{new Date(camp.date).getDate()}</span>
                </div>
                <div className="space-y-4 flex-1">
                  <h2 className="text-2xl font-black text-slate-900 group-hover:text-red-600 transition-colors">{camp.title}</h2>
                  <div className="space-y-2">
                    <p className="flex items-center gap-2 text-slate-500 font-bold">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {camp.location}
                    </p>
                    <p className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      Organized by <span className="text-slate-900 font-black">{camp.organiser}</span>
                    </p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                    <a href={`tel:${camp.phone}`} className="text-sm font-black text-slate-400 hover:text-red-600 transition-colors flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.405 5.405l.773-1.548a1 1 0 011.06-.539l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                      {camp.phone}
                    </a>
                    {user?.role === 'admin' && !camp.isApproved && (
                      <button 
                        onClick={() => handleApprove(camp._id)}
                        className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-900/10"
                      >
                        Approve Camp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
            <h2 className="text-3xl font-[1000] text-slate-900 mb-8 italic">Organize a Drive</h2>
            {success ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto">✓</div>
                <p className="text-xl font-bold text-slate-900">{success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
                  <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-red-200 outline-none font-bold" placeholder="e.g. Voluntary Blood Donation Drive" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                    <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-red-200 outline-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                    <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-red-200 outline-none font-bold" placeholder="10-digit number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location Venue</label>
                  <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-red-200 outline-none font-bold" placeholder="Full address of the camp" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Organizing Authority</label>
                  <input required value={formData.organiser} onChange={e => setFormData({...formData, organiser: e.target.value})} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:bg-white focus:border-red-200 outline-none font-bold" placeholder="Hospital or NGO name" />
                </div>
                <button className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-red-600 transition-all active:scale-95 mt-4">
                  Submit for Approval
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Camps;
