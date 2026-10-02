'use client';
import { createClient } from '@/lib/supabase/client';

export async function signOut(router, to = '/login') {
  await createClient().auth.signOut();
  router.replace(to);
  router.refresh();
}
