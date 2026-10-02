import { withUser, rpcResult, fail } from '@/lib/api';

// PATCH /api/admin/tickets/:id  { reply, close }
export const PATCH = withUser(
  async ({ supabase, body, params }) => {
    const reply = String(body.reply || '').trim().slice(0, 2000);
    if (!reply && !body.close) return fail('Write a reply');
    return rpcResult(
      await supabase.rpc('admin_reply_ticket', { p_ticket: params.id, p_reply: reply, p_close: Boolean(body.close) })
    );
  },
  { admin: true }
);
