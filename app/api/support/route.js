import { withUser, ok, fail } from '@/lib/api';

// POST /api/support  { subject, message }
export const POST = withUser(async ({ supabase, user, body }) => {
  const subject = String(body.subject || '').trim().slice(0, 120);
  const message = String(body.message || '').trim().slice(0, 2000);
  if (subject.length < 3 || message.length < 10) return fail('Add a subject and a short description of the issue');
  const { data, error } = await supabase.from('support_tickets').insert({ user_id: user.id, subject, message }).select().single();
  if (error) return fail(error.message);
  return ok({ data });
});
