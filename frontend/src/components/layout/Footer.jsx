import { Mail, Phone, MapPin, Globe, Send, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const socialLinks = [
  { icon: Send, href: 'mailto:sos@bloodbridge.in', label: 'Email support' },
  { icon: Globe, href: 'https://bloodbridge-with-abhiram.vercel.app/', label: 'Open BloodBridge site' },
  { icon: LinkIcon, href: 'https://github.com/Abhiramreddy1289/BloodBridge-frontend', label: 'View source repository' },
];

const supportLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Impact Stories', to: '/stories' },
  { label: 'Guides', to: '/guides' },
  { label: 'FAQ', to: '/faq' },
];

function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/70 bg-white/80 pb-10 pt-20 backdrop-blur-xl">
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-6">
            <BrandLogo className="group text-xl font-black" markClassName="h-8 w-8 transition-transform group-hover:scale-110" />
            <p className="font-medium leading-relaxed text-slate-500">
              India's most advanced emergency blood logistics network. Connecting lives through technology and compassion.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl glass text-slate-400 transition-all hover:border-red-500/30 hover:text-red-600"
                >
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-900">Quick Links</h4>
            <ul className="space-y-4">
              {['Find Donor', 'Request Blood', 'Inventory', 'Camps'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="font-bold text-slate-500 transition-colors hover:text-red-600">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-900">Support</h4>
            <ul className="space-y-4">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="font-bold text-slate-500 transition-colors hover:text-red-600">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-900">Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:+91180025663" className="flex items-center gap-3 font-bold text-slate-500 transition-colors hover:text-red-600">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg glass text-red-600">
                    <Phone size={16} />
                  </span>
                  +91 1800-BLOOD
                </a>
              </li>
              <li>
                <a href="mailto:sos@bloodbridge.in" className="flex items-center gap-3 font-bold text-slate-500 transition-colors hover:text-red-600">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg glass text-red-600">
                    <Mail size={16} />
                  </span>
                  sos@bloodbridge.in
                </a>
              </li>
              <li className="flex items-start gap-3 font-bold text-slate-500">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg glass text-red-600">
                  <MapPin size={16} />
                </span>
                New Delhi, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-50 pt-8 text-center md:flex-row md:text-left">
          <p className="text-sm font-bold text-slate-400">
            (c) 2026 BloodBridge. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-bold text-slate-400">
            <Link to="/faq" className="hover:text-slate-900">Privacy Policy</Link>
            <Link to="/faq" className="hover:text-slate-900">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
