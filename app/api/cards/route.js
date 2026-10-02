import { withUser, rpcResult } from '@/lib/api';

const THEMES = ['midnight', 'ocean', 'aurora', 'graphite'];

// POST /api/cards  { label, theme }
export const POST = withUser(async ({ supabase, body }) => {
  const theme = THEMES.includes(body.theme) ? body.theme : 'midnight';
  return rpcResult(await supabase.rpc('create_card', { p_label: String(body.label || '').slice(0, 40), p_theme: theme }));
});
