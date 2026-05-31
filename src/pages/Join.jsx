function Join() {
  return (
    <section className="space-y-10">
      <div className="rounded-3xl bg-white p-8 shadow-soft">
        <h1 className="text-3xl font-bold text-slate-900">Join India’s Most Reliable Blood Donation Network</h1>
        <p className="mt-3 text-slate-600">Become part of a community that makes blood donation faster, safer, and more trustworthy.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-soft">
          <h2 className="text-2xl font-semibold text-slate-900">Join the waitlist</h2>
          <p className="mt-4 text-slate-600">Get early access to the app, notifications for donor requests, and updates about camps and blood availability.</p>
          <button className="mt-6 rounded-full bg-primary px-6 py-3 text-white transition hover:bg-red-700">
            Join Now
          </button>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-red-500 to-red-700 p-8 text-white shadow-soft">
          <h2 className="text-2xl font-semibold">Download the app</h2>
          <p className="mt-4 text-slate-100">Use the mobile experience for faster notifications and request management on the go.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-white/10 p-4 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-red-100">App Store</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-red-100">Google Play</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Join;
