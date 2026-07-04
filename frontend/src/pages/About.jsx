function About() {
  return (
    <section className="mx-auto max-w-4xl space-y-12">
      <div className="rounded-[2.5rem] bg-white p-8 sm:p-12 shadow-soft border border-slate-100">
        <h1 className="text-4xl font-extrabold text-slate-900">About BloodBridge</h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed">
          BloodBridge is a technology-driven platform dedicated to solving the critical challenge of blood availability during emergencies. Our mission is to bridge the gap between those in need of life-saving blood and those willing to donate, using real-time coordination and verified logistics.
        </p>
        <p className="mt-4 text-lg text-slate-600 leading-relaxed">
          By leveraging hyperlocal matching and hospital-verified requests, we ensure that every SOS alert reaches the right donors at the right time, minimizing precious minutes lost in search of a match.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white">
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p className="mt-4 text-slate-400">To create a world where no life is lost due to blood unavailability, powered by a community of verified, selfless donors.</p>
        </div>
        <div className="rounded-[2.5rem] bg-red-600 p-10 text-white">
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="mt-4 text-red-100">To provide the fastest, most reliable emergency blood connection network in India through innovation and verified medical protocols.</p>
        </div>
      </div>
    </section>
  );
}

export default About;
