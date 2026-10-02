'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { money, dateOnly, initials } from '@/lib/format';
import Icon from '@/components/ui/Icon';
import { PageHeader, StatusChip, Skeleton, Empty } from '@/components/dashboard/bits';

export default function AdminUsers() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    createClient()
      .from('profiles')
      .select('*, accounts(account_number, balance)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setUsers(data || []));
  }, []);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (users || []).filter((u) => {
      const acct = Array.isArray(u.accounts) ? u.accounts[0] : u.accounts;
      const matches = !term || [u.full_name, u.email, acct?.account_number].some((v) => v?.toLowerCase().includes(term));
      const f =
        filter === 'all' ||
        (filter === 'kyc' && u.kyc_status === 'pending') ||
        (filter === 'frozen' && u.status !== 'active') ||
        (filter === 'admins' && u.role === 'admin');
      return matches && f;
    });
  }, [users, q, filter]);

  return (
    <div>
      <PageHeader title="Customers" subtitle={users ? `${users.length} total` : 'Loading…'} />
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icon name="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or account number" className="field pl-11" />
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="field sm:w-52">
          <option value="all">All customers</option>
          <option value="kyc">Awaiting verification</option>
          <option value="frozen">Frozen or suspended</option>
          <option value="admins">Admins</option>
        </select>
      </div>

      <div className="panel mt-4 overflow-hidden">
        {users === null ? (
          <div className="space-y-3 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : list.length === 0 ? (
          <Empty icon="users" title="No customers found" />
        ) : (
          <>
            <table className="hidden w-full text-sm md:table">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Account</th>
                  <th className="px-5 py-3 text-right font-medium">Balance</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Identity</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.map((u) => {
                  const acct = Array.isArray(u.accounts) ? u.accounts[0] : u.accounts;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <Link href={`/admin/users/${u.id}`} className="flex items-center gap-3">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">{initials(u.full_name)}</span>
                          <span>
                            <span className="block font-semibold">{u.full_name} {u.role === 'admin' && <span className="chip ml-1 bg-ink-100 text-ink-700">admin</span>}</span>
                            <span className="block text-xs text-slate-500">{u.email}</span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs">{acct?.account_number}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">{money(acct?.balance)}</td>
                      <td className="px-5 py-3"><StatusChip status={u.status} /></td>
                      <td className="px-5 py-3"><StatusChip status={u.kyc_status} /></td>
                      <td className="px-5 py-3 text-slate-500">{dateOnly(u.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="divide-y divide-slate-100 md:hidden">
              {list.map((u) => {
                const acct = Array.isArray(u.accounts) ? u.accounts[0] : u.accounts;
                return (
                  <Link key={u.id} href={`/admin/users/${u.id}`} className="flex items-center gap-3 p-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-ink-900 text-xs font-semibold text-white">{initials(u.full_name)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{u.full_name}</span>
                      <span className="block truncate text-xs text-slate-500">{acct?.account_number} · {money(acct?.balance)}</span>
                    </span>
                    <StatusChip status={u.status} />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
