import { withUser, rpcResult, fail } from '@/lib/api';

const STATUS = ['active', 'frozen', 'suspended'];
const KYC = ['unverified', 'pending', 'verified', 'rejected'];
const ROLES = ['user', 'admin'];

// PATCH /api/admin/users/:id  { status?, kyc_status?, role? }
export const PATCH = withUser(
  async ({ supabase, body, params }) => {
    if (body.status && !STATUS.includes(body.status)) return fail('Invalid status');
    if (body.kyc_status && !KYC.includes(body.kyc_status)) return fail('Invalid KYC status');
    if (body.role && !ROLES.includes(body.role)) return fail('Invalid role');
    return rpcResult(
      await supabase.rpc('admin_update_user', {
        p_user: params.id,
        p_status: body.status || null,
        p_kyc: body.kyc_status || null,
        p_role: body.role || null,
      })
    );
  },
  { admin: true }
);
