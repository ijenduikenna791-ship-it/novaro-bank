import { withUser, rpcResult, fail, toAmount } from '@/lib/api';

// POST /api/deposit  { amount, method: wire|ach|check, note }
export const POST = withUser(async ({ supabase, body }) => {
  const amount = toAmount(body.amount);
  if (!amount) return fail('Enter a valid amount');
  if (amount > 250000) return fail('Deposits above $250,000 must be arranged with support');
  return rpcResult(
    await supabase.rpc('request_deposit', { p_amount: amount, p_method: body.method, p_note: String(body.note || '').slice(0, 140) })
  );
});
