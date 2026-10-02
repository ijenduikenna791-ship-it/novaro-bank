import { withUser, rpcResult, fail, toAmount } from '@/lib/api';

// POST /api/withdraw  { amount, method: wire|ach, bank_name, account_name, account_number, routing_number }
export const POST = withUser(async ({ supabase, body }) => {
  const amount = toAmount(body.amount);
  if (!amount) return fail('Enter a valid amount');
  const details = {
    bank_name: String(body.bank_name || '').trim().slice(0, 80),
    account_name: String(body.account_name || '').trim().slice(0, 80),
    account_number: String(body.account_number || '').replace(/\s/g, '').slice(0, 20),
    routing_number: String(body.routing_number || '').replace(/\s/g, '').slice(0, 12),
  };
  if (!details.bank_name || !details.account_name || details.account_number.length < 4)
    return fail('Fill in the receiving bank details');
  return rpcResult(await supabase.rpc('request_withdrawal', { p_amount: amount, p_method: body.method, p_details: details }));
});
