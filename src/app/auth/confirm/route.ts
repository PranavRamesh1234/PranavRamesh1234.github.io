import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// List of allowed redirect paths
const ALLOWED_PATHS = [
  '/',
  '/profile',
  '/profile/complete',
  '/books',
  '/sell'
];

function isValidRedirectPath(path: string): boolean {
  return ALLOWED_PATHS.includes(path);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/';

  // Validate the redirect path
  if (!isValidRedirectPath(next)) {
    console.error('Invalid redirect path:', next);
    return NextResponse.redirect(new URL('/', requestUrl.origin));
  }

  if (token_hash) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    });

    if (error) {
      console.error('Error verifying OTP:', error);
      return NextResponse.redirect(new URL('/auth?error=invalid_token', requestUrl.origin));
    }

    // For new sign-ups (type === 'signup'), always redirect to profile setup
    if (type === 'signup') {
      return NextResponse.redirect(new URL('/profile/complete', requestUrl.origin));
    }

    // For existing users, check if they have a profile
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

  // For existing users with profiles, redirect to the validated path
  return NextResponse.redirect(new URL(next, requestUrl.origin));
} 