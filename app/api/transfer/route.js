import { withUser, rpcResult, fail, toAmount } from '@/lib/api';

// POST /api/transfer  { to_account, amount, note }
export const POST = withUser(async ({ supabase, body }) => {
  const amount = toAmount(body.amount);
  const to = String(body.to_account || '').replace(/\s/g, '');
  if (!/^\d{10}$/.test(to)) return fail('Enter a valid 10-digit account number');
  if (!amount) return fail('Enter a valid amount');
  return rpcResult(
    await supabase.rpc('transfer_funds', { p_to_account: to, p_amount: amount, p_note: String(body.note || '').slice(0, 140) })
  );
});
