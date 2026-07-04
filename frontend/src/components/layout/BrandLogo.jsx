import { Link } from 'react-router-dom';

function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${className} rounded-2xl bg-red-50 p-1.5 text-red-600 shadow-sm`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  );
}

function BrandLogo({ className = '', markClassName, onClick }) {
  return (
    <Link to="/" className={`flex items-center gap-3 text-primary ${className}`} onClick={onClick}>
      <LogoMark className={markClassName} />
      <span className="tracking-tight text-slate-950">
        Blood<span className="text-red-600">Bridge</span>
      </span>
    </Link>
  );
}

export default BrandLogo;
