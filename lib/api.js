import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const ok = (data = {}, status = 200) => NextResponse.json(data, { status });
export const fail = (message, status = 400) => NextResponse.json({ error: message }, { status });

/** Wrap a route handler: requires a signed-in user (and optionally admin). */
export function withUser(handler, { admin = false } = {}) {
  return async (request, context) => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return fail('Please sign in again', 401);

      if (admin) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return fail('Admins only', 403);
      }

      let body = {};
      if (request.method !== 'GET') {
        try {
          body = await request.json();
        } catch {
          body = {};
        }
      }
      return await handler({ supabase, user, body, request, params: context?.params || {} });
    } catch (e) {
      console.error(e);
      return fail('Something went wrong. Please try again.', 500);
    }
  };
}

/** Turn a Supabase RPC result into a response. */
export function rpcResult({ data, error }) {
  if (error) return fail(error.message || 'Request failed');
  return ok({ data });
}

export function toAmount(v) {
  const n = Math.round(Number(v) * 100) / 100;
  return Number.isFinite(n) && n > 0 ? n : null;
}
