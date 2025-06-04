import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to handle routing for specific paths
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Handle the /add path specifically
  if (path === '/add') {
    // Redirect to the correct path
    return NextResponse.redirect(new URL('/arts/add', request.url));
  }
  
  // Let all other requests pass through
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: ['/add'],
};
