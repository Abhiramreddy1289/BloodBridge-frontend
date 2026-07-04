import { Link } from 'react-router-dom';

function Join() {
  return (
    <section className="space-y-10">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">Join India's Most Reliable Blood Donation Network</h1>
        <p className="mt-3 text-slate-600">Become part of a community that makes blood donation faster, safer, and more trustworthy.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Join the network</h2>
          <p className="mt-4 text-slate-600">Create your account to receive donor requests, track your impact, and get updates about camps and blood availability.</p>
          <Link to="/register" className="mt-6 inline-flex rounded-full bg-primary px-6 py-3 text-white transition hover:bg-red-700">
            Join Now
          </Link>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-red-500 to-red-700 p-8 text-white shadow-soft">
          <h2 className="text-2xl font-semibold">Use the live app</h2>
          <p className="mt-4 text-slate-100">Use BloodBridge from your phone browser for faster notifications and request management on the go.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link to="/request-blood" className="rounded-3xl bg-white/10 p-4 text-center transition hover:bg-white/20">
              <p className="text-sm uppercase tracking-[0.2em] text-red-100">Request Blood</p>
            </Link>
            <Link to="/find-donor" className="rounded-3xl bg-white/10 p-4 text-center transition hover:bg-white/20">
              <p className="text-sm uppercase tracking-[0.2em] text-red-100">Find Donor</p>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Join;
