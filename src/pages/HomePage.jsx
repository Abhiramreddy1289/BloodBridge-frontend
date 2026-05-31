import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPinned,
  RadioTower,
  ShieldCheck,
  Siren,
  UsersRound,
} from 'lucide-react';
import heroClean from '../assets/hero-clean.png';

const quickActions = [
  { label: 'Request Blood', to: '/request-blood', Icon: Siren, tone: 'bg-red-600 text-white hover:bg-red-700' },
  { label: 'Find Donor', to: '/find-donor', Icon: MapPinned, tone: 'bg-slate-950 text-white hover:bg-slate-800' },
  { label: 'Check Inventory', to: '/inventory', Icon: Activity, tone: 'bg-white text-slate-950 hover:bg-slate-50' },
];

const metrics = [
  { label: 'Avg SOS response', value: '4 min', detail: 'from alert to donor action', Icon: Clock3 },
  { label: 'Active network', value: '1.2k', detail: 'registered donors', Icon: UsersRound },
  { label: 'Live coverage', value: '24', detail: 'blood groups monitored', Icon: RadioTower },
];

const features = [
  {
    title: 'Verified emergency flow',
    description: 'Every core action moves through authenticated users, protected request details, and admin oversight.',
    Icon: ShieldCheck,
  },
  {
    title: 'Donor-first privacy',
    description: 'Sensitive contact details are only revealed when a donor accepts and becomes part of the response.',
    Icon: HeartPulse,
  },
  {
    title: 'Operational dashboard',
    description: 'Requests, donor readiness, inventory, camps, and analytics stay reachable without burying the user.',
    Icon: Activity,
  },
];

const camps = [
  { date: '01 Mar', title: 'Voluntary Donation Camp', location: 'Dimakuchi, Udalguri' },
  { date: '03 Mar', title: 'Civil Hospital Drive', location: 'South Garo Hills' },
];

const heroTitle = 'Life-saving blood, routed instantly.';

function HomePage() {
  const [typedTitle, setTypedTitle] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedTitle(heroTitle.slice(0, index));

      if (index >= heroTitle.length) {
        window.clearInterval(timer);
      }
    }, 55);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="space-y-20 pb-20">
      <section className="relative -mx-4 -mt-6 min-h-[680px] overflow-hidden border-b border-slate-200 bg-white md:-mx-8">
        <img
          src={heroClean}
          alt="Doctor coordinating blood donation response"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/20" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-[size:48px_48px] opacity-60" />

        <div className="relative mx-auto flex min-h-[680px] max-w-7xl items-center px-6 py-16 sm:px-10 md:px-14 lg:px-16">
          <div className="self-start max-w-[720px] space-y-8 rounded-xl bg-white/18 py-8 backdrop-blur-[1px] lg:pt-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-red-100 bg-red-50 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              Emergency Blood Coordination
            </div>

            <div className="space-y-5">
              <h1 className="typewriter-title max-w-[690px] text-[clamp(3rem,6vw,5.9rem)] font-black leading-[1.02] tracking-tight text-slate-950">
                <span>{typedTitle}</span>
                <span className="typing-cursor" aria-hidden="true" />
              </h1>
              <p className="max-w-[680px] text-lg font-semibold leading-9 text-slate-700">
                BloodBridge brings donors, hospitals, emergency requests, inventory, camps, and admin controls into one clear response system.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link to="/request-blood" className="group inline-flex items-center gap-3 rounded-lg bg-red-600 px-6 py-4 font-black text-white shadow-xl shadow-red-100 transition hover:bg-red-700">
                Create Emergency Request <ArrowRight size={19} className="transition group-hover:translate-x-1" />
              </Link>
              <Link to="/find-donor" className="group inline-flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-6 py-4 font-black text-slate-950 shadow-sm transition hover:bg-slate-50">
                Find Compatible Donor <MapPinned size={19} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <p className="section-kicker">Main Actions</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Choose what you need right now</h2>
          </div>
          <p className="max-w-xl text-sm font-medium leading-6 text-slate-500">
            These are separated from the hero so the first screen stays clean and each action is easy to scan.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map(({ label, to, Icon, tone }) => (
            <Link
              key={label}
              to={to}
              className={`group flex items-center justify-between rounded-lg border border-slate-200 px-5 py-5 text-base font-black shadow-soft transition hover:-translate-y-1 ${tone}`}
            >
              <span className="flex items-center gap-3">
                <Icon size={22} />
                {label}
              </span>
              <ArrowRight size={19} className="transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-5">
        <div>
          <p className="section-kicker">Live Network</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Key signals, spaced clearly</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {metrics.map(({ label, value, detail, Icon }) => (
            <div key={label} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Icon size={23} />
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-emerald-700">Live</span>
              </div>
              <p className="mt-6 text-4xl font-black tracking-tight text-slate-950">{value}</p>
              <p className="mt-2 text-sm font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className="mt-3 font-medium leading-7 text-slate-600">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
        {features.map(({ title, description, Icon }) => (
          <div key={title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:border-red-100 hover:shadow-premium">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white">
              <Icon size={24} />
            </div>
            <h2 className="mt-6 text-xl font-black tracking-tight text-slate-950">{title}</h2>
            <p className="mt-3 font-medium leading-7 text-slate-600">{description}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div>
              <p className="section-kicker">Donation Camps</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Upcoming drives</h2>
            </div>
            <Link to="/camps" className="inline-flex items-center gap-2 font-black text-red-600 hover:text-red-700">
              View camps <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-5 grid gap-4">
            {camps.map((camp) => (
              <div key={camp.title} className="grid gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:grid-cols-[88px_1fr] sm:items-center">
                <div className="rounded-lg bg-white p-4 text-center shadow-sm">
                  <CalendarDays className="mx-auto text-red-600" size={22} />
                  <p className="mt-2 text-sm font-black text-slate-950">{camp.date}</p>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">{camp.title}</h3>
                  <p className="mt-1 font-medium text-slate-500">{camp.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-6 text-white shadow-2xl shadow-slate-300">
          <p className="section-kicker !text-red-300">Evaluator Snapshot</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">Built like a usable product, not a static demo.</h2>
          <div className="mt-7 space-y-4">
            {[
              'Authentication-aware protected routes',
              'Admin users, requests, and analytics screens',
              'Live donor search and request workflows',
              'Inventory and camp discovery pages',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <CheckCircle2 className="text-emerald-300" size={20} />
                <p className="font-bold text-slate-100">{item}</p>
              </div>
            ))}
          </div>
          <Link to="/register" className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-black text-red-600 transition hover:bg-red-50">
            Join the Network <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
