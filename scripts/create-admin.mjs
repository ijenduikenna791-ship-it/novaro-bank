// Creates (or promotes) the admin account.
// Usage:  npm run create-admin      (reads .env.local)
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL || 'admin@novaro.app';
const password = process.env.ADMIN_PASSWORD || 'NovaroAdmin#2026';
const fullName = process.env.ADMIN_NAME || 'Novaro Admin';

if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function main() {
  let userId;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    if (!/already|registered|exists/i.test(error.message)) throw error;
    const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
    if (!existing) throw error;
    userId = existing.id;
    await supabase.auth.admin.updateUserById(userId, { password, email_confirm: true });
    console.log('Admin user already existed - password reset.');
  } else {
    userId = data.user.id;
    console.log('Admin user created.');
  }

  const { error: upErr } = await supabase
    .from('profiles')
    .update({ role: 'admin', kyc_status: 'verified', full_name: fullName })
    .eq('id', userId);
  if (upErr) throw upErr;

  console.log('\n  Admin login:  /admin/login');
  console.log(`  Email:        ${email}`);
  console.log(`  Password:     ${password}\n`);
}

main().catch((e) => {
  console.error('Failed:', e.message);
  process.exit(1);
});
