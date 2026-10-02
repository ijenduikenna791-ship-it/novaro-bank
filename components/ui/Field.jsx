'use client';
import { useState } from 'react';
import Icon from './Icon';

/** Dark input used on auth pages */
export function DarkField({ label, type = 'text', icon, ...props }) {
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-100/80">{label}</span>
      <div className="relative">
        {icon && <Icon name={icon} size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-200/60" />}
        <input type={isPw && show ? 'text' : type} className={`field-dark ${icon ? 'pl-11' : ''} ${isPw ? 'pr-11' : ''}`} {...props} />
        {isPw && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-200/60 hover:text-white" aria-label="Toggle password">
            <Icon name={show ? 'eyeOff' : 'eye'} size={18} />
          </button>
        )}
      </div>
    </label>
  );
}

export function Spinner({ className = 'h-4 w-4' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent ${className}`} />;
}

export function Alert({ kind = 'error', children }) {
  if (!children) return null;
  const styles = {
    error: 'border-red-400/30 bg-red-500/10 text-red-200',
    success: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200',
  };
  return (
    <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm ${styles[kind]}`}>
      <Icon name={kind === 'error' ? 'alert' : 'check'} size={18} className="mt-px shrink-0" />
      <span>{children}</span>
    </div>
  );
}
