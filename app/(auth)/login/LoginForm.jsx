'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AuthShell from '@/components/ui/AuthShell';
import { DarkField, Spinner, Alert } from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import { photos } from '@/components/landing/images';

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    params.get('error') === 'link'
      ? 'That link has expired. Please log in.'
      : params.get('error') === 'setup'
      ? 'Your account records were not found. Make sure supabase/schema.sql was run before signing up.'
      : ''
  );

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(form);
    if (error) {
      setError(error.message === 'Invalid login credentials' ? 'Wrong email or password.' : error.message);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    router.replace(profile?.role === 'admin' ? '/admin' : '/dashboard');
    router.refresh();
  };

  return (
    <AuthShell title="Welcome back" subtitle="Log in to manage your money." image={photos.cardBehindPhone}>
      <form onSubmit={submit} className="space-y-4">
        <Alert>{error}</Alert>
        <DarkField label="Email" type="email" icon="mail" required autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
        <DarkField label="Password" type="password" icon="lock" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" />
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-ink-900 transition hover:bg-ink-100 disabled:opacity-70">
          {loading ? <Spinner /> : <>Log in <Icon name="right" size={16} /></>}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-ink-200/70">
        New to Novaro?{' '}
        <Link href="/register" className="font-medium text-white underline-offset-4 hover:underline">Open an account</Link>
      </p>
    </AuthShell>
  );
}
