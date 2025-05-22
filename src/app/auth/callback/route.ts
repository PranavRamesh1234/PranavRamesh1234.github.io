import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';
  const type = requestUrl.searchParams.get('type');

  if (code) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth', requestUrl.origin));
    }

    // If this is a new user (signup), redirect to profile setup
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If no profile exists, redirect to profile setup
      if (!profile) {
        return NextResponse.redirect(new URL('/profile/complete', requestUrl.origin));
      }
    }
  }

  // For existing users or after profile setup, redirect to the stored path or dashboard
  const redirectPath = next === '/profile/complete' ? '/profile/complete' : next;
  
  // Use the original request's origin for the redirect
  const redirectUrl = new URL(redirectPath, requestUrl.origin);
  
  // If it's a password reset, add the type parameter
  if (type === 'reset-password') {
    redirectUrl.searchParams.set('type', 'reset-password');
  }

  return NextResponse.redirect(redirectUrl);
} 