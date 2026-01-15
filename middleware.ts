import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  // Security headers
  // V development režimu povolujeme iframe pro testování (Testsprite)
  if (process.env.NODE_ENV === 'development') {
    // V development necháváme X-Frame-Options volné pro testovací nástroje
    // V produkci zůstane SAMEORIGIN z next.config.js
  } else {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  }
  
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  // Redirect HTTP to HTTPS in production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`)
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
