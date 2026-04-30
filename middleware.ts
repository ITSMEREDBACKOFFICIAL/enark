import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 1. Refresh session for all requests (Critical for Incognito/Next.js 15)
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // 2. Maintenance Mode Check
  const { data: config } = await supabase
    .from('app_config')
    .select('is_maintenance_mode')
    .eq('id', 'main')
    .single();

  const isAdmin = 
    user?.app_metadata?.role === 'admin' || 
    user?.user_metadata?.role === 'admin' ||
    user?.email?.toLowerCase().trim() === 'boddurunagabushan@gmail.com';

  const isMaintenancePage = request.nextUrl.pathname.startsWith('/maintenance');
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isCommandPage = request.nextUrl.pathname.startsWith('/command');

  if (config?.is_maintenance_mode && !isAdmin && !isCommandPage && !isLoginPage && !isMaintenancePage) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // 3. Protect /command routes
  if (isCommandPage) {
    if (!user || userError) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/command/:path*'],
};
