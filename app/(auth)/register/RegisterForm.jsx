'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AuthShell from '@/components/ui/AuthShell';
import { DarkField, Spinner, Alert } from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import { photos } from '@/components/landing/images';

export default function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ full_name: '', email: params.get('email') || '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const strong = form.password.length >= 8 && /\d/.test(form.password) && /[A-Za-z]/.test(form.password);

  const submit = async (e) => {
    e.preventDefault();
    if (!strong) return setError('Use at least 8 characters with letters and numbers.');
    setLoading(true);
    setError('');
    const supabase = createClient();
    const site = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name.trim(), phone: form.phone.trim() },
        emailRedirectTo: `${site}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      router.replace('/dashboard');
      router.refresh();
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <AuthShell title="Check your email" subtitle={`We sent a confirmation link to ${form.email}.`} image={photos.womanPaying}>
        <Alert kind="success">Click the link in the email to activate your account, then log in.</Alert>
        <Link href="/login" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-ink-900">
          Go to login <Icon name="right" size={16} />
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Open your account" subtitle="It takes about two minutes." image={photos.womanPaying}>
      <form onSubmit={submit} className="space-y-4">
        <Alert>{error}</Alert>
        <DarkField label="Full name" icon="user" required value={form.full_name} onChange={set('full_name')} placeholder="Jade William" autoComplete="name" />
        <DarkField label="Email" type="email" icon="mail" required value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
        <DarkField label="Phone (optional)" type="tel" icon="phone" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" autoComplete="tel" />
        <DarkField label="Password" type="password" icon="lock" required value={form.password} onChange={set('password')} placeholder="At least 8 characters" autoComplete="new-password" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => {
            const score = (form.password.length >= 8) + /\d/.test(form.password) + /[^A-Za-z0-9]/.test(form.password);
            return <span key={i} className={`h-1 flex-1 rounded-full transition ${i < score ? 'bg-brand-300' : 'bg-white/10'}`} />;
          })}
        </div>
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-ink-900 transition hover:bg-ink-100 disabled:opacity-70">
          {loading ? <Spinner /> : <>Create account <Icon name="right" size={16} /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-200/70">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-white underline-offset-4 hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
