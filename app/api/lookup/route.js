import { withUser, rpcResult, fail } from '@/lib/api';

// POST /api/lookup  { account_number }
export const POST = withUser(async ({ supabase, body }) => {
  const n = String(body.account_number || '').replace(/\s/g, '');
  if (!/^\d{10}$/.test(n)) return fail('Account numbers have 10 digits');
  return rpcResult(await supabase.rpc('lookup_account', { p_account_number: n }));
});
