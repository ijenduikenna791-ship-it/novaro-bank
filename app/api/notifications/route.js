import { withUser, ok, fail } from '@/lib/api';

// GET /api/notifications  -> latest 30
export const GET = withUser(async ({ supabase, user }) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);
  if (error) return fail(error.message);
  return ok({ data });
});

// PATCH /api/notifications  -> mark all read
export const PATCH = withUser(async ({ supabase, user }) => {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
  if (error) return fail(error.message);
  return ok({ data: true });
});
