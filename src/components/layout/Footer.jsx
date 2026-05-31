import { Mail, Phone, MapPin, Globe, Send, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo';

const supportLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Impact Stories', to: '/stories' },
  { label: 'Guides', to: '/guides' },
  { label: 'FAQ', to: '/faq' },
];

function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/70 bg-white/80 pb-10 pt-20 backdrop-blur-xl">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="col-span-1 lg:col-span-1 space-y-6">
            <BrandLogo className="group text-xl font-black" markClassName="h-8 w-8 transition-transform group-hover:scale-110" />
            <p className="text-slate-500 font-medium leading-relaxed">
              India's most advanced emergency blood logistics network. Connecting lives through technology and compassion.
            </p>
            <div className="flex gap-4">
              {[Send, Globe, LinkIcon].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-xl glass flex items-center justify-center text-slate-400 hover:text-red-600 hover:border-red-500/30 transition-all">
                  <Icon size={20} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {['Find Donor', 'Request Blood', 'Inventory', 'Camps'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.toLowerCase().replace(' ', '-')}`} className="text-slate-500 font-bold hover:text-red-600 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Support</h4>
            <ul className="space-y-4">
              {supportLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-slate-500 font-bold hover:text-red-600 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-500 font-bold">
                <div className="h-8 w-8 rounded-lg glass flex items-center justify-center text-red-600">
                  <Phone size={16} />
                </div>
                +91 1800-BLOOD
              </li>
              <li className="flex items-center gap-3 text-slate-500 font-bold">
                <div className="h-8 w-8 rounded-lg glass flex items-center justify-center text-red-600">
                  <Mail size={16} />
                </div>
                sos@bloodbridge.in
              </li>
              <li className="flex items-start gap-3 text-slate-500 font-bold">
                <div className="h-8 w-8 rounded-lg glass flex items-center justify-center text-red-600 shrink-0">
                  <MapPin size={16} />
                </div>
                New Delhi, India
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm font-bold">
            (c) 2026 BloodBridge. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
