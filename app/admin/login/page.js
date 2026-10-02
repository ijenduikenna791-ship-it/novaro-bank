'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import AuthShell from '@/components/ui/AuthShell';
import { DarkField, Spinner, Alert } from '@/components/ui/Field';
import Icon from '@/components/ui/Icon';
import { photos } from '@/components/landing/images';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword(form);
    if (error) {
      setLoading(false);
      return setError('Wrong email or password.');
    }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut();
      setLoading(false);
      return setError('This account does not have admin access.');
    }
    router.replace('/admin');
    router.refresh();
  };

  return (
    <AuthShell
      title="Admin console"
      subtitle="Restricted area. All actions are logged."
      image={photos.cashless}
      badge={
        <span className="glass mb-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] text-ink-100/80">
          <Icon name="shieldCheck" size={13} /> Staff only
        </span>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Alert>{error}</Alert>
        <DarkField label="Admin email" type="email" icon="mail" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@novaro.app" />
        <DarkField label="Password" type="password" icon="lock" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Admin password" />
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-ink-900 transition hover:bg-ink-100 disabled:opacity-70">
          {loading ? <Spinner /> : <>Enter console <Icon name="right" size={16} /></>}
        </button>
      </form>
    </AuthShell>
  );
}
