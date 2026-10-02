import { withUser, rpcResult } from '@/lib/api';

// PATCH /api/admin/transactions/:id  { approve: boolean, note }
export const PATCH = withUser(
  async ({ supabase, body, params }) =>
    rpcResult(
      await supabase.rpc('admin_review_transaction', {
        p_tx: params.id,
        p_approve: Boolean(body.approve),
        p_note: body.note ? String(body.note).slice(0, 200) : null,
      })
    ),
  { admin: true }
);
