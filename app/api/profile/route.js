import { withUser, ok, fail } from '@/lib/api';

// PATCH /api/profile  { full_name, phone, address, request_verification }
export const PATCH = withUser(async ({ supabase, user, body }) => {
  const update = {};
  if (body.full_name !== undefined) {
    const name = String(body.full_name).trim().slice(0, 80);
    if (name.length < 2) return fail('Enter your full name');
    update.full_name = name;
  }
  if (body.phone !== undefined) update.phone = String(body.phone).trim().slice(0, 30);
  if (body.address !== undefined) update.address = String(body.address).trim().slice(0, 200);
  if (body.request_verification) update.kyc_status = 'pending';

  const { data, error } = await supabase.from('profiles').update(update).eq('id', user.id).select().single();
  if (error) return fail(error.message);
  return ok({ data });
});
