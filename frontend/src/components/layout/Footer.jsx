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
    <footer className="relative mt-20 overflow-hidden border-t border-white/70 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-slate-200">
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-red-300/60 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr]">
            <div className="space-y-6">
              <BrandLogo className="group text-xl font-black text-white" markClassName="h-8 w-8 transition-transform group-hover:scale-110" />
              <p className="max-w-xl text-sm font-medium leading-7 text-slate-300">
                India’s most responsive emergency blood coordination network, helping donors, hospitals, and communities move faster when every minute matters.
              </p>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-slate-200 transition-all hover:border-red-400/60 hover:bg-red-600/70 hover:text-white"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-red-300">Quick Links</h4>
              <ul className="space-y-3 text-sm font-semibold text-slate-300">
                {['Find Donor', 'Request Blood', 'Inventory', 'Camps'].map((item) => (
                  <li key={item}>
                    <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="transition-colors hover:text-white">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-red-300">Support</h4>
              <ul className="space-y-3 text-sm font-semibold text-slate-300">
                {supportLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="transition-colors hover:text-white">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-red-300">Contact</h4>
              <ul className="space-y-3 text-sm font-semibold text-slate-300">
                <li>
                  <a href="tel:+91180025663" className="flex items-center gap-3 transition-colors hover:text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-red-300">
                      <Phone size={16} />
                    </span>
                    +91 1800-BLOOD
                  </a>
                </li>
                <li>
                  <a href="mailto:sos@bloodbridge.in" className="flex items-center gap-3 transition-colors hover:text-white">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-red-300">
                      <Mail size={16} />
                    </span>
                    sos@bloodbridge.in
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-red-300">
                    <MapPin size={16} />
                  </span>
                  New Delhi, India
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm font-semibold text-slate-400 md:flex-row">
          <p>© 2026 BloodBridge. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/faq" className="hover:text-white">Privacy Policy</Link>
            <Link to="/faq" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
