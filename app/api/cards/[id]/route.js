import { withUser, rpcResult, fail, toAmount } from '@/lib/api';

// PATCH /api/cards/:id  { action: 'freeze'|'unfreeze'|'terminate'|'fund', amount }
export const PATCH = withUser(async ({ supabase, body, params }) => {
  const id = params.id;
  switch (body.action) {
    case 'freeze':
      return rpcResult(await supabase.rpc('set_card_status', { p_card: id, p_status: 'frozen' }));
    case 'unfreeze':
      return rpcResult(await supabase.rpc('set_card_status', { p_card: id, p_status: 'active' }));
    case 'terminate':
      return rpcResult(await supabase.rpc('set_card_status', { p_card: id, p_status: 'terminated' }));
    case 'fund': {
      const amount = toAmount(body.amount);
      if (!amount) return fail('Enter a valid amount');
      return rpcResult(await supabase.rpc('fund_card', { p_card: id, p_amount: amount }));
    }
    default:
      return fail('Unknown action');
  }
});
