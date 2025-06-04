import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { supabaseClient } from './lib/supabase';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;
  
  // Only apply middleware to /arts/add route
  if (path.startsWith('/arts/add')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    // If user is not logged in, redirect to login page
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(path));
      return NextResponse.redirect(url);
    }
    
    // Check if the user has set a username
    try {
      const supabase = supabaseClient(process.env.SUPABASE_SERVICE_ROLE_KEY || '');
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', token.sub)
        .single();
      
      if (error || !data || !data.username) {
        // Redirect to profile page with a message to set username
        const url = new URL('/profile', request.url);
        url.searchParams.set('message', 'Please set a username before adding arts');
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      // In case of error, still redirect to profile
      return NextResponse.redirect(new URL('/profile', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/arts/add'],
};
