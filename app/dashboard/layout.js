import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BankProvider from '@/components/dashboard/BankProvider';
import Shell from '@/components/dashboard/Shell';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard' };

export default async function DashboardLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: profile }, { data: account }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('accounts').select('*').eq('user_id', user.id).single(),
  ]);

  if (!profile || !account) {
    // Signed in but the database trigger has not created the records (schema not installed?)
    redirect('/login?error=setup');
  }

  return (
    <BankProvider initial={{ profile, account }}>
      <Shell>{children}</Shell>
    </BankProvider>
  );
}
