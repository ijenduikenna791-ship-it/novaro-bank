'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/fetcher';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/lib/signout';
import { initials, dateOnly } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { Spinner } from '@/components/ui/Field';
import { useBank } from '@/components/dashboard/BankProvider';
import { PageHeader, StatusChip } from '@/components/dashboard/bits';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, account, refresh, toast } = useBank();
  const [form, setForm] = useState({ full_name: profile.full_name || '', phone: profile.phone || '', address: profile.address || '' });
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const save = async (e, extra = {}) => {
    e?.preventDefault();
    setSaving(true);
    try {
      await api('/api/profile', { method: 'PATCH', body: { ...form, ...extra } });
      toast(extra.request_verification ? 'Verification requested' : 'Profile saved');
      refresh();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.length < 8) return toast('Use at least 8 characters', 'error');
    setPwSaving(true);
    const { error } = await createClient().auth.updateUser({ password: pw });
    setPwSaving(false);
    if (error) return toast(error.message, 'error');
    setPw('');
    toast('Password updated');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" subtitle="Your personal details and security." />

      <div className="panel overflow-hidden">
        <div className="relative bg-gradient-to-br from-[#26336b] to-[#0a1022] px-5 pb-6 pt-8 text-white sm:px-6">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 font-display text-xl font-semibold ring-4 ring-white/10">{initials(profile.full_name)}</span>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-semibold">{profile.full_name}</p>
              <p className="truncate text-sm text-white/60">{profile.email}</p>
              <p className="mt-1 text-xs text-white/50">Member since {dateOnly(profile.created_at)}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 text-center text-sm">
          <div className="p-4"><p className="text-xs text-slate-500">Account</p><p className="mt-1 font-mono font-medium">{account.account_number}</p></div>
          <div className="p-4"><p className="text-xs text-slate-500">Status</p><div className="mt-1"><StatusChip status={profile.status} /></div></div>
          <div className="p-4"><p className="text-xs text-slate-500">Identity</p><div className="mt-1"><StatusChip status={profile.kyc_status} /></div></div>
        </div>
      </div>

      {profile.kyc_status === 'unverified' || profile.kyc_status === 'rejected' ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center">
          <Icon name="badge" size={24} className="shrink-0 text-amber-600" />
          <p className="flex-1 text-sm text-amber-900">Verify your identity to unlock higher limits. Make sure your name, phone and address are correct first.</p>
          <button onClick={(e) => save(e, { request_verification: true })} disabled={saving} className="btn-dark shrink-0">Request verification</button>
        </div>
      ) : null}

      <form onSubmit={save} className="panel mt-4 space-y-4 p-5 sm:p-6">
        <h2 className="font-semibold">Personal details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label><input value={form.full_name} onChange={set('full_name')} className="field" /></div>
          <div><label className="label">Phone</label><input value={form.phone} onChange={set('phone')} className="field" type="tel" /></div>
        </div>
        <div><label className="label">Address</label><input value={form.address} onChange={set('address')} className="field" /></div>
        <div><label className="label">Email</label><input value={profile.email} disabled className="field bg-slate-50 text-slate-500" /></div>
        <button disabled={saving} className="btn-dark">{saving ? <Spinner /> : 'Save changes'}</button>
      </form>

      <form onSubmit={changePassword} className="panel mt-4 space-y-4 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-semibold"><Icon name="lock" size={19} /> Change password</h2>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="New password (8+ characters)" className="field" autoComplete="new-password" />
        <button disabled={pwSaving} className="btn-ghost">{pwSaving ? <Spinner /> : 'Update password'}</button>
      </form>

      <button onClick={() => signOut(router)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-3.5 text-sm font-semibold text-red-600 hover:bg-red-100">
        <Icon name="logout" size={18} /> Log out
      </button>
    </div>
  );
}
