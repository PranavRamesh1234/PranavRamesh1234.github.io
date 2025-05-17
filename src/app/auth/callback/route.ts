import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Determine where to redirect based on the type
  let redirectUrl = '/profile/complete'; // default for signup
  if (type === 'reset-password') {
    redirectUrl = '/auth/reset-password';
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin));
} 